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

  const authenticatedContent = (
    <>
      <Navbar />
      <br />
      <Overview studies={studies} />
      <br />
      <Setup />
      <br />
      <Import studies={studies} setStudies={setStudies} />
      <br />
      <TAScreening studies={studies} setStudies={setStudies} />
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
