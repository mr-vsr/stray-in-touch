import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DonationsCta, Loader, DonationHistory } from '../../components/index.js';
import { db } from '../../auth/firebase-config.js';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function UserHomePage() {
  const [helpReports, setHelpReports] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingUserReports, setLoadingUserReports] = useState(false);
  const [loadingHelpReports, setLoadingHelpReports] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Holds the user object from Auth state
  const [currentUserProfile, setCurrentUserProfile] = useState(null); // Holds profile data from Firestore
  const [donations, setDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(false);

  // Listener for Firebase Auth state changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user); // Update the basic auth user state
      if (!user) {
        setCurrentUserProfile(null); // Clear profile if logged out
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch user profile from Firestore when currentUser changes
  useEffect(() => {
    const fetchUserProfile = async () => {
        if (currentUser && currentUser.uid) {
            // Assuming user profile is in 'users' collection
            const userRef = collection(db, 'users');
            const q = query(userRef, where('uid', '==', currentUser.uid));
            try {
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    // Assuming only one document per uid
                    setCurrentUserProfile({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
                } else {
                    console.warn(`User profile not found in Firestore for UID: ${currentUser.uid}`);
                    setCurrentUserProfile(null); // Handle case where profile doesn't exist
                }
            } catch (err) {
                console.error("Error fetching user profile:", err);
                setError("Could not load user profile.");
                setCurrentUserProfile(null);
            }
        } else {
            setCurrentUserProfile(null); // Clear profile if no user
        }
    };

    fetchUserProfile();
  }, [currentUser]); // Re-run when currentUser changes


  // Fetch Donations (depends on currentUser email)
  useEffect(() => {
    const fetchDonations = async () => {
      // Use email from basic auth object (usually reliable)
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


  // Fetch Help Reports and User Reports (depends on currentUserProfile)
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      setLoadingHelpReports(true);
      setLoadingUserReports(true);

      try {
        // Fetch Help Reports (no change needed here)
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

        // *** FIX: Fetch user's reports using contact from currentUserProfile ***
        if (currentUserProfile && currentUserProfile.contact) {
          const userContact = currentUserProfile.contact;
          const userReportsQuery = query(
            collection(db, 'strayInfo'),
            where('contact', '==', userContact) // Compare strayInfo.contact with userProfile.contact
          );
          const userReportsSnapshot = await getDocs(userReportsQuery);
          const userReportsData = userReportsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate()
          }));
          setUserReports(userReportsData);
        } else {
            setUserReports([]); // Clear if no profile or contact found
            if (currentUser) { // Only warn if logged in but profile/contact missing
                 console.warn("Current user's profile or contact number not available for fetching user reports.");
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

    // Fetch reports only when the profile is potentially loaded (currentUser state is determined)
    if (currentUser !== null) {
        fetchReports();
    }

  }, [currentUser, currentUserProfile]); // Depend on both auth state and profile state


  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date not available';
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