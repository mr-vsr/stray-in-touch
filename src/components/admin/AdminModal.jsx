import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrash, FaTimes, FaSave } from 'react-icons/fa';

const AdminModal = ({ items, collectionName, onClose, onDelete, onUpdate }) => {
    const [editingItem, setEditingItem] = useState(null);
    const [editForm, setEditForm] = useState({});

    const handleEdit = (item) => {
        setEditingItem(item.id);
        setEditForm({ ...item });
    };

    const handleSave = () => {
        if (Object.keys(editForm).length === 0) return;
        onUpdate(editingItem, editForm);
        setEditingItem(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formatKey = (key) => {
        return key
            .split(/(?=[A-Z])/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <AnimatePresence>
            <motion.div
                className="admin-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="admin-modal-content"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                >
                    <div className="admin-modal-header">
                        <h2>{formatKey(collectionName)}</h2>
                        <button className="close-button" onClick={onClose}>
                            <FaTimes />
                        </button>
                    </div>
                    <div className="admin-modal-body">
                        {items.length === 0 ? (
                            <div className="no-items-message">
                                No items found in this collection
                            </div>
                        ) : (
                            items.map(item => (
                                <motion.div 
                                    key={item.id} 
                                    className="admin-item-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    {editingItem === item.id ? (
                                        <div className="edit-form">
                                            {Object.entries(item).map(([key, value]) => (
                                                key !== 'id' && (
                                                    <div key={key} className="form-group">
                                                        <label>{formatKey(key)}</label>
                                                        <input
                                                            name={key}
                                                            value={editForm[key] || ''}
                                                            onChange={handleInputChange}
                                                            placeholder={formatKey(key)}
                                                        />
                                                    </div>
                                                )
                                            ))}
                                            <div className="edit-actions">
                                                <button 
                                                    className="save-button"
                                                    onClick={handleSave}
                                                >
                                                    <FaSave /> Save
                                                </button>
                                                <button 
                                                    className="cancel-button"
                                                    onClick={() => setEditingItem(null)}
                                                >
                                                    <FaTimes /> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="item-details">
                                                {Object.entries(item).map(([key, value]) => (
                                                    key !== 'id' && (
                                                        <div key={key} className="detail-row">
                                                            <span className="detail-label">{formatKey(key)}:</span>
                                                            <span className="detail-value">{value}</span>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                            <div className="item-actions">
                                                <button 
                                                    className="edit-button"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button 
                                                    className="delete-button"
                                                    onClick={() => onDelete(item.id)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AdminModal; 