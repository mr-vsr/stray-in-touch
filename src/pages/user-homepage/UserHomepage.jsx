import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DonationsCta, Loader, DonationHistory } from '../../components/index.js';
import { db } from '../../auth/firebase-config.js';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : (timestamp instanceof Date ? timestamp : null);
    if (!date || isNaN(date.getTime())) return 'Invalid Date';
    try {
        return date.toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    } catch (e) {
        console.error("Error formatting date:", timestamp, e);
        return 'Invalid Date';
    }
};

const normalizeContact = (contact) => {
    if (!contact) return '';
    return String(contact).replace(/\D/g, '');
};


function UserHomePage() {
  const [helpReports, setHelpReports] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingUserReports, setLoadingUserReports] = useState(false);
  const [loadingHelpReports, setLoadingHelpReports] = useState(false);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(false);

  const [helpFilter, setHelpFilter] = useState('all');
  const [showHelpFilterButtons, setShowHelpFilterButtons] = useState(false);

  const [userReportFilter, setUserReportFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useCallback(
    debounce((term) => {
      setSearchTerm(term);
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(user => {
      if ((user && !currentUser) || (!user && currentUser)) {
        setLoading(true);
      }
      setCurrentUser(user);
      if (!user) {
        setCurrentUserProfile(null);
        setUserReports([]);
        setHelpReports([]);
        setDonations([]);
        setShowHelpFilterButtons(false);
        setHelpFilter('all');
        setUserReportFilter('all');
        setSearchTerm('');
        setLoading(false);
        setError(null);
      }
    });
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser && currentUser.uid) {
        setCurrentUserProfile(null);
        const userRef = collection(db, 'users');
        const q = query(userRef, where('uid', '==', currentUser.uid));
        try {
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const profileData = querySnapshot.docs[0].data();
            setCurrentUserProfile({
                id: querySnapshot.docs[0].id,
                ...profileData,
                contact: normalizeContact(profileData.contact)
            });
            console.log("User Profile Loaded:", { id: querySnapshot.docs[0].id, ...profileData });
          } else {
            console.warn(`User profile not found for UID: ${currentUser.uid}`);
            setError("Could not load your user profile. Some features might be limited.");
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setError("Error loading user profile.");
          setCurrentUserProfile(null);
        }
      } else {
        setCurrentUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  useEffect(() => {
    const fetchReports = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setLoadingHelpReports(true);
      setLoadingUserReports(true);
      setShowHelpFilterButtons(false);

      const loggedInUserContact = currentUserProfile?.contact;

      try {
        const helpDataSnapshot = await getDocs(collection(db, 'helpData'));
        const allHelpData = helpDataSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ngoName: data.ngoName || 'Unknown NGO',
            ngoAddress: data.ngoAddress || 'Address not specified',
            descriptionOfHelp: data.descriptionOfHelp || 'Details not provided',
            timestamp: data.timestamp,
            reportId: data.reportId,
            reportedByContact: normalizeContact(data.reportedBy?.contact) || null
          };
        });
        setHelpReports(allHelpData);
        setLoadingHelpReports(false);

        if (loggedInUserContact) {
          console.log(`Workspaceing user reports for contact: ${loggedInUserContact}`);
          const userReportsQuery = query(
            collection(db, 'strayInfo'),
            where('contact', '==', loggedInUserContact)
          );
          const userReportsSnapshot = await getDocs(userReportsQuery);
          const userReportsData = userReportsSnapshot.docs.map(doc => {
             const data = doc.data();
             return {
                id: doc.id,
                ...data,
                timestamp: data.timestamp,
                status: data.status || 'pending'
             };
          });
          setUserReports(userReportsData);
          console.log("User Reports Loaded:", userReportsData);

          const hasMatchingHelp = allHelpData.some(
             help => help.reportedByContact === loggedInUserContact
          );

          if (hasMatchingHelp) {
             console.log("Matching help found for user reports. Showing filters.");
             setShowHelpFilterButtons(true);
          } else {
             console.log("No matching help found for user reports.");
             setShowHelpFilterButtons(false);
          }
          setLoadingUserReports(false);

        } else {
          console.log("User profile contact not available yet, cannot fetch user-specific reports or check for matching help.");
          setUserReports([]);
          if (currentUserProfile === null && currentUser) {
              setLoadingUserReports(false);
          }
        }

      } catch (error) {
        console.error('Error fetching reports:', error);
        setError('Failed to load report data. Please try again later.');
        setLoadingHelpReports(false);
        setLoadingUserReports(false);
      } finally {
         if (currentUserProfile !== undefined || !currentUser) {
            setLoading(false);
         }
      }
    };

    if (currentUser !== undefined) {
        fetchReports();
    }

  }, [currentUser, currentUserProfile]);

   useEffect(() => {
    const fetchDonations = async () => {
      if (!currentUser?.email) return;

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
          timestamp: doc.data().timestamp
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

  const filteredHelpReports = useMemo(() => {
    if (!helpReports) return [];

    const loggedInUserContact = currentUserProfile?.contact;

    if (helpFilter === 'userReports' && !loggedInUserContact) {
      return [];
    }

    return helpReports.filter(report => {
      if (helpFilter === 'all') {
        return true;
      } else {
        return report.reportedByContact === loggedInUserContact;
      }
    });
  }, [helpReports, helpFilter, currentUserProfile]);

  const filteredUserReports = useMemo(() => {
    if (!userReports) return [];
    return userReports.filter(report => {
      const matchesFilter = userReportFilter === 'all' ||
                            (userReportFilter === 'complete' && report.status === 'complete') ||
                            (userReportFilter === 'pending' && (report.status === 'pending' || !report.status));

      const matchesSearch = searchTerm === '' ||
        report.description?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [userReports, userReportFilter, searchTerm]);

  const renderHelpReports = () => {
    if (loadingHelpReports && !helpReports.length) return <Loader type="inline" size="medium" text="Loading help records..." />;

    return (
      <>
        {showHelpFilterButtons && (
          <div className="filter-button-group horizontal-controls">
            <button
              className={`filter-button ${helpFilter === 'all' ? 'active' : ''}`}
              onClick={() => setHelpFilter('all')}
            >
              All Help Records
            </button>
            <button
              className={`filter-button ${helpFilter === 'userReports' ? 'active' : ''}`}
              onClick={() => setHelpFilter('userReports')}
            >
              Help For Your Reports
            </button>
          </div>
        )}

        {!filteredHelpReports.length && !loadingHelpReports ? (
          <div className="no-data-message">
            <i className="fas fa-info-circle"></i>
            <p>{helpFilter === 'userReports' ? 'No help has been recorded for reports you submitted.' : 'No help records available yet.'}</p>
          </div>
        ) : (
          <div className="info-grid">
            {filteredHelpReports.map((report, index) => (
              <motion.div
                key={report.id}
                className="info-card glass-card"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ '--item-index': index }}
              >
                <div className="info-card-header">
                  <h3 className="info-card-title">{report.ngoName}</h3>
                  <span className="status-badge-corner complete">HELPED</span>
                </div>
                <div className="info-card-content">
                  <p className="info-card-description">
                     <strong>Help Provided:</strong> {report.descriptionOfHelp}
                  </p>
                  <div className="info-card-details-section">
                     <i className="fas fa-map-marker-alt"></i>
                     <span>{report.ngoAddress}</span>
                  </div>
                  <div className="info-card-meta">
                    <span className="info-card-date">
                      <i className="far fa-clock"></i>
                      {formatDate(report.timestamp)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </>
    );
  };

  const renderUserReports = () => {
    if (loadingUserReports && !userReports.length) return <Loader type="inline" size="medium" text="Loading your reports..." />;

    if (!currentUser) return (
        <div className="no-data-message">
            <i className="fas fa-user-alt-slash"></i>
            <p>Please log in to view your submitted reports.</p>
        </div>
    );
     if (currentUser && !loading && (!currentUserProfile || !currentUserProfile.contact)) return (
        <div className="no-data-message">
            <i className="fas fa-id-card-alt"></i>
            <p>Could not load profile data with contact number needed to find your reports.</p>
        </div>
    );


    return (
      <>
        <div className="dashboard-controls horizontal-controls">
          <div className="search-input-container flex-grow">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Search your reports by description..."
              className="form-input search-input"
              onChange={handleSearchChange}
              aria-label="Search your reports by description"
              value={searchTerm}
            />
          </div>
          <div className="filter-button-group">
            {['all', 'pending', 'complete'].map(status => (
              <button
                key={status}
                className={`filter-button ${userReportFilter === status ? 'active' : ''}`}
                onClick={() => setUserReportFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {!filteredUserReports.length && !loadingUserReports ? (
          <div className="no-data-message">
            <i className="fas fa-folder-open"></i>
            <p>
              {searchTerm ? 'No reports match your search.' :
              (userReportFilter !== 'all' ? `No ${userReportFilter} reports found.` :
              'You haven\'t submitted any reports yet.')}
            </p>
          </div>
        ) : (
          <div className="info-grid">
            {filteredUserReports.map((report, index) => (
              <motion.div
                key={report.id}
                className="info-card user-report"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                 {report.imageUrl && (
                  <div className="info-card-image-container">
                    <img src={report.imageUrl} alt="Reported stray" className="info-card-image" loading="lazy"/>
                  </div>
                )}
                 <span className={`status-badge-corner ${report.status || 'pending'}`}>
                   {(report.status || 'pending').toUpperCase()}
                 </span>

                <div className="info-card-content">
                   <p className="info-card-description">{report.description || "No description provided."}</p>
                  <div className="info-card-details-section">
                     <i className="fas fa-map-marker-alt"></i>
                     <span>{report.locationDescription || 'Location not specified'}</span>
                  </div>
                  <div className="info-card-meta">
                    <span className="info-card-date">
                      <i className="far fa-clock"></i>
                      {formatDate(report.timestamp)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </>
    );
  };

   const renderDonationsSection = () => {
    if (!currentUser) return null;

    return (
        <section className="dashboard-section donations-section">
            <div className="dashboard-section-header">
                <h2 className="dashboard-section-title">Your Donation History</h2>
            </div>
            {loadingDonations ? (
                <Loader type="inline" size="medium" text="Loading donations..." />
            ) : donations.length > 0 ? (
                <DonationHistory donations={donations} loading={loadingDonations} />
            ) : (
                <div className="no-data-message">
                    <i className="fas fa-donate"></i>
                    <p>You haven't made any donations yet. Your support makes a difference!</p>
                </div>
            )}
        </section>
    );
   };

  if (currentUser === undefined) {
      return (
          <div className="dashboard-container centered-container">
               <Loader type="fullscreen" text="Initializing..." />
          </div>
      );
  }

  return (
    <div className="user-homepage-container dashboard-container">

      {error && (
        <div className="error-message-text main-error slide-down-error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <div className="user-main-content-card dashboard-content">

        <section className="dashboard-section your-reports-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Your Submitted Reports</h2>
          </div>
          {renderUserReports()}
        </section>

        <section className="dashboard-section help-provided-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Help Provided for Reports</h2>
          </div>
          {renderHelpReports()}
        </section>

        {currentUser && renderDonationsSection()}

      </div>

      {currentUser && <DonationsCta />}

    </div>
  );
}

export default UserHomePage;