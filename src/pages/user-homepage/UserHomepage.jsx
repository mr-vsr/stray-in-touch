import React, { useState, useEffect } from 'react';
import { Header, Footer, DonationsCta, Loader } from '../../components/index.js';
import { db } from '../../auth/firebase-config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function UserHomePage() {
  const [helpReports, setHelpReports] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingUserReports, setLoadingUserReports] = useState(false);
  const [loadingHelpReports, setLoadingHelpReports] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        // Fetch all help data
        setLoadingHelpReports(true);
        const helpDataSnapshot = await getDocs(collection(db, 'helpData'));
        const helpData = [];
        
        // Create a map to store NGO details
        const ngoMap = new Map();
        
        // Fetch and store NGO details first
        for (const doc of helpDataSnapshot.docs) {
          const data = doc.data();
          if (data.ngoId && !ngoMap.has(data.ngoId)) {
            const ngoDoc = await getDocs(query(
              collection(db, 'NgoInfo'),
              where('__name__', '==', data.ngoId)
            ));
            if (!ngoDoc.empty) {
              ngoMap.set(data.ngoId, ngoDoc.docs[0].data());
            }
          }
        }

        // Process help data with NGO details
        for (const doc of helpDataSnapshot.docs) {
          const data = doc.data();
          const ngoData = ngoMap.get(data.ngoId) || {};
          
          helpData.push({
            id: doc.id,
            ...data,
            ngo: {
              ...ngoData,
              id: data.ngoId
            },
            timestamp: data.timestamp?.toDate()
          });
        }

        setHelpReports(helpData);
        setLoadingHelpReports(false);

        // Fetch user's reports if logged in
        if (currentUser) {
          setLoadingUserReports(true);
          const userReportsSnapshot = await getDocs(
            query(collection(db, 'strayInfo'), 
            where('contact', '==', currentUser.phoneNumber || ''))
          );

          const userReportsData = userReportsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate()
          }));

          setUserReports(userReportsData);
          setLoadingUserReports(false);
        }

      } catch (error) {
        console.error('Error fetching reports:', error);
        setError('Failed to load reports. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Format date helper
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date not available';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="user-homepage-container">
        <Header />
        <div className="user-homepage-content">
          <Loader 
            type="default"
            size="large"
            text="Loading your dashboard..."
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="user-homepage-container">
      <Header />
      <div className="user-homepage-content">
        {error && <div className="error-message">{error}</div>}

        {userReports.length > 0 && (
          <section className="user-reports-section">
            <h2>Your Reports</h2>
            <div className="reports-grid">
              {loadingUserReports ? (
                <Loader 
                  type="default"
                  size="medium"
                  text="Loading your reports..."
                />
              ) : (
                userReports.map(report => (
                  <div key={report.id} className="report-card user-report">
                    <div className="report-header">
                      <h3 className="report-title">{report.locationDescription || 'Report'}</h3>
                      <span className={`report-status ${report.status}`}>
                        {report.status}
                      </span>
                    </div>
                    <div className="report-content">
                      <p className="report-description">{report.description}</p>
                      <div className="report-meta">
                        <span className="report-location">
                          <i className="fas fa-map-marker-alt"></i> {report.locationDescription}
                        </span>
                        <span className="report-date">
                          <i className="fas fa-calendar"></i> {formatDate(report.timestamp)}
                        </span>
                      </div>
                      {report.ngo && (
                        <div className="ngo-response">
                          <h4>NGO Response:</h4>
                          <p><strong>NGO:</strong> {report.ngo.name}</p>
                          <p><strong>Action Taken:</strong> {report.ngo.helpDescription}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        <section className="help-reports-section">
          <h2>Recent Help Provided</h2>
          <div className="reports-grid">
            {loadingHelpReports ? (
              <Loader 
                type="default"
                size="medium"
                text="Loading help reports..."
              />
            ) : helpReports.length > 0 ? (
              helpReports.map(report => (
                <div key={report.id} className="report-card help-report">
                  <div className="report-header">
                    <h3 className="report-title">{report.ngo.name}</h3>
                    <span className="report-date">{formatDate(report.timestamp)}</span>
                  </div>
                  <div className="report-content">
                    <p className="report-description">{report.descriptionOfHelp}</p>
                    <div className="report-meta">
                      <span className="report-location">
                        <i className="fas fa-building"></i> {report.ngo.address}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-reports">
                <p>No help reports available at the moment.</p>
              </div>
            )}
          </div>
        </section>

        {/* Add DonationsCta component */}
        <DonationsCta />
      </div>
      <Footer />
    </div>
  );
}

export default UserHomePage;