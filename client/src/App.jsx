import { useState, useEffect } from 'react'
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    checkAuth()
  }, [])

  const [studies, setStudies] = useState(() => {
    const savedStudies = localStorage.getItem('studies');
    return savedStudies ? JSON.parse(savedStudies) : []
  });

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
      <Navbar />
      <br />
      <Overview studies={studies} backgroundInformationForReview={backgroundInformationForReview} studyTags={studyTags}/>
      <br />
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
      />
      <br />
      <Import studies={studies} setStudies={setStudies} />
      <br />
      <TAScreening studies={studies} setStudies={setStudies} studyTags={studyTags} toggleDetails={toggleDetails} setToggleDetails={setToggleDetails} />
      <br />
      <FullTextScreening />
      <br />
      <IncludedStudies />
      <br />
    </>
  )

  return (
    <Layout>
      <Landing />
      {loading && (<p>Loading...</p>)}

      {!isAuthenticated && (<Authentication />)}

      <br /><hr />

      {isAuthenticated && (authenticatedContent)}
    </Layout>
  )

}

export default App
