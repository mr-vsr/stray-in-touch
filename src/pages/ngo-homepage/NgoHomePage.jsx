import React, { useState, useEffect } from 'react';
import { db } from '../../auth/firebase-config';
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

function NgoHomePage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // State for user-facing errors
    const [selectedReport, setSelectedReport] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all'); // Default to 'pending' might be better UX
    const [currentNgo, setCurrentNgo] = useState(null);
    const [showHelpDialog, setShowHelpDialog] = useState(false);
    const [helpData, setHelpData] = useState({
        description: ''
    });
    const [isSubmittingHelp, setIsSubmittingHelp] = useState(false); // Loading state for help submission


    // Fetch Current NGO Details
    useEffect(() => {
        const fetchCurrentNgo = async () => {
            setError(null);
            try {
                const auth = getAuth();
                const currentUser = auth.currentUser;
                if (currentUser) {
                    const q = query(collection(db, 'NgoInfo'), where('email', '==', currentUser.email));
                    const ngoDocSnapshot = await getDocs(q);
                    if (!ngoDocSnapshot.empty) {
                         // Get data and ID
                        const ngoDoc = ngoDocSnapshot.docs[0];
                        setCurrentNgo({ id: ngoDoc.id, ...ngoDoc.data() });
                    } else {
                        console.warn("No NGO document found for email:", currentUser.email);
                         setError("Could not find your NGO details. Please ensure your profile is set up.");
                    }
                } else {
                     console.warn("No logged-in user found.");
                    // Handle case where user is not logged in (maybe redirect?)
                }
            } catch (error) {
                console.error("Error fetching NGO details:", error);
                setError("An error occurred while fetching your NGO details.");
            }
        };
        fetchCurrentNgo();
    }, []);


    // Fetch Reports (Optimized)
    useEffect(() => {
        const fetchReportsAndUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Fetch all users ONCE
                const usersCollection = collection(db, 'users');
                const usersSnapshot = await getDocs(usersCollection);
                const userMap = new Map(); // Use a Map for efficient lookups

                // Helper to normalize contact numbers
                 const normalizeContact = (contact) => {
                    if (!contact) return '';
                    // Removes non-digit characters
                    return String(contact).replace(/\D/g, '');
                };


                usersSnapshot.docs.forEach(doc => {
                    const userData = doc.data();
                    const normalizedContact = normalizeContact(userData.contact);
                    if (normalizedContact) {
                        userMap.set(normalizedContact, { id: doc.id, ...userData });
                    }
                });

                // 2. Fetch all reports
                const reportsCollection = collection(db, 'strayInfo');
                const reportsSnapshot = await getDocs(reportsCollection);

                // 3. Map reports and lookup users efficiently
                const reportsList = reportsSnapshot.docs.map(doc => {
                    const reportData = doc.data();
                    const reportContact = normalizeContact(reportData.contact); // Use reportData.contact
                    const userData = reportContact ? userMap.get(reportContact) : null; // Efficient lookup

                    // Default status if missing (should be set on creation ideally)
                    const status = reportData.status || 'pending';

                    return {
                        id: doc.id,
                        ...reportData,
                        status: status, // Ensure status exists
                        user: userData, // Attach fetched user data (or null)
                        // Ensure timestamp is handled correctly (it's an object)
                        timestamp: reportData.timestamp instanceof Timestamp ? reportData.timestamp : null
                    };
                });

                setReports(reportsList);

            } catch (error) {
                console.error("Error fetching reports:", error);
                setError("Failed to fetch reports. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchReportsAndUsers();
    }, []); // Runs once on mount

    // Handle Help Dialog Submission
    const handleHelpSubmit = async () => {
        if (!selectedReport || !helpData.description || !currentNgo || isSubmittingHelp) {
            setError("Please provide help description and ensure you're logged in as an NGO.");
            return;
        }

        setIsSubmittingHelp(true);
        setError(null);

        try {
            // Add help data to helpData collection
            await addDoc(collection(db, 'helpData'), {
                reportId: selectedReport.id,
                ngoId: currentNgo.id,
                ngoName: currentNgo.name,
                ngoAddress: currentNgo.address,
                descriptionOfHelp: helpData.description,
                timestamp: new Date()
            });

            // Update report status to complete
            const reportRef = doc(db, 'strayInfo', selectedReport.id);
            await updateDoc(reportRef, {
                status: 'complete',
                ngo: {
                    id: currentNgo.id,
                    name: currentNgo.name,
                    address: currentNgo.address,
                    helpDescription: helpData.description
                }
            });

            // Update local state
            setReports(reports.map(report =>
                report.id === selectedReport.id
                    ? {
                        ...report,
                        status: 'complete',
                        ngo: {
                            id: currentNgo.id,
                            name: currentNgo.name,
                            address: currentNgo.address,
                            helpDescription: helpData.description
                        }
                    }
                    : report
            ));

            // Reset form and close dialog
            setShowHelpDialog(false);
            setSelectedReport(null);
            setHelpData({ description: '' });

        } catch (error) {
            console.error("Error submitting help data:", error);
            setError("Failed to submit help details. Please try again.");
        } finally {
            setIsSubmittingHelp(false);
        }
    };

    // Handle clicking the "Provide Help" button
    const handleHelpClick = (report) => {
        if (!currentNgo?.name || !currentNgo?.address) {
            setError("Please complete your NGO profile before providing help.");
            return;
        }
        setSelectedReport(report);
        setHelpData({ description: '' });
        setShowHelpDialog(true);
    };

    // Filter reports based on status
    const filteredReports = reports.filter(report =>
        statusFilter === 'all' ? true : report.status === statusFilter
    );

    // Format Timestamp for display
    const formatDate = (timestamp) => {
        if (timestamp && timestamp.toDate) {
            return timestamp.toDate().toLocaleDateString(undefined, { // Use locale default format
                 year: 'numeric', month: 'short', day: 'numeric'
            });
        }
        return 'Date not available';
    };

    if (loading) {
        return (
            <div className='ngo-homepage-container'>
                <div className='ngo-homepage-content'>
                    <div className='loading-spinner'>
                        <div className='spinner'></div>
                        <p>Loading Reports...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='ngo-homepage-container'>
            <div className='ngo-homepage-content'>
                {error && <div className="error-message main-error">{error}</div>}
                <section className='reports-section'>
                    <div className='reports-header'>
                        <h2>Reports</h2>
                        <div className='status-filter'>
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

                    {filteredReports.length === 0 ? (
                        <p className='no-reports'>No reports found for the selected filter.</p>
                    ) : (
                        <div className='reports-grid'>
                            {filteredReports.map(report => (
                                <div key={report.id} className='report-card dark-theme'> {/* Ensure styles exist */}
                                    <div className='report-header'>
                                        {/* Use locationDescription or description as title */}
                                        <h3 className='report-title'>{report.locationDescription || 'Report'}</h3>
                                        <span className={`report-status ${report.status}`}>
                                            {report.status}
                                        </span>
                                    </div>
                                    {report.imageUrl && (
                                        <div className='report-image-container'>
                                            <img
                                                src={report.imageUrl}
                                                alt="Stray animal report"
                                                className='report-image'
                                            />
                                        </div>
                                    )}
                                    <div className='report-content'>
                                        <p className='report-description'>{report.description}</p>
                                        <div className='report-meta'>
                                            <span className='report-location'>
                                                <i className="fas fa-map-marker-alt"></i> {report.locationDescription}
                                            </span>
                                            {/* Display formatted date */}
                                            <span className='report-date'>
                                                <i className="fas fa-calendar"></i> {formatDate(report.timestamp)}
                                            </span>
                                            {/* Display contact info if available */}
                                            {report.contact && (
                                                <span className='report-contact'>
                                                    <i className="fas fa-phone"></i> {report.contact}
                                                </span>
                                            )}
                                        </div>
                                         {/* Optional: Display Map Link */}
                                        {report.latitude && report.longitude && (
                                            <div className='map-link-container'>
                                                <a
                                                    href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className='map-link'
                                                >
                                                     <i className="fas fa-external-link-alt"></i> View Map
                                                </a>
                                            </div>
                                        )}
                                        {/* Action Button */}
                                        {report.status === 'pending' && (
                                            <div className='report-actions'>
                                                <button
                                                    className='help-button'
                                                    onClick={() => handleHelpClick(report)}
                                                    disabled={isSubmittingHelp} // Disable if any submission is in progress
                                                >
                                                    <i className="fas fa-hands-helping"></i> Provide Help
                                                </button>
                                            </div>
                                        )}
                                        {/* NGO Response Details */}
                                        {report.status === 'complete' && report.ngo && (
                                            <div className='ngo-response'>
                                                <h4>NGO Response:</h4>
                                                <p><strong>NGO:</strong> {report.ngo.name}</p>
                                                <p><strong>Address:</strong> {report.ngo.address}</p>
                                                {/* *** Display the correct help description *** */}
                                                <p><strong>Action Taken:</strong> {report.ngo.helpDescription || 'Details not provided'}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Help Dialog */}
                {showHelpDialog && (
                    <div className='help-dialog'>
                        <div className='help-dialog-content'>
                            <h3>Provide Help Details</h3>
                            <p className='help-dialog-subtitle'>
                                NGO: {currentNgo?.name}
                            </p>
                            <form className='help-form' onSubmit={(e) => {
                                e.preventDefault();
                                handleHelpSubmit();
                            }}>
                                {error && <div className="error-message dialog-error">{error}</div>}

                                <div className='help-form-group'>
                                    <label htmlFor="description">Description of Help to be Provided</label>
                                    <textarea
                                        id="description"
                                        placeholder="Please describe how you will help with this situation..."
                                        value={helpData.description}
                                        onChange={(e) => setHelpData({ description: e.target.value })}
                                        required
                                        className='help-textarea'
                                        rows={5}
                                    />
                                </div>

                                <div className='help-dialog-buttons'>
                                    <button 
                                        type="button" 
                                        className='help-cancel-button' 
                                        onClick={() => {
                                            setShowHelpDialog(false);
                                            setSelectedReport(null);
                                            setHelpData({ description: '' });
                                            setError(null);
                                        }}
                                        disabled={isSubmittingHelp}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className='help-submit-button' 
                                        disabled={isSubmittingHelp}
                                    >
                                        {isSubmittingHelp ? 'Submitting...' : 'Submit Help Details'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default NgoHomePage;