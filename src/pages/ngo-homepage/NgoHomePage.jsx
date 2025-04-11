import React, { useState, useEffect } from 'react';
import { Header, Footer } from '../../components/index.js';
import { db } from '../../auth/firebase-config';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

function NgoHomePage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [response, setResponse] = useState("");

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const reportsCollection = collection(db, 'reportStrayAnimals');
                const reportsSnapshot = await getDocs(reportsCollection);
                const reportsList = reportsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
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

    const handleRespond = (report) => {
        setSelectedReport(report);
        setResponse("");
    };

    const handleSubmitResponse = async () => {
        if (response.trim() && selectedReport) {
            try {
                // Here you would typically send the response to your backend
                console.log("Response submitted:", response);
                
                // Delete the report from Firebase
                await deleteDoc(doc(db, 'reportStrayAnimals', selectedReport.id));
                
                // Remove the responded report from the local state
                setReports(reports.filter(report => report.id !== selectedReport.id));
                setSelectedReport(null);
                setResponse("");
            } catch (error) {
                console.error("Error submitting response:", error);
            }
        }
    };

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
                    <h2>User Reports</h2>
                    {reports.length === 0 ? (
                        <p className='no-reports'>No reports available at the moment.</p>
                    ) : (
                        <div className='reports-grid'>
                            {reports.map(report => (
                                <div key={report.id} className='report-card'>
                                    <div className='report-header'>
                                        <h3 className='report-title'>{report.title}</h3>
                                        <span className='report-date'>{report.date}</span>
                                    </div>
                                    <p className='report-description'>{report.description}</p>
                                    <div className='report-meta'>
                                        <span className='report-location'>{report.location}</span>
                                        <span className={`report-status ${report.status}`}>
                                            {report.status}
                                        </span>
                                    </div>
                                    <div className='report-actions'>
                                        <button 
                                            className='respond-button'
                                            onClick={() => handleRespond(report)}
                                        >
                                            Respond
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {selectedReport && (
                <div className='response-dialog'>
                    <div className='response-dialog-content'>
                        <h3>Respond to Report</h3>
                        <form className='response-form' onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmitResponse();
                        }}>
                            <textarea
                                className='response-input'
                                placeholder='Enter your response...'
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                rows={5}
                                required
                            />
                            <button type='submit' className='response-submit'>
                                Submit Response
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

export default NgoHomePage;