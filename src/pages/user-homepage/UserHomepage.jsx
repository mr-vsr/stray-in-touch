import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DonationsCta, Loader, DonationHistory } from '../../components/index.js';
import { db } from '../../auth/firebase-config.js';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore'; // Import Timestamp
import { getAuth } from 'firebase/auth';

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
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      if (!user) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchDonations = async () => {
      if (!currentUser || !currentUser.email) return;

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

    if (currentUser) {
      fetchDonations();
    } else {
      setDonations([]);
      setLoadingDonations(false);
    }
  }, [currentUser]);


  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      setLoadingHelpReports(true);
      setLoadingUserReports(true);

      try {
        const auth = getAuth();
        const user = auth.currentUser;
        const helpDataSnapshot = await getDocs(collection(db, 'helpData'));
        const helpData = helpDataSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ngoName: data.ngoName || 'Unknown NGO',
            ngoAddress: data.ngoAddress || 'Address not specified',
            descriptionOfHelp: data.descriptionOfHelp || 'Details not provided',
            timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : null, 

            reportId: data.reportId
          };
        });
        setHelpReports(helpData);
        setLoadingHelpReports(false);

        // Fetch user's reports (no change here)
        if (user && user.phoneNumber) {
          const userReportsQuery = query(
            collection(db, 'strayInfo'),
            where('contact', '==', user.phoneNumber)
          );
          const userReportsSnapshot = await getDocs(userReportsQuery);
          const userReportsData = userReportsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate()
          }));
          setUserReports(userReportsData);
        } else {
            setUserReports([]);
            if (user) { // Only warn if logged in but no phone number
                 console.warn("Current user's phone number not available for fetching user reports.");
            }
        }
         setLoadingUserReports(false);

      } catch (error) {
        console.error('Error fetching reports:', error);
        setError('Failed to load reports. Please try again later.');
        setLoadingHelpReports(false);
        setLoadingUserReports(false);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser !== null) {
        fetchReports();
    }

  }, [currentUser]);


  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date not available';
    // Ensure timestamp is a Date object before formatting
    const date = timestamp instanceof Date ? timestamp : timestamp?.toDate?.();
    if (!date) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  const renderHelpReports = () => {
    if (loadingHelpReports) return <Loader type="inline" size="medium" text="Loading help reports..." />;
    if (!helpReports.length) return (
      <div className="no-data-message">
        <i className="fas fa-info-circle"></i>
        <p>No help reports available yet.</p>
      </div>
    );

    return (
      <div className="info-grid">
        {helpReports.map((report, index) => (
          <motion.div
            key={report.id}
            className="info-card glass-card"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            style={{ '--item-index': index }} 
          >
            <div className="info-card-header">
              <h3 className="info-card-title">{report.ngoName}</h3>
              <span className="status-badge-corner complete">HELPED</span>
            </div>
            <div className="info-card-content">
              <p className="info-card-description">{report.descriptionOfHelp}</p>
              <div className="info-card-details-section">
                 <i className="fas fa-map-marker-alt"></i>
                 {/* *** FIX: Use report.ngoAddress directly *** */}
                 <span>{report.ngoAddress}</span>
              </div>
               <div className="info-card-meta">
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

  const renderUserReports = () => {
    if (loadingUserReports) return <Loader type="inline" size="medium" text="Loading your reports..." />;
     if (!currentUser) return (
         <div className="no-data-message">
            <i className="fas fa-info-circle"></i>
            <p>Log in to see your submitted reports.</p>
         </div>
     );
    if (!userReports.length) return (
      <div className="no-data-message">
        <i className="fas fa-info-circle"></i>
        <p>You haven't submitted any reports yet.</p>
      </div>
    );

    return (
      <div className="reports-grid">
        {userReports.map((report, index) => (
          <motion.div
            key={report.id}
            className="report-card user-report"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            {report.imageUrl && (
              <div className="report-image-container">
                <img src={report.imageUrl} alt="Reported stray" className="report-image" loading="lazy"/>
              </div>
            )}
             <span className={`status-badge-corner ${report.status || 'pending'}`}>
               {report.status || 'Pending'}
             </span>

            <div className="report-details">
               <h3 className="report-title">{report.description || "Stray Report"}</h3>
              <div className="report-meta">
                <span className="report-location">
                  <i className="fas fa-map-marker-alt"></i>
                  {report.locationDescription || 'Location not specified'}
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
    );
  };


   const renderDonationsSection = () => {
    if (!currentUser) return null;
    return (
        <section className="dashboard-section">
            <div className="dashboard-section-header">
                <h2 className="dashboard-section-title">Your Donations</h2>
            </div>
            {loadingDonations ? (
                <Loader type="inline" size="medium" text="Loading donations..." />
            ) : donations.length > 0 ? (
                <DonationHistory donations={donations} loading={loadingDonations} />
            ) : (
                <div className="no-data-message">
                    <i className="fas fa-info-circle"></i>
                    <p>You haven't made any donations yet.</p>
                </div>
            )}
        </section>
    );
   };


  if (loading && currentUser === null) {
    return (
        <div className="dashboard-container">
             <Loader type="fullscreen" text="Loading..." />
        </div>
    );
  }


  return (
    <div className="user-homepage-container dashboard-container">
      <div className="user-dashboard dashboard-content">

        {error && (
          <div className="error-message main-error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        <div className="user-main-content-card">
          <section className="dashboard-section">
            <div className="dashboard-section-header">
                 <h2 className="dashboard-section-title">Your Reports</h2>
            </div>
            {renderUserReports()}
          </section>

          <section className="dashboard-section">
             <div className="dashboard-section-header">
                 <h2 className="dashboard-section-title">Help Provided by NGOs</h2>
             </div>
            {renderHelpReports()}
          </section>

           {renderDonationsSection()}
        </div>

        <DonationsCta />

      </div>
    </div>
  );
}

export default UserHomePage;