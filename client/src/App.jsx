import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

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
        const res = await fetch("http://localhost:5005/whoami", {
          credentials: "include"
        })
        const data = await res.json()
        if (data.isAuthenticated) {
          setIsAuthenticated(true)
          setUser(data.user)
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch (err) {
        console.error("Auth check failed", err)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }
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

  const authenticatedContent = (
    <>
    <Router>
      <Navbar />
      <Routes>
        {/* Create Project component */}

        <Route path="/overview" element={
          <Overview 
            studies={studies} 
            backgroundInformationForReview={backgroundInformationForReview} 
            studyTags={studyTags}
            inclusionCriteria={inclusionCriteria}
            exclusionCriteria={exclusionCriteria}
            fullTextExclusionReasons={fullTextExclusionReasons}
            user={user}
          />
        } />        
        <Route path="/setup" element={
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
        } />        

        <Route path="/import" element={
          <Import 
            studies={studies} 
            setStudies={setStudies} />
        } />

        <Route path="/screening" element={
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
        } />

        <Route path="/fulltext" element={
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
        } />
        
        <Route path="/included" element={
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
        } />

        <Route path="/excluded" element={
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
        } />
      </Routes>
    </Router>
    </>
  )

  return (
    <Layout 
      isAuthenticated={isAuthenticated} 
      setIsAuthenticated={setIsAuthenticated} 
      user={user} 
      setUser={setUser}
    >
      {loading && (<p>Loading...</p>)}

      {!isAuthenticated && (
        <>
          <Landing />
          <Authentication />
        </>
      )}
      <br />

      {isAuthenticated && (authenticatedContent)}
    </Layout>
  )

}

export default App
