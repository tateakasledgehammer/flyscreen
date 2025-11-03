import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import Landing from './components/Landing'
import Authentication from './components/Authentication'
import Navbar from './components/Navbar'
import Layout from './components/Layout'
import Overview from './components/Overview'
import Setup from './components/Setup'
import Import from './components/Import'
import StudyCard from './components/StudyCard'
import TAScreening from './components/TAScreening'
import FullTextScreening from './components/FullTextScreening'
import IncludedStudies from './components/IncludedStudies'
import ExcludedStudies from './components/ExcludedStudies'
import CreateProject from './components/CreateProject'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [studies, setStudies] = useState(() => {
    try {
      const savedStudies = JSON.parse(localStorage.getItem("studies"));
      if (!Array.isArray(savedStudies)) return [];

      return savedStudies.map(study => ({
        ...study,
        votes: {
          accept: [...new Set(study.votes?.accept || [])],
          reject: [...new Set(study.votes?.reject || [])]
        },
        status: study.status || "No votes"
      }));
    } catch (e) {
      console.error("Failed to parse studies from localStorage", e);
      return [];
    }
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5005/api/whoami", {
          method: "GET",
          credentials: "include",
        })

        if (!res.ok) throw new Error("Network response was not okay");

        const data = await res.json();

        setIsAuthenticated(data.isAuthenticated);
        setUser(data.user || null);
      } catch (error) {
        console.error("Error checking authentication", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const [projectTitle, setProjectTitle] = useState(() => {
    const savedProject = localStorage.getItem('projectTitle');
    if (!savedProject || savedProject === "undefined") return "";
    return savedProject;
  });
  useEffect(() => {
    localStorage.setItem("projectTitle", projectTitle)
  }, [projectTitle]);

  useEffect(() => {
    if (studies && Array.isArray(studies)) {
      localStorage.setItem("studies", JSON.stringify(studies))
    }
  }, [studies]);

  const [studyTags, setStudyTags] = useState(() => {
    const savedStudyTags = localStorage.getItem('studyTags');
    return savedStudyTags ? JSON.parse(savedStudyTags) : [];
  });
  useEffect(() => {
    localStorage.setItem(
        "studyTags",
        JSON.stringify(studyTags)
    );
  }, [studyTags]);

  const [inclusionCriteria, setInclusionCriteria] = useState(() => {
    const savedInclusionCriteria = localStorage.getItem('inclusionCriteria');
    if (!savedInclusionCriteria || savedInclusionCriteria === "undefined") return [];
    return savedInclusionCriteria ? JSON.parse(savedInclusionCriteria) : [];
  });
  useEffect(() => {
    localStorage.setItem(
      "inclusionCriteria",
      JSON.stringify(inclusionCriteria)
    )
  }, [inclusionCriteria]);

  const [exclusionCriteria, setExclusionCriteria] = useState(() => {
    const savedExclusionCriteria = localStorage.getItem('exclusionCriteria');
    if (!savedExclusionCriteria || savedExclusionCriteria === "undefined") return [];
    return savedExclusionCriteria ? JSON.parse(savedExclusionCriteria) : [];
  });
  useEffect(() => {
    localStorage.setItem(
        "exclusionCriteria",
        JSON.stringify(exclusionCriteria)
    )
  }, [exclusionCriteria]);
  
  const [searchFilter, setSearchFilter] = useState(() => {
    const savedFilter = localStorage.getItem('searchFilter');
    if (!savedFilter || savedFilter === "undefined") return "";
    return savedFilter;
  });
  useEffect(() => {
    localStorage.setItem("searchFilter", searchFilter)
  }, [searchFilter]);

  const [fullTextExclusionReasons, setFullTextExclusionReasons] = useState(() => {
    const savedFullTextExclusion = localStorage.getItem("fullTextExclusionReasons");
    if (!savedFullTextExclusion || savedFullTextExclusion === "undefined") return [];
    return savedFullTextExclusion ? JSON.parse(savedFullTextExclusion) : [];
  });
  useEffect(() => {
    localStorage.setItem(
      "fullTextExclusionReasons",
      JSON.stringify(fullTextExclusionReasons)
    )
  }, [fullTextExclusionReasons])

  const [backgroundInformationForReview, setBackgroundInformationForReview] = useState(() => {
    const savedBackgroundInfo = localStorage.getItem("backgroundInformationForReview");
    return savedBackgroundInfo ? JSON.parse(savedBackgroundInfo) : {
      title: "",
      studyType: "",
      questionType: "",
      researchArea: "",
      numberOfReviewersForScreening: 1,
      numberOfReviewersForFullText: 1,
      numberOfReviewersForExtraction: 1,
    };
  });
  useEffect(() => {
    // Save information when it changes
    localStorage.setItem(
      "backgroundInformationForReview",
      JSON.stringify(backgroundInformationForReview)
    );
  }, [backgroundInformationForReview]);
  
  const [toggleDetails, setToggleDetails] = useState({});

  const PrivateRoute = ({ children, isAuthenticated }) => {
    return isAuthenticated ? children : <Navigate to="/" replace />;
  }

  if (loading) return <div>Loading... </div>

  return (
    <Router>
      <Routes>
          <Route 
            element={
              <Layout 
                isAuthenticated={isAuthenticated} 
                setIsAuthenticated={setIsAuthenticated} 
                user={user} 
                setUser={setUser}
              />
            }
          >
            {/* Public Routes */}
            <Route path="/" 
            element={
              <Landing
                isAuthenticated={isAuthenticated}
                setIsAuthenticated={setIsAuthenticated}
                setUser={setUser}
              />
              } 
            />

            {/* Protected Routes */}
            {/* Create Project component */}
            <Route path="/overview" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
              <Overview 
                studies={studies} 
                backgroundInformationForReview={backgroundInformationForReview} 
                studyTags={studyTags}
                inclusionCriteria={inclusionCriteria}
                exclusionCriteria={exclusionCriteria}
                fullTextExclusionReasons={fullTextExclusionReasons}
                user={user}
              />
              </PrivateRoute>
            } />        
            <Route path="/setup" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
              <Setup 
                backgroundInformationForReview={backgroundInformationForReview} 
                setBackgroundInformationForReview={setBackgroundInformationForReview} 
                studyTags={studyTags} 
                setStudyTags={setStudyTags} 
                inclusionCriteria={inclusionCriteria} 
                setInclusionCriteria={setInclusionCriteria} 
                exclusionCriteria={exclusionCriteria} 
                setExclusionCriteria={setExclusionCriteria} 
                fullTextExclusionReasons={fullTextExclusionReasons}
                setFullTextExclusionReasons={setFullTextExclusionReasons}
                setSearchFilter={setSearchFilter}
                setProjectTitle={setProjectTitle}
                setUser={setUser}
                setStudies={setStudies}
              />
              </PrivateRoute>
            } />        
            <Route path="/import" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
              <Import 
                studies={studies} 
                setStudies={setStudies}
                inclusionCriteria={inclusionCriteria}
                exclusionCriteria={exclusionCriteria}
              />
              </PrivateRoute>
            } />
            <Route path="/screening" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
              <TAScreening 
                studies={studies} 
                setStudies={setStudies} 
                studyTags={studyTags} 
                setStudyTags={setStudyTags}
                toggleDetails={toggleDetails} 
                setToggleDetails={setToggleDetails}
                user={user}
                setUser={setUser}
                inclusionCriteria={inclusionCriteria} 
                setInclusionCriteria={setInclusionCriteria} 
                exclusionCriteria={exclusionCriteria} 
                setExclusionCriteria={setExclusionCriteria}
                fullTextExclusionReasons={fullTextExclusionReasons}
                setFullTextExclusionReasons={setFullTextExclusionReasons}
                searchFilter={searchFilter}
                setSearchFilter={setSearchFilter}
              />
              </PrivateRoute>
            } />
            <Route path="/fulltext" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
              <FullTextScreening
                studies={studies} 
                setStudies={setStudies} 
                studyTags={studyTags} 
                setStudyTags={setStudyTags}
                toggleDetails={toggleDetails} 
                setToggleDetails={setToggleDetails}
                user={user}
                setUser={setUser}
                inclusionCriteria={inclusionCriteria} 
                setInclusionCriteria={setInclusionCriteria} 
                exclusionCriteria={exclusionCriteria} 
                setExclusionCriteria={setExclusionCriteria}
                searchFilter={searchFilter}
                setSearchFilter={setSearchFilter}
                fullTextExclusionReasons={fullTextExclusionReasons}
                setFullTextExclusionReasons={setFullTextExclusionReasons}
              />
              </PrivateRoute>
            } />
            <Route path="/included" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
              <IncludedStudies
                studies={studies} 
                setStudies={setStudies} 
                studyTags={studyTags} 
                setStudyTags={setStudyTags}
                toggleDetails={toggleDetails} 
                setToggleDetails={setToggleDetails}
                user={user}
                setUser={setUser}
                inclusionCriteria={inclusionCriteria} 
                setInclusionCriteria={setInclusionCriteria} 
                exclusionCriteria={exclusionCriteria} 
                setExclusionCriteria={setExclusionCriteria}
                searchFilter={searchFilter}
                setSearchFilter={setSearchFilter}
                fullTextExclusionReasons={fullTextExclusionReasons}
                setFullTextExclusionReasons={setFullTextExclusionReasons}
              />
              </PrivateRoute>
            } />
            <Route path="/excluded" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
              <ExcludedStudies
                studies={studies} 
                setStudies={setStudies} 
                studyTags={studyTags} 
                setStudyTags={setStudyTags}
                toggleDetails={toggleDetails} 
                setToggleDetails={setToggleDetails}
                user={user}
                setUser={setUser}
                inclusionCriteria={inclusionCriteria} 
                setInclusionCriteria={setInclusionCriteria} 
                exclusionCriteria={exclusionCriteria} 
                setExclusionCriteria={setExclusionCriteria}
                searchFilter={searchFilter}
                setSearchFilter={setSearchFilter}
                fullTextExclusionReasons={fullTextExclusionReasons}
                setFullTextExclusionReasons={setFullTextExclusionReasons}
              />
              </PrivateRoute>
            } />
          </Route>             

          {/* Redirect */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/overview" : "/"} />} />
      </Routes>
    </Router>
  );
}

export default App
