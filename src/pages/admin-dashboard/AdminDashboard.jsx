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
import { FaFileAlt, FaHandsHelping, FaBuilding, FaUsers, FaEnvelope, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalReports: 0,
        totalHelpProvided: 0,
        totalNgos: 0,
        totalUsers: 0,
        totalSubscribers: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [modalData, setModalData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);

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
            // Add error handling for each collection fetch
            const collections = {
                reports: 'strayInfo',
                help: 'helpData',
                ngos: 'NgoInfo',
                users: 'users',
                subscribers: 'subscribersEmail'
            };

            const stats = {};
            
            for (const [key, collectionName] of Object.entries(collections)) {
                try {
                    const snapshot = await getDocs(collection(db, collectionName));
                    stats[`total${key.charAt(0).toUpperCase() + key.slice(1)}`] = snapshot.size;
                } catch (error) {
                    console.error(`Error fetching ${key}:`, error);
                    stats[`total${key.charAt(0).toUpperCase() + key.slice(1)}`] = 0;
                }
            }

            setStats({
                totalReports: stats.totalReports || 0,
                totalHelpProvided: stats.totalHelp || 0,
                totalNgos: stats.totalNgos || 0,
                totalUsers: stats.totalUsers || 0,
                totalSubscribers: stats.totalSubscribers || 0
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
                subscribers: 'subscribersEmail'
            }[category];

            if (!collectionName) {
                throw new Error('Invalid category');
            }

            const snapshot = await getDocs(collection(db, collectionName));
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                type: category
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
        if (!window.confirm('Are you sure you want to delete this item?')) return;

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
            await deleteDoc(doc(db, collectionName, item.id));
            setModalData(modalData.filter(i => i.id !== item.id));
            await fetchDashboardStats(); // Refresh stats
        } catch (error) {
            console.error('Error deleting item:', error);
            setError('Failed to delete item');
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
                    className="stats-grid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="stat-card">
                        <div className="stat-icon">
                            <FaFileAlt />
                        </div>
                        <div className="stat-info">
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
                </motion.div>

                {showModal && (
                    <div className="admin-modal">
                        <div className="admin-modal-content">
                            <div className="admin-modal-header">
                                <h2>{selectedCategory?.charAt(0).toUpperCase() + selectedCategory?.slice(1)}</h2>
                                <button 
                                    className="close-button" 
                                    onClick={() => setShowModal(false)}
                                    aria-label="Close modal"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="admin-modal-body">
                                {loading ? (
                                    <Loader 
                                        type="default"
                                        size="medium"
                                        text="Loading data..."
                                    />
                                ) : (
                                    modalData.map(item => (
                                        <div key={item.id} className="admin-item-card">
                                            {editItem?.id === item.id ? (
                                                <div className="edit-form">
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
                                                        <h3>{item.name || item.email || 'N/A'}</h3>
                                                        <p>{item.description || item.address || ''}</p>
                                                    </div>
                                                    <div className="item-actions">
                                                        <button 
                                                            onClick={() => setEditItem(item)}
                                                            className={`action-button ${loading ? 'loading' : ''}`}
                                                            disabled={loading}
                                                        >
                                                            {loading ? (
                                                                <Loader 
                                                                    type="button"
                                                                    size="small"
                                                                />
                                                            ) : (
                                                                <FaEdit />
                                                            )}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(item)}
                                                            className={`action-button ${loading ? 'loading' : ''}`}
                                                            disabled={loading}
                                                        >
                                                            {loading ? (
                                                                <Loader 
                                                                    type="button"
                                                                    size="small"
                                                                />
                                                            ) : (
                                                                <FaTrash />
                                                            )}
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))
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