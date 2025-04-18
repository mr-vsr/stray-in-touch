import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db, auth } from '../../auth/firebase-config';
import {Loader} from '../../components/index';
import {
    collection,
    getDocs,
    doc,
    deleteDoc,
    updateDoc,
    query,
    where
} from 'firebase/firestore';
import { FaFileAlt, FaHandsHelping, FaBuilding, FaUsers, FaEnvelope, FaEdit, FaTrash, FaTimes, FaDollarSign } from 'react-icons/fa';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalReports: 0,
        totalHelpProvided: 0,
        totalNgos: 0,
        totalUsers: 0,
        totalSubscribers: 0,
        totalDonations: 0,
        totalDonationAmount: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [modalData, setModalData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            setError(null);
            try {
                const user = auth.currentUser;
                if (!user) {
                    throw new Error('You must be logged in as an admin to access this page');
                }
                await fetchDashboardStats();
            } catch (error) {
                console.error('Initialization error:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        initializeData();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const collections = {
                reports: 'strayInfo',
                help: 'helpData',
                ngos: 'NgoInfo',
                users: 'users',
                subscribers: 'subscribersEmail',
                donations: 'donations'
            };

            const statsPromises = Object.entries(collections).map(async ([key, collectionName]) => {
                try {
                    const snapshot = await getDocs(collection(db, collectionName));
                    if (key === 'donations') {
                        let totalAmount = 0;
                        snapshot.docs.forEach(doc => {
                            const amount = parseFloat(doc.data().amount) || 0;
                            totalAmount += amount;
                        });
                        return {
                            [`total${key.charAt(0).toUpperCase() + key.slice(1)}`]: snapshot.size,
                            totalDonationAmount: Math.round(totalAmount * 100) / 100
                        };
                    } else {
                        return { [`total${key.charAt(0).toUpperCase() + key.slice(1)}`]: snapshot.size };
                    }
                } catch (error) {
                    console.error(`Error fetching ${key}:`, error);
                    if (key === 'donations') {
                        return {
                            [`total${key.charAt(0).toUpperCase() + key.slice(1)}`]: 0,
                            totalDonationAmount: 0
                        };
                    } else {
                        return { [`total${key.charAt(0).toUpperCase() + key.slice(1)}`]: 0 };
                    }
                }
            });

            const results = await Promise.all(statsPromises);
            const combinedStats = results.reduce((acc, current) => ({ ...acc, ...current }), {});

            setStats({
                totalReports: combinedStats.totalReports || 0,
                totalHelpProvided: combinedStats.totalHelp || 0,
                totalNgos: combinedStats.totalNgos || 0,
                totalUsers: combinedStats.totalUsers || 0,
                totalSubscribers: combinedStats.totalSubscribers || 0,
                totalDonations: combinedStats.totalDonations || 0,
                totalDonationAmount: combinedStats.totalDonationAmount || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
            setError('Failed to load dashboard statistics');
        }
    };


    const handleShowMore = async (category) => {
        if (!category) return;

        setLoading(true);
        setError(null);
        setSearchTerm('');
        try {
            const collectionName = {
                reports: 'strayInfo',
                help: 'helpData',
                ngos: 'NgoInfo',
                users: 'users',
                subscribers: 'subscribersEmail',
                donations: 'donations'
            }[category];

            if (!collectionName) {
                throw new Error('Invalid category selected');
            }

            const snapshot = await getDocs(collection(db, collectionName));
            const data = snapshot.docs.map(doc => {
                 const docData = doc.data();
                 const timestamp = docData.timestamp instanceof Date
                    ? docData.timestamp
                    : docData.timestamp?.toDate?.();

                return {
                    id: doc.id,
                    ...docData,
                    type: category,
                    email: category === 'subscribers' ? docData?.email : docData.email,
                    amount: category === 'donations' ? parseFloat(docData.amount) || 0 : undefined,
                    timestamp: timestamp
                };
            });

            setModalData(data);
            setSelectedCategory(category);
            setShowModal(true);
        } catch (error) {
            console.error(`Error fetching ${category} data:`, error);
            setError(`Failed to load ${category} data: ${error.message}`);
            setShowModal(false);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (item) => {
        if (!item.id || !item.type) return;

        if (!window.confirm(`Are you sure you want to delete this ${item.type}? This action cannot be undone.`)) {
            return;
        }

        try {
            const collectionName = {
                reports: 'strayInfo',
                help: 'helpData',
                ngos: 'NgoInfo',
                users: 'users',
                subscribers: 'subscribersEmail',
                donations: 'donations'
            }[item.type];

            if (!collectionName) throw new Error('Invalid item type for deletion');

            await deleteDoc(doc(db, collectionName, item.id));

            setModalData(prevData => prevData.filter(d => d.id !== item.id));

             const statKeyBase = item.type.charAt(0).toUpperCase() + item.type.slice(1);
             const statKey = item.type === 'help' ? 'totalHelpProvided' : `total${statKeyBase}`;


            setStats(prevStats => {
                 const currentCount = prevStats[statKey] || 0;
                 const newStats = {
                     ...prevStats,
                     [statKey]: Math.max(0, currentCount - 1)
                 };
                 // Recalculate donation amount if a donation was deleted
                 if (item.type === 'donations') {
                    let newTotalAmount = 0;
                    modalData.filter(d => d.id !== item.id && d.type === 'donations').forEach(donation => {
                        newTotalAmount += donation.amount || 0;
                    });
                    newStats.totalDonationAmount = Math.round(newTotalAmount * 100) / 100;
                 }
                 return newStats;
            });

        } catch (error) {
            console.error('Error deleting item:', error);
            setError(`Failed to delete ${item.type}: ${error.message}`);
        }
    };


    const handleUpdate = async (item, updatedData) => {
         if (!item?.id || !item?.type || !updatedData) {
            setError('Invalid data for update.');
            return;
        }

        const collectionName = {
             reports: 'strayInfo',
             help: 'helpData',
             ngos: 'NgoInfo',
             users: 'users',
             subscribers: 'subscribersEmail',
             donations: 'donations'
         }[item.type];

        if (!collectionName) {
            setError('Invalid item type for update.');
            return;
        }

        const dataToUpdate = {};
        if (item.type === 'donations') {
             if (updatedData.amount !== undefined && updatedData.amount !== item.amount) {
                 dataToUpdate.amount = updatedData.amount;
             }
        } else if (item.type === 'subscribers') {
             if (updatedData.email !== undefined && updatedData.email !== item.email) {
                 dataToUpdate.email = updatedData.email;
             }
        }
        else {
             if (updatedData.name !== undefined && updatedData.name !== item.name) {
                 dataToUpdate.name = updatedData.name;
             }
             if (updatedData.email !== undefined && updatedData.email !== item.email) {
                 dataToUpdate.email = updatedData.email;
             }
        }

        if (Object.keys(dataToUpdate).length === 0) {
            setEditItem(null);
            return;
        }

        try {
            await updateDoc(doc(db, collectionName, item.id), dataToUpdate);
            setModalData(prevModalData =>
                prevModalData.map(i =>
                    i.id === item.id ? { ...i, ...dataToUpdate } : i
                )
            );
            setEditItem(null);
             // Recalculate donation amount if amount was updated
            if (item.type === 'donations' && dataToUpdate.amount !== undefined) {
                await fetchDashboardStats(); // Refetch stats to update total amount accurately
            }
        } catch (error) {
            console.error('Error updating item:', error);
            setError(`Failed to update ${item.type}: ${error.message}`);
        }
    };


    const filteredModalData = modalData.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        if (!searchTerm) return true;

        switch (selectedCategory) {
            case 'subscribers':
                return item.email?.toLowerCase().includes(searchLower);
            case 'users':
                return (
                    item.name?.toLowerCase().includes(searchLower) ||
                    item.email?.toLowerCase().includes(searchLower) ||
                    item.contact?.toString().toLowerCase().includes(searchLower)
                );
            case 'ngos':
                return (
                    item.name?.toLowerCase().includes(searchLower) ||
                    item.email?.toLowerCase().includes(searchLower) ||
                    item.contact?.toString().toLowerCase().includes(searchLower) ||
                    item.address?.toLowerCase().includes(searchLower)
                );
            case 'donations':
                return (
                    item.userName?.toLowerCase().includes(searchLower) ||
                    item.paymentId?.toLowerCase().includes(searchLower) ||
                    item.amount?.toString().includes(searchLower)
                );
            case 'reports':
                return (
                    item.description?.toLowerCase().includes(searchLower) ||
                    item.locationDescription?.toLowerCase().includes(searchLower) ||
                    item.contact?.toString().toLowerCase().includes(searchLower) ||
                    item.informant?.toLowerCase().includes(searchLower)
                );
            case 'help':
                return (
                    item.ngoName?.toLowerCase().includes(searchLower) ||
                    item.descriptionOfHelp?.toLowerCase().includes(searchLower) ||
                    item.ngoAddress?.toLowerCase().includes(searchLower)
                );
            default:
                return Object.values(item).some(val =>
                    typeof val === 'string' && val.toLowerCase().includes(searchLower)
                );
        }
    });

    if (loading && !showModal) {
        return (
            <div className="admin-dashboard-container centered-container">
                <Loader
                    type="default"
                    size="large"
                    text="Loading Dashboard..."
                />
            </div>
        );
    }

     if (error && !showModal) {
        return (
            <div className="admin-dashboard-container centered-container">
                <div className="error-message-card">
                    <h2><i className="fas fa-exclamation-triangle"></i> Error Loading Dashboard</h2>
                    <p>{error}</p>
                    <button
                        className="button-primary"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-container">
            <div className="admin-dashboard-content">
                <h1>Admin Dashboard</h1>
                 {error && showModal && (
                    <div className="error-message-inline">{error}</div>
                 )}

                <motion.div
                    className="admin-dashboard-stats-grid"
                    initial="hidden" // Changed initial state name
                    animate="visible" // Changed animate state name
                    variants={{ // Defined variants container
                        visible: { transition: { staggerChildren: 0.07 } } // Stagger animation defined here
                    }}
                >
                    <motion.div className="admin-dashboard-stat-card" variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                        <div className="admin-dashboard-stat-icon report-icon"><FaFileAlt /></div>
                        <div className="admin-dashboard-stat-info">
                            <h3>Total Reports</h3>
                            <p>{stats.totalReports}</p>
                        </div>
                        <button className="show-more-button" onClick={() => handleShowMore('reports')} aria-label="Show more reports">Show More</button>
                    </motion.div>

                    <motion.div className="admin-dashboard-stat-card" variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                        <div className="admin-dashboard-stat-icon help-icon"><FaHandsHelping /></div>
                        <div className="admin-dashboard-stat-info">
                            <h3>Help Provided</h3>
                            <p>{stats.totalHelpProvided}</p>
                        </div>
                        <button className="show-more-button" onClick={() => handleShowMore('help')} aria-label="Show more help records">Show More</button>
                    </motion.div>

                    <motion.div className="admin-dashboard-stat-card" variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                        <div className="admin-dashboard-stat-icon ngo-icon"><FaBuilding /></div>
                        <div className="admin-dashboard-stat-info">
                            <h3>NGOs Registered</h3>
                            <p>{stats.totalNgos}</p>
                        </div>
                        <button className="show-more-button" onClick={() => handleShowMore('ngos')} aria-label="Show more NGOs">Show More</button>
                    </motion.div>

                    <motion.div className="admin-dashboard-stat-card" variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                        <div className="admin-dashboard-stat-icon user-icon"><FaUsers /></div>
                        <div className="admin-dashboard-stat-info">
                            <h3>Total Users</h3>
                            <p>{stats.totalUsers}</p>
                        </div>
                        <button className="show-more-button" onClick={() => handleShowMore('users')} aria-label="Show more users">Show More</button>
                    </motion.div>

                    <motion.div className="admin-dashboard-stat-card" variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                        <div className="admin-dashboard-stat-icon subscriber-icon"><FaEnvelope /></div>
                        <div className="admin-dashboard-stat-info">
                            <h3>Subscribers</h3>
                            <p>{stats.totalSubscribers}</p>
                        </div>
                        <button className="show-more-button" onClick={() => handleShowMore('subscribers')} aria-label="Show more subscribers">Show More</button>
                    </motion.div>

                    <motion.div className="admin-dashboard-stat-card" variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                        <div className="admin-dashboard-stat-icon donation-icon"><FaDollarSign /></div>
                        <div className="admin-dashboard-stat-info">
                            <h3>Total Donations</h3>
                            <p>Count: {stats.totalDonations}</p>
                            <p className="amount-text">Amount: ₹{stats.totalDonationAmount.toLocaleString('en-IN')}</p>
                        </div>
                        <button className="show-more-button" onClick={() => handleShowMore('donations')} aria-label="Show more donations">Show More</button>
                    </motion.div>
                </motion.div>

                {showModal && (
                    <motion.div
                        className="admin-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            setShowModal(false);
                            setModalData([]);
                            setSelectedCategory(null);
                            setSearchTerm('');
                            setEditItem(null);
                            setError(null);
                        }}
                    >
                        <motion.div
                            className="admin-modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="admin-modal-header">
                                <h2>{selectedCategory?.charAt(0).toUpperCase() + selectedCategory?.slice(1)} Details</h2>
                                <button
                                    className="admin-modal-close-button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setModalData([]);
                                        setSelectedCategory(null);
                                        setSearchTerm('');
                                        setEditItem(null);
                                        setError(null);
                                    }}
                                    aria-label="Close modal"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="admin-modal-controls">
                                <input
                                    type="text"
                                    placeholder={`Search ${selectedCategory}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="admin-search-input"
                                />
                            </div>

                            <div className="admin-modal-body">
                                {loading ? (
                                    <Loader type="inline" size="medium" text={`Loading ${selectedCategory}...`} />
                                ) : filteredModalData.length > 0 ? (
                                    filteredModalData.map(item => (
                                        <div key={item.id} className="admin-item-card">
                                            {editItem?.id === item.id ? (
                                                <div className="admin-edit-form">
                                                    <h4>Edit {item.type}</h4>
                                                    {item.type === 'donations' && (
                                                         <div className="form-group">
                                                            <label>Amount (₹):</label>
                                                            <input type="number" value={editItem.amount || ''} onChange={(e) => setEditItem({...editItem, amount: parseFloat(e.target.value) || 0})} />
                                                        </div>
                                                    )}
                                                     {item.type === 'subscribers' && (
                                                         <div className="form-group">
                                                            <label>Email:</label>
                                                            <input type="email" value={editItem.email || ''} onChange={(e) => setEditItem({...editItem, email: e.target.value})} />
                                                        </div>
                                                    )}
                                                    {(item.type === 'users' || item.type === 'ngos') && (
                                                         <>
                                                            <div className="form-group">
                                                                <label>Name:</label>
                                                                <input type="text" value={editItem.name || ''} onChange={(e) => setEditItem({...editItem, name: e.target.value})} />
                                                            </div>
                                                            <div className="form-group">
                                                                <label>Email:</label>
                                                                <input type="email" value={editItem.email || ''} onChange={(e) => setEditItem({...editItem, email: e.target.value})} />
                                                            </div>
                                                        </>
                                                    )}

                                                    <div className="edit-actions">
                                                        <button className="button-primary" onClick={() => handleUpdate(item, editItem)}>Save</button>
                                                        <button className="button-secondary" onClick={() => setEditItem(null)}>Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="item-details">
                                                        {selectedCategory === 'donations' && (
                                                            <>
                                                                <p><strong>Amount:</strong> ₹{item.amount?.toLocaleString('en-IN')}</p>
                                                                <p><strong>User:</strong> {item.userName || 'N/A'}</p>
                                                                <p><strong>Email:</strong> {item.email || 'N/A'}</p>
                                                                <p><strong>Payment ID:</strong> {item.paymentId || 'N/A'}</p>
                                                                <p><strong>Date:</strong> {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}</p>
                                                            </>
                                                        )}
                                                        {selectedCategory === 'reports' && (
                                                            <>
                                                                <p><strong>Reporter:</strong> {item.informant || 'Anonymous'}</p>
                                                                <p><strong>Contact:</strong> {item.contact || 'N/A'}</p>
                                                                <p><strong>Description:</strong> {item.description || 'N/A'}</p>
                                                                <p><strong>Location:</strong> {item.locationDescription || 'N/A'}</p>
                                                                <p><strong>Status:</strong> {item.status || 'pending'}</p>
                                                                <p><strong>Date:</strong> {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}</p>
                                                            </>
                                                        )}
                                                        {selectedCategory === 'help' && (
                                                            <>
                                                                <p><strong>NGO Name:</strong> {item.ngoName || 'N/A'}</p>
                                                                <p><strong>Help Desc:</strong> {item.descriptionOfHelp || 'N/A'}</p>
                                                                <p><strong>NGO Address:</strong> {item.ngoAddress || 'N/A'}</p>
                                                                <p><strong>Report ID:</strong> {item.reportId || 'N/A'}</p>
                                                                <p><strong>Date:</strong> {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}</p>
                                                            </>
                                                        )}
                                                        {selectedCategory === 'ngos' && (
                                                            <>
                                                                <p><strong>Name:</strong> {item.name || 'N/A'}</p>
                                                                <p><strong>Email:</strong> {item.email || 'N/A'}</p>
                                                                <p><strong>Contact:</strong> {item.contact || 'N/A'}</p>
                                                                <p><strong>Address:</strong> {item.address || 'N/A'}</p>
                                                            </>
                                                        )}
                                                        {selectedCategory === 'users' && (
                                                            <>
                                                                <p><strong>Name:</strong> {item.name || 'N/A'}</p>
                                                                <p><strong>Email:</strong> {item.email || 'N/A'}</p>
                                                                <p><strong>Contact:</strong> {item.contact || 'N/A'}</p>
                                                            </>
                                                        )}
                                                         {selectedCategory === 'subscribers' && (
                                                            <p><strong>Email:</strong> {item.email || 'N/A'}</p>
                                                        )}
                                                    </div>
                                                    <div className="item-actions">
                                                         {(selectedCategory === 'users' || selectedCategory === 'ngos' || selectedCategory === 'subscribers' || selectedCategory === 'donations') && (
                                                            <button onClick={() => setEditItem({ ...item })} className="action-button edit-button" aria-label="Edit item"><FaEdit /></button>
                                                        )}
                                                        <button onClick={() => handleDelete(item)} className="action-button delete-button" aria-label="Delete item"><FaTrash /></button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-data-message">No {selectedCategory} found{searchTerm ? ' matching your search' : ''}.</p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;