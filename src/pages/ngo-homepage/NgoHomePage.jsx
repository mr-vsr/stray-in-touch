import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../../auth/firebase-config'; // Ensure correct path
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    query,
    where,
    addDoc,
    Timestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { motion } from 'framer-motion'; // Import motion
import { Loader } from '../../components/index'; // Ensure Loader is imported

// Debounce function (optional, but good for performance with rapid changes)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Utility: Calculate Distance
const getDistance = (lat1, lon1, lat2, lon2) => {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
    const R = 6371; // Earth's radius in KM
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return !isNaN(distance) ? distance : null; // Return null if calculation results in NaN
};

// Utility: Format Date
const formatDate = (timestamp) => {
    if (timestamp && timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString(undefined, {
             year: 'numeric', month: 'short', day: 'numeric'
        });
    }
    return 'N/A';
};

// Utility: Normalize Contact Number
const normalizeContact = (contact) => {
    if (!contact) return '';
    return String(contact).replace(/\D/g, ''); // Removes non-digit characters
};

// Optimized Report Card Component
const ReportCard = React.memo(({ report, ngoLocation, onHelpClick }) => {
    const distance = useMemo(() => {
        return getDistance(
            ngoLocation?.lat,
            ngoLocation?.lng,
            report.latitude,
            report.longitude
        );
    }, [ngoLocation, report.latitude, report.longitude]);

    const distanceText = distance !== null ? `${distance.toFixed(1)} km away` : null;
    const mapLink = report.latitude && report.longitude ? `https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}` : null;

    return (
        <motion.div
            className="info-card" // Use generic info-card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            {report.imageUrl && (
                 <div className="info-card-image-container">
                    <img
                        src={report.imageUrl}
                        alt={report.description || 'Reported animal'}
                        className="info-card-image"
                        loading="lazy" // Lazy load images
                    />
                </div>
            )}
            <span className={`status-badge-corner ${report.status}`}>
                 {report.status}
            </span>

            <div className="info-card-content">
                <p className="info-card-description">{report.description || 'No description provided.'}</p>

                <div className="info-card-details-section">
                    <span className="info-card-detail-name">
                        Reported by: {report.user?.name || 'Anonymous'}
                    </span>
                    <span className="info-card-detail-contact">
                        <i className="fas fa-phone"></i>
                        {report.user?.contact || 'N/A'}
                    </span>
                </div>

                {distanceText && (
                    <div className="info-card-distance">
                        <i className="fas fa-location-arrow"></i>
                        {distanceText}
                    </div>
                )}

                <div className="info-card-meta">
                    <span className="info-card-date">
                        <i className="far fa-clock"></i>
                        {formatDate(report.timestamp)}
                    </span>
                     {mapLink && (
                        <a
                            href={mapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="info-card-map-link"
                            title="View on Google Maps" // Added title for accessibility
                        >
                            <i className="fas fa-map-marker-alt"></i>
                            View Map
                        </a>
                    )}
                </div>

                {report.status === 'pending' && (
                    <div className="info-card-actions">
                        <button
                            className="info-card-button primary button-ripple" // Use generic button classes
                            onClick={() => onHelpClick(report)}
                        >
                            <i className="fas fa-hands-helping"></i>
                            Provide Help
                        </button>
                    </div>
                )}

                 {report.ngo?.name && ( // Display NGO response if available
                    <div className="ngo-response-section">
                        <h4>Help Provided By: {report.ngo.name}</h4>
                        {report.ngo.helpDescription && <p>{report.ngo.helpDescription}</p>}
                        <p>Address: {report.ngo.address || 'N/A'}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
});

function NgoHomePage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [statusFilter, setStatusFilter] = useState('pending'); // Default to pending
    const [currentNgo, setCurrentNgo] = useState(null);
    const [showHelpDialog, setShowHelpDialog] = useState(false);
    const [helpDescription, setHelpDescription] = useState('');
    const [isSubmittingHelp, setIsSubmittingHelp] = useState(false);
    const [ngoLocation, setNgoLocation] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // State for search

    // Fetch Current NGO Details (Memoized)
    const fetchCurrentNgo = useCallback(async () => {
        setError(null);
        try {
            const authInstance = getAuth();
            const currentUser = authInstance.currentUser;
            if (currentUser) {
                const q = query(collection(db, 'NgoInfo'), where('email', '==', currentUser.email));
                const ngoDocSnapshot = await getDocs(q);
                if (!ngoDocSnapshot.empty) {
                    const ngoDoc = ngoDocSnapshot.docs[0];
                    const ngoData = { id: ngoDoc.id, ...ngoDoc.data() };
                    setCurrentNgo(ngoData);
                    // Attempt to get location from address
                    if (ngoData.address) {
                       // Simple check if lat/lng are already stored (ideal)
                       if(ngoData.latitude && ngoData.longitude) {
                           setNgoLocation({ lat: ngoData.latitude, lng: ngoData.longitude });
                       } else {
                           // Fallback: Geocode address (use only if necessary and secure API key)
                           // Consider doing this on the backend or during signup for performance/security
                           console.warn("Geocoding address - consider storing coordinates directly.");
                           // Example with fetch (replace with your geocoding setup)
                           // const response = await fetch(`GEOCODING_API_ENDPOINT?address=${encodeURIComponent(ngoData.address)}&key=YOUR_API_KEY`);
                           // const data = await response.json();
                           // if (data.results?.[0]?.geometry?.location) {
                           //     setNgoLocation(data.results[0].geometry.location);
                           // }
                       }
                    }
                } else {
                    setError("Could not find your NGO details. Please ensure your profile is set up correctly.");
                }
            } else {
                 setError("You must be logged in as an NGO to view this page.");
            }
        } catch (err) {
            console.error("Error fetching NGO details:", err);
            setError("An error occurred while fetching your NGO details.");
        }
    }, []);

    // Fetch Reports (Memoized and Optimized)
    const fetchReportsAndUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch users only once or when needed
            const usersCollection = collection(db, 'users');
            const usersSnapshot = await getDocs(usersCollection);
            const userMap = new Map(usersSnapshot.docs.map(doc => {
                const userData = doc.data();
                const normalizedContact = normalizeContact(userData.contact);
                return normalizedContact ? [normalizedContact, { id: doc.id, ...userData }] : null;
            }).filter(Boolean)); // Filter out null entries if contact is missing


            const reportsCollection = collection(db, 'strayInfo');
            const reportsSnapshot = await getDocs(reportsCollection);

            const reportsList = reportsSnapshot.docs.map(doc => {
                const reportData = doc.data();
                const reportContact = normalizeContact(reportData.contact);
                const userData = userMap.get(reportContact); // Efficient lookup
                const status = reportData.status || 'pending';

                return {
                    id: doc.id,
                    ...reportData,
                    status: status,
                    user: userData || null,
                    timestamp: reportData.timestamp instanceof Timestamp ? reportData.timestamp : null
                };
            });

            setReports(reportsList);

        } catch (err) {
            console.error("Error fetching reports:", err);
            setError("Failed to fetch reports. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array - fetch once

    // Initial Data Load
    useEffect(() => {
        fetchCurrentNgo();
        fetchReportsAndUsers();
    }, [fetchCurrentNgo, fetchReportsAndUsers]);

    // Handle Help Dialog Submission
    const handleHelpSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        if (!selectedReport || !helpDescription.trim() || !currentNgo || isSubmittingHelp) {
            setError("Please provide help description."); // Simplified error
            return;
        }

        setIsSubmittingHelp(true);
        setError(null);

        try {
            const helpDocData = {
                reportId: selectedReport.id,
                ngoId: currentNgo.id,
                ngoName: currentNgo.name,
                ngoAddress: currentNgo.address,
                descriptionOfHelp: helpDescription,
                timestamp: Timestamp.now() // Use Firestore Timestamp
            };
            await addDoc(collection(db, 'helpData'), helpDocData);

            const reportRef = doc(db, 'strayInfo', selectedReport.id);
            await updateDoc(reportRef, {
                status: 'complete',
                ngo: { // Store minimal NGO info needed for display
                    id: currentNgo.id,
                    name: currentNgo.name,
                    address: currentNgo.address,
                    helpDescription: helpDescription // Store description here too if needed
                }
            });

            // Update local state efficiently
            setReports(prevReports => prevReports.map(report =>
                report.id === selectedReport.id
                    ? { ...report, status: 'complete', ngo: helpDocData } // Update with help data
                    : report
            ));

            setShowHelpDialog(false);
            setSelectedReport(null);
            setHelpDescription('');

        } catch (err) {
            console.error("Error submitting help data:", err);
            setError("Failed to submit help details. Please try again.");
        } finally {
            setIsSubmittingHelp(false);
        }
    };

    // Handle clicking "Provide Help"
    const handleHelpClick = (report) => {
        if (!currentNgo?.name || !currentNgo?.address) {
            setError("Please ensure your NGO profile (name and address) is complete before providing help.");
            return;
        }
        setSelectedReport(report);
        setHelpDescription(''); // Reset description
        setShowHelpDialog(true);
        setError(null); // Clear previous dialog errors
    };

    // Debounced search handler
    const debouncedSearch = useCallback(debounce((term) => {
        setSearchTerm(term);
    }, 300), []); // 300ms debounce

    const handleSearchChange = (e) => {
        debouncedSearch(e.target.value);
    };

    // Filter reports based on status and search term
    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            const matchesFilter = statusFilter === 'all' || report.status === statusFilter;
            const matchesSearch = searchTerm === '' ||
                report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.locationDescription?.toLowerCase().includes(searchTerm.toLowerCase()); // Add location search
            return matchesFilter && matchesSearch;
        });
    }, [reports, statusFilter, searchTerm]);


    // Main component render
    if (loading && reports.length === 0) { // Show loader only on initial load
        return (
            <div className='dashboard-container'>
                <div className='dashboard-content'>
                    <Loader type="fullscreen" text="Loading Reports..." />
                </div>
            </div>
        );
    }

    return (
        <div className='dashboard-container'>
            <div className='dashboard-content'>

                {error && !showHelpDialog && ( // Show main errors only if dialog is closed
                    <div className="error-message-text main-error">{error}</div>
                )}

                <section className='dashboard-section'>
                    <div className='dashboard-section-header'>
                        <h2 className='dashboard-section-title'>Available Reports</h2>
                        {/* Add Search Input */}
                        <div className="search-input-container">
                            <input
                                type="text"
                                placeholder="Search reports..."
                                className="form-input" // Use existing form input style
                                onChange={handleSearchChange}
                                aria-label="Search reports by description, reporter, or location"
                            />
                        </div>
                        <div className='filter-button-group'>
                            {['all', 'pending', 'complete'].map(status => (
                                <button
                                    key={status}
                                    className={`filter-button ${statusFilter === status ? 'active' : ''}`}
                                    onClick={() => setStatusFilter(status)}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading && reports.length > 0 && <Loader type="default" size="medium" text="Refreshing..." /> }

                    {!loading && filteredReports.length === 0 ? (
                         <div className='no-data-message'>
                            <i className="fas fa-info-circle"></i>
                            <p>No reports found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className='info-grid'>
                            {filteredReports.map(report => (
                                <ReportCard
                                    key={report.id}
                                    report={report}
                                    ngoLocation={ngoLocation}
                                    onHelpClick={handleHelpClick}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Help Dialog */}
                {showHelpDialog && (
                    <motion.div
                        className='dialog-overlay' // Use overlay class
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }} // Add exit animation
                    >
                        <motion.div
                            className='dialog-content-box' // Use content box class
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }} // Add exit animation
                        >
                             <div className="dialog-header">
                                <h3 className="dialog-title">Provide Help Details</h3>
                                <button
                                    className="dialog-close-button"
                                    onClick={() => setShowHelpDialog(false)}
                                    aria-label="Close help dialog"
                                    disabled={isSubmittingHelp}
                                >
                                    &times;
                                </button>
                             </div>
                            <p className='help-dialog-subtitle'>
                                Helping as: {currentNgo?.name}
                            </p>
                            <form className='help-dialog-form' onSubmit={handleHelpSubmit}>
                                {error && showHelpDialog && ( // Show dialog-specific errors
                                     <div className="error-message-text dialog-error">{error}</div>
                                )}
                                <div className='form-group'>
                                    <label htmlFor="helpDescription" className="form-label">Description of Help</label>
                                    <textarea
                                        id="helpDescription"
                                        placeholder="Describe how your NGO will address this report..."
                                        value={helpDescription}
                                        onChange={(e) => setHelpDescription(e.target.value)}
                                        required
                                        className='form-textarea' // Use generic class
                                        rows={5}
                                        disabled={isSubmittingHelp}
                                    />
                                </div>

                                <div className='dialog-actions'>
                                    <button
                                        type="button"
                                        className='dialog-button-cancel button-secondary' // Use generic classes
                                        onClick={() => setShowHelpDialog(false)}
                                        disabled={isSubmittingHelp}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className='dialog-button-submit button-primary button-ripple' // Use generic classes
                                        disabled={isSubmittingHelp}
                                    >
                                        {isSubmittingHelp ? (
                                             <Loader type="button" size="small" />
                                        ) : (
                                            'Submit Help'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default NgoHomePage;