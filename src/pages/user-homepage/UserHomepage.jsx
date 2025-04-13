import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // Add this import
import { DonationsCta, Loader } from '../../components/index.js';
import { db } from '../../auth/firebase-config.js';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { DonationHistory } from '../../components';

function UserHomePage() {
  const [helpReports, setHelpReports] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingUserReports, setLoadingUserReports] = useState(false);
  const [loadingHelpReports, setLoadingHelpReports] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    setCurrentUser(auth.currentUser);
  }, []);

  useEffect(() => {
    const fetchDonations = async () => {
      if (!currentUser) return;
      
      setLoadingDonations(true);
      try {
        const donationsQuery = query(
          collection(db, 'donations'),
          where('email', '==', currentUser.email)
        );
        
        const donationsSnapshot = await getDocs(donationsQuery);
        const donationsData = donationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        }));
        
        setDonations(donationsData);
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setLoadingDonations(false);
      }
    };

    fetchDonations();
  }, [currentUser]);

  
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

  // Add this render function before the return statement
  const renderHelpReports = () => {
    return (
      <div className="info-grid">
        {helpReports.map((report) => (
          <motion.div
            key={report.id}
            className="info-card glass-card"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="info-card-header">
              <h3 className="info-card-title">{report.ngo?.name || 'NGO'}</h3>
              <span className="info-card-status success">HELPED</span>
            </div>
            <div className="info-card-content">
              <p className="info-card-description">{report.descriptionOfHelp}</p>
              <div className="info-card-detail-item">
                <i className="fas fa-check-circle"></i>
                <p>{report.actionsTaken || 'No action details available'}</p>
              </div>
              <div className="info-card-meta">
                <span className="info-card-location">
                  <i className="fas fa-map-marker-alt"></i>
                  {report.ngoAddress || 'Location not specified'}
                </span>
                <span className="info-card-date">
                  <i className="fas fa-calendar-alt"></i>
                  {formatDate(report.timestamp)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderDonations = () => {
    return (
      <div className="donations-grid">
        {donations.map((donation) => (
          <motion.div
            key={donation.id}
            className="donation-card"
            whileHover={{ y: -5 }}
          >
            <div className="donation-header">
              <span className="donation-amount">₹{donation.amount}</span>
              <span className="donation-date">{formatDate(donation.timestamp)}</span>
            </div>
            <div className="donation-content">
              <div className="donation-status success">Complete</div>
              <div className="donation-address">
                <i className="fas fa-wallet"></i>
                {donation.paymentId}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="user-homepage-container">
        <div className="user-homepage-content">
          <Loader 
            type="default"
            size="large"
            text="Loading your dashboard..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="user-homepage-container">
      <div className="user-homepage-content">
        <div className="user-homepage-reports-section">
            <div className="user-homepage-reports-grid">
                {/* Your existing report cards */}
            </div>
        </div>
    </div>
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* User's Reports Section */}
      <section className="user-reports-section">
        <h2>Your Reports</h2>
        {loadingUserReports ? (
          <Loader type="default" size="medium" text="Loading your reports..." />
        ) : userReports.length > 0 ? (
          <div className="reports-grid">
            {userReports.map(report => (
              <motion.div
                key={report.id}
                className="report-card user-report"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="report-header">
                  <h3 className="report-title">Stray Report</h3>
                  <span className={`report-status ${report.status || 'pending'}`}>
                    {report.status || 'Pending'}
                  </span>
                </div>
                
                {report.imageUrl && (
                  <div className="report-image-container">
                    <img src={report.imageUrl} alt="Reported stray" className="report-image" />
                  </div>
                )}

                <div className="report-content">
                  <p className="report-description">{report.description}</p>
                  <div className="report-meta">
                    <span className="report-location">
                      <i className="fas fa-map-marker-alt"></i>
                      {report.locationDescription}
                    </span>
                    <span className="report-date">
                      <i className="fas fa-calendar-alt"></i>
                      {formatDate(report.timestamp)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="no-reports-message">
            <i className="fas fa-info-circle"></i>
            <p>You haven't submitted any reports yet.</p>
          </div>
        )}
      </section>

      {/* Help Reports Section */}
      <section className="help-reports-section">
        <h2>Help Provided</h2>
        {loadingHelpReports ? (
          <Loader type="default" size="medium" text="Loading help reports..." />
        ) : (
          renderHelpReports()
        )}
      </section>

      {/* Donations Section */}
      <section className="donations-section">
        <h2>Your Donations</h2>
        {loadingDonations ? (
          <Loader type="default" size="medium" text="Loading donations..." />
        ) : (
          renderDonations()
        )}
      </section>
    </div>
  );
}

export default UserHomePage;