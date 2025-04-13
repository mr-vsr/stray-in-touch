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
                // Check if user is authenticated
                const user = auth.currentUser;
                if (!user) {
                    throw new Error('You must be logged in to access this page');
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
    
            const stats = {};
            
            for (const [key, collectionName] of Object.entries(collections)) {
                try {
                    const snapshot = await getDocs(collection(db, collectionName));
                    if (key === 'donations') {
                        stats.totalDonations = snapshot.size;
                        let totalAmount = 0;
                        snapshot.docs.forEach(doc => {
                            const amount = parseFloat(doc.data().amount) || 0;
                            totalAmount += amount;
                        });
                        stats.totalDonationAmount = Math.round(totalAmount * 100) / 100; // Round to 2 decimal places
                    } else {
                        stats[`total${key.charAt(0).toUpperCase() + key.slice(1)}`] = snapshot.size;
                    }
                } catch (error) {
                    console.error(`Error fetching ${key}:`, error);
                    stats[`total${key.charAt(0).toUpperCase() + key.slice(1)}`] = 0;
                }
            }
    
            setStats({
                ...stats,
                totalReports: stats.totalReports || 0,
                totalHelpProvided: stats.totalHelp || 0,
                totalNgos: stats.totalNgos || 0,
                totalUsers: stats.totalUsers || 0,
                totalSubscribers: stats.totalSubscribers || 0,
                totalDonations: stats.totalDonations || 0,
                totalDonationAmount: stats.totalDonationAmount || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
            setError('Failed to load dashboard statistics');
            throw error;
        }
    };

    const handleShowMore = async (category) => {
        if (!category) return;
        
        setLoading(true);
        setError(null);
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
                throw new Error('Invalid category');
            }

            const snapshot = await getDocs(collection(db, collectionName));
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                type: category,
                // Ensure email field is properly mapped for subscribers
                email: category === 'subscribers' ? doc.data().Email : doc.data().email
            }));
            setModalData(data);
            setSelectedCategory(category);
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(`Failed to load ${category} data: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (item) => {
        if (!item.id || !item.type) return;
        
        try {
            const collectionName = {
                reports: 'strayInfo',
                help: 'helpData',
                ngos: 'NgoInfo',
                users: 'users',
                subscribers: 'subscribersEmail',
                donations: 'donations'
            }[item.type];

            await deleteDoc(doc(db, collectionName, item.id));
            
            // Update modal data and stats
            setModalData(prevData => prevData.filter(d => d.id !== item.id));
            setStats(prevStats => ({
                ...prevStats,
                [`total${item.type.charAt(0).toUpperCase() + item.type.slice(1)}s`]: prevStats[`total${item.type.charAt(0).toUpperCase() + item.type.slice(1)}s`] - 1
            }));
        } catch (error) {
            console.error('Error deleting item:', error);
            setError(`Failed to delete ${item.type}`);
        }
    };

    const handleUpdate = async (item, updatedData) => {
        try {
            let collectionName = '';
            switch (item.type) {
                case 'report':
                    collectionName = 'strayInfo';
                    break;
                case 'help':
                    collectionName = 'helpData';
                    break;
                case 'ngo':
                    collectionName = 'NgoInfo';
                    break;
                case 'user':
                    collectionName = 'users';
                    break;
                case 'subscriber':
                    collectionName = 'subscribersEmail';
                    break;
                default:
                    throw new Error('Invalid item type');
            }

            await updateDoc(doc(db, collectionName, item.id), updatedData);
            setModalData(modalData.map(i => i.id === item.id ? { ...i, ...updatedData } : i));
            setEditItem(null);
        } catch (error) {
            console.error('Error updating item:', error);
            setError('Failed to update item');
        }
    };

    // Add filteredModalData before the loading check
    const filteredModalData = modalData.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        if (!searchTerm) return true;

        switch (selectedCategory) {
            case 'subscribers':
                return item.Email?.toLowerCase().includes(searchLower);
            case 'users':
                return (
                    item.name?.toLowerCase().includes(searchLower) ||
                    item.email?.toLowerCase().includes(searchLower) ||
                    item.contact?.toLowerCase().includes(searchLower)
                );
            case 'ngos':
                return (
                    item.name?.toLowerCase().includes(searchLower) ||
                    item.email?.toLowerCase().includes(searchLower) ||
                    item.contact?.toLowerCase().includes(searchLower)
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
                    item.contact?.toLowerCase().includes(searchLower)
                );
            case 'help':
                return (
                    item.descriptionOfHelp?.toLowerCase().includes(searchLower) ||
                    item.actionsTaken?.toLowerCase().includes(searchLower)
                );
            default:
                return Object.values(item).some(val => 
                    val?.toString().toLowerCase().includes(searchLower)
                );
        }
    });

    if (loading) {
        return (
            <div className="admin-dashboard-container">
                <Loader 
                    type="default"
                    size="large"
                    text="Loading dashboard data..."
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard-container">
                <div className="admin-dashboard-content">
                    <div className="error-message">
                        <h2>Error Loading Dashboard</h2>
                        <p>{error}</p>
                        <button 
                            className="retry-button"
                            onClick={() => fetchDashboardStats()}
                        >
                            Retry Loading
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-container">
            <div className="admin-dashboard-content">
                <motion.div
                    className="admin-dashboard-stats-grid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="admin-dashboard-stat-card">
                        <div className="admin-dashboard-stat-icon">
                            <FaFileAlt />
                        </div>
                        <div className="admin-dashboard-stat-info">
                            <h3>Total Reports</h3>
                            <p>{stats.totalReports}</p>
                        </div>
                        <button 
                            className="show-more-button" 
                            onClick={() => handleShowMore('reports')}
                            aria-label="Show more reports"
                        >
                            Show More
                        </button>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <FaHandsHelping />
                        </div>
                        <div className="stat-info">
                            <h3>Help Provided</h3>
                            <p>{stats.totalHelpProvided}</p>
                        </div>
                        <button 
                            className="show-more-button" 
                            onClick={() => handleShowMore('help')}
                            aria-label="Show more help records"
                        >
                            Show More
                        </button>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <FaBuilding />
                        </div>
                        <div className="stat-info">
                            <h3>NGOs Registered</h3>
                            <p>{stats.totalNgos}</p>
                        </div>
                        <button 
                            className="show-more-button" 
                            onClick={() => handleShowMore('ngos')}
                            aria-label="Show more NGOs"
                        >
                            Show More
                        </button>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <FaUsers />
                        </div>
                        <div className="stat-info">
                            <h3>Total Users</h3>
                            <p>{stats.totalUsers}</p>
                        </div>
                        <button 
                            className="show-more-button" 
                            onClick={() => handleShowMore('users')}
                            aria-label="Show more users"
                        >
                            Show More
                        </button>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <FaEnvelope />
                        </div>
                        <div className="stat-info">
                            <h3>Subscribers</h3>
                            <p>{stats.totalSubscribers}</p>
                        </div>
                        <button 
                            className="show-more-button" 
                            onClick={() => handleShowMore('subscribers')}
                            aria-label="Show more subscribers"
                        >
                            Show More
                        </button>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <FaDollarSign />
                        </div>
                        <div className="stat-info">
                            <h3>Total Donations</h3>
                            <p>Count: {stats.totalDonations}</p>
                            <p className="amount-text">Total: ₹{stats.totalDonationAmount.toLocaleString()}</p>
                        </div>
                        <button 
                            className="show-more-button" 
                            onClick={() => handleShowMore('donations')}
                            aria-label="Show more donations"
                        >
                            Show More
                        </button>
                    </div>
                </motion.div>

                {showModal && (
                    <div className="admin-modal">
                        <div className="admin-modal-content">
                            <div className="admin-modal-header">
                                <h2>{selectedCategory?.charAt(0).toUpperCase() + selectedCategory?.slice(1)} Details</h2>
                                <button 
                                    className="close-button" 
                                    onClick={() => {
                                        setShowModal(false);
                                        setModalData([]);
                                        setSelectedCategory(null);
                                        setSearchTerm('');
                                    }}
                                    aria-label="Close modal"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="admin-modal-search">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="admin-search-input"
                                />
                            </div>
                            <div className="admin-modal-body">
                                {loading ? (
                                    <Loader type="default" size="medium" text="Loading data..." />
                                ) : filteredModalData.length > 0 ? (
                                    filteredModalData.map(item => (
                                        <div key={item.id} className="admin-item-card">
                                            {editItem?.id === item.id ? (
                                                <div className="edit-form">
                                                    {selectedCategory === 'donations' ? (
                                                        <>
                                                            <input
                                                                type="number"
                                                                value={editItem.amount || ''}
                                                                onChange={(e) => setEditItem({
                                                                    ...editItem,
                                                                    amount: parseFloat(e.target.value)
                                                                })}
                                                                placeholder="Enter amount"
                                                            />
                                                        </>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={editItem.name || editItem.email || ''}
                                                            onChange={(e) => setEditItem({
                                                                ...editItem,
                                                                name: e.target.value,
                                                                email: e.target.value
                                                            })}
                                                            placeholder="Enter name or email"
                                                        />
                                                    )}
                                                    <div className="edit-actions">
                                                        <button onClick={() => handleUpdate(item, editItem)}>
                                                            Save
                                                        </button>
                                                        <button onClick={() => setEditItem(null)}>
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="item-details">
                                                        {selectedCategory === 'donations' ? (
                                                            <>
                                                                <h3>₹{item.amount}</h3>
                                                                <p>User: {item.userName || 'Anonymous'}</p>
                                                                <p>Date: {new Date(item.timestamp?.toDate()).toLocaleDateString()}</p>
                                                            </>
                                                        ) : selectedCategory === 'reports' ? (
                                                            <>
                                                                <h3>{item.informant || 'Anonymous'}</h3>
                                                                <p>Description: {item.description || 'No description'}</p>
                                                                <p>Location: {item.locationDescription || 'Location not specified'}</p>
                                                                <p>Contact: {item.contact || 'No contact provided'}</p>
                                                                <p>Date: {new Date(item.timestamp?.toDate()).toLocaleDateString()}</p>
                                                            </>
                                                        ) : selectedCategory === 'help' ? (
                                                            <>
                                                                <h3>{item.ngoName || 'NGO Name Not Provided'}</h3>
                                                                <p>Description: {item.descriptionOfHelp || 'No description provided'}</p>
                                                                <p>NGO Address: {item.ngoAddress || 'Address not specified'}</p>
                                                                <p>Date: {new Date(item.timestamp?.toDate()).toLocaleDateString()}</p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <h3>{item.name || item.email || 'N/A'}</h3>
                                                                <p>{item.description || item.address || ''}</p>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="item-actions">
                                                        <button 
                                                            onClick={() => setEditItem(item)}
                                                            className="action-button"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(item)}
                                                            className="action-button"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-data-message">No {selectedCategory} data available</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;