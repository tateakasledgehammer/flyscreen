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
  const isAuthenticated = true;
  
  const [studies, setStudies] = useState([]);
  useEffect(() => {
    const savedStudies = localStorage.getItem('studies');
    if (savedStudies) setStudies(JSON.parse(savedStudies));
  }, []);

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
  

  const authenticatedContent = (
    <>
      <Navbar />
      <br />
      <Overview studies={studies} backgroundInformationForReview={backgroundInformationForReview} studyTags={studyTags}/>
      <br />
      <Setup backgroundInformationForReview={backgroundInformationForReview} setBackgroundInformationForReview={setBackgroundInformationForReview} studyTags={studyTags} setStudyTags={setStudyTags} />
      <br />
      <Import studies={studies} setStudies={setStudies} />
      <br />
      <TAScreening studies={studies} setStudies={setStudies} studyTags={studyTags} />
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
      <Authentication />
      <br /><hr />
      {isAuthenticated && (authenticatedContent)}
    </Layout>
  )

}

export default App
