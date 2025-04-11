import React, { useState, useEffect } from 'react';
import { Header, Footer } from '../../components/index.js';
import { db } from '../../auth/firebase-config';
import { collection, getDocs, doc, updateDoc, query, where, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// const CLOUDINARY_CLOUD_NAME = 'hzxyensd5';
// const CLOUDINARY_UPLOAD_PRESET = 'aoh4fpwm';

function NgoHomePage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentNgo, setCurrentNgo] = useState(null);
    const [showHelpDialog, setShowHelpDialog] = useState(false);
    const [helpData, setHelpData] = useState({
        description: '',
        ngoName: '',
        ngoAddress: ''
    });

    useEffect(() => {
        const fetchCurrentNgo = async () => {
            try {
                const auth = getAuth();
                const currentUser = auth.currentUser;
                if (currentUser) {
                    const ngoDoc = await getDocs(query(collection(db, 'NgoInfo'), where('email', '==', currentUser.email)));
                    if (!ngoDoc.empty) {
                        setCurrentNgo(ngoDoc.docs[0].data());
                    }
                }
            } catch (error) {
                console.error("Error fetching NGO details:", error);
            }
        };

        fetchCurrentNgo();
    }, []);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const reportsCollection = collection(db, 'strayInfo');
                const reportsSnapshot = await getDocs(reportsCollection);
                const reportsList = await Promise.all(reportsSnapshot.docs.map(async (doc) => {
                    const reportData = doc.data();
                    
                    // Normalize contact numbers by removing spaces and special characters
                    const normalizeContact = (contact) => {
                        if (!contact) return '';
                        return contact.replace(/\D/g, '');
                    };
                    
                    const reportContact = normalizeContact(reportData.userContact);
                    
                    // Fetch user details with normalized contact
                    let userData = null;
                    if (reportContact) {
                        try {
                            const usersCollection = collection(db, 'users');
                            const usersSnapshot = await getDocs(usersCollection);
                            
                            // Find user by matching normalized contact
                            const matchingUser = usersSnapshot.docs.find(userDoc => {
                                const userContact = normalizeContact(userDoc.data().contact);
                                return userContact === reportContact;
                            });
                            
                            if (matchingUser) {
                                userData = matchingUser.data();
                            }
                        } catch (userError) {
                            console.error("Error fetching user details:", userError);
                        }
                    }
                    
                    return {
                        id: doc.id,
                        ...reportData,
                        user: userData
                    };
                }));
                setReports(reportsList);
            } catch (error) {
                console.error("Error fetching reports:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const handleHelpSubmit = async () => {
        if (!selectedReport || !helpData.description || !helpData.ngoName || !helpData.ngoAddress) return;

        try {
            // Add help data to helpData collection
            await addDoc(collection(db, 'helpData'), {
                reportId: selectedReport.id,
                ngoName: helpData.ngoName,
                ngoAddress: helpData.ngoAddress,
                description: helpData.description,
                timestamp: new Date().toISOString()
            });

            // Update report status to complete
            const reportRef = doc(db, 'strayInfo', selectedReport.id);
            await updateDoc(reportRef, {
                status: 'complete',
                ngo: {
                    name: helpData.ngoName,
                    address: helpData.ngoAddress
                }
            });

            // Update local state
            setReports(reports.map(report => 
                report.id === selectedReport.id 
                    ? { ...report, status: 'complete', ngo: { name: helpData.ngoName, address: helpData.ngoAddress } }
                    : report
            ));

            // Reset form and close dialog
            setHelpData({ description: '', ngoName: '', ngoAddress: '' });
            setShowHelpDialog(false);
            setSelectedReport(null);
        } catch (error) {
            console.error("Error submitting help data:", error);
        }
    };

    const handleHelpClick = (report) => {
        setSelectedReport(report);
        // Pre-fill the form with current NGO's information if available
        setHelpData({
            ngoName: currentNgo?.name || '',
            ngoAddress: currentNgo?.address || '',
            description: ''
        });
        setShowHelpDialog(true);
    };

    const filteredReports = reports.filter(report => 
        statusFilter === 'all' ? true : report.status === statusFilter
    );

    if (loading) {
        return (
            <div className='ngo-homepage-container'>
                <Header />
                <div className='loading-spinner'>
                    <div className='spinner'></div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className='ngo-homepage-container'>
            <Header />
            <div className='ngo-homepage-content'>
                <section className='reports-section'>
                    <div className='reports-header'>
                        <h2>Reports</h2>
                        <div className='status-filter'>
                            <button 
                                className={`filter-button ${statusFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('all')}
                            >
                                All
                            </button>
                            <button 
                                className={`filter-button ${statusFilter === 'pending' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('pending')}
                            >
                                Pending
                            </button>
                            <button 
                                className={`filter-button ${statusFilter === 'complete' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('complete')}
                            >
                                Completed
                            </button>
                        </div>
                    </div>
                    {filteredReports.length === 0 ? (
                        <p className='no-reports'>No reports available at the moment.</p>
                    ) : (
                        <div className='reports-grid'>
                            {filteredReports.map(report => (
                                <div key={report.id} className='report-card dark-theme'>
                                    <div className='report-header'>
                                        <h3 className='report-title'>{report.title}</h3>
                                        <span className={`report-status ${report.status}`}>
                                            {report.status}
                                        </span>
                                    </div>
                                    {report.imageUrl && (
                                        <div className='report-image-container'>
                                            <img 
                                                src={report.imageUrl} 
                                                alt="Report scene" 
                                                className='report-image' 
                                            />
                                        </div>
                                    )}
                                    <div className='report-content'>
                                        <p className='report-description'>{report.description}</p>
                                        <div className='report-meta'>
                                            <span className='report-location'>
                                                <i className="fas fa-map-marker-alt"></i> {report.location}
                                            </span>
                                            <span className='report-date'>
                                                <i className="fas fa-calendar"></i> {report.date}
                                            </span>
                                        </div>
                                        {report.status === 'pending' && (
                                            <div className='report-actions'>
                                                <button 
                                                    className='help-button'
                                                    onClick={() => handleHelpClick(report)}
                                                >
                                                    <i className="fas fa-hands-helping"></i> Provide Help
                                                </button>
                                            </div>
                                        )}
                                        {report.status === 'complete' && report.ngo && (
                                            <div className='ngo-response'>
                                                <h4>NGO Response:</h4>
                                                <p><strong>NGO:</strong> {report.ngo.name}</p>
                                                <p><strong>Address:</strong> {report.ngo.address}</p>
                                                <p><strong>Description:</strong> {report.description}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {showHelpDialog && (
                <div className='help-dialog'>
                    <div className='help-dialog-content'>
                        <h3>Provide Help Details</h3>
                        <p className='help-dialog-subtitle'>Please provide details about how you will help with this report</p>
                        <form className='help-form' onSubmit={(e) => {
                            e.preventDefault();
                            handleHelpSubmit();
                        }}>
                            <div className='help-form-group'>
                                <label htmlFor="ngoName">NGO Name</label>
                                <input
                                    id="ngoName"
                                    type="text"
                                    placeholder="Enter your NGO name"
                                    value={helpData.ngoName}
                                    onChange={(e) => setHelpData({...helpData, ngoName: e.target.value})}
                                    required
                                    className='help-input'
                                />
                            </div>
                            <div className='help-form-group'>
                                <label htmlFor="ngoAddress">NGO Address</label>
                                <input
                                    id="ngoAddress"
                                    type="text"
                                    placeholder="Enter your NGO address"
                                    value={helpData.ngoAddress}
                                    onChange={(e) => setHelpData({...helpData, ngoAddress: e.target.value})}
                                    required
                                    className='help-input'
                                />
                            </div>
                            <div className='help-form-group'>
                                <label htmlFor="description">Description of Help</label>
                                <textarea
                                    id="description"
                                    placeholder="Describe how you will help with this report..."
                                    value={helpData.description}
                                    onChange={(e) => setHelpData({...helpData, description: e.target.value})}
                                    required
                                    className='help-textarea'
                                    rows={5}
                                />
                            </div>
                            <div className='help-dialog-buttons'>
                                <button type="button" className='help-cancel-button' onClick={() => {
                                    setShowHelpDialog(false);
                                    setSelectedReport(null);
                                    setHelpData({ description: '', ngoName: '', ngoAddress: '' });
                                }}>
                                    Cancel
                                </button>
                                <button type="submit" className='help-submit-button'>
                                    Submit Help Details
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

export default NgoHomePage;