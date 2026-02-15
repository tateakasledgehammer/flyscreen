import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import Landing from './components/Landing'
import Authentication from './components/Authentication'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
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

  // PROJECT ID
  const [projectId, setProjectId] = useState(() => {
    const saved = localStorage.getItem("projectId");
    return saved ? Number(saved) : null;
  });
  useEffect(() => {
    if (projectId !== null) {
      localStorage.setItem("projectId", projectId);
    }
  }, [projectId]);

  // STUDIES
  const [studies, setStudies] = useState([])
  useEffect(() => {
    if (!isAuthenticated || !projectId) return;

    const fetchStudies = async () => {
      try {
        const res = await fetch(`http://localhost:5005/api/projects/${projectId}/studies-with-scores`, {
          credentials: "include"
        });
        const data = await res.json();
        setStudies(data);
      } catch (err) {
        console.error("Failed to fetch studies", err);
      }
    };

    fetchStudies();
  }, [isAuthenticated, projectId])

  // AUTH CHECK
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5005/api/auth/whoami", {
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
            <Route path="/dashboard"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Dashboard 
                  projectId={projectId}
                  setProjectId={setProjectId}
                />
              </PrivateRoute>
            } />

            <Route path="/overview" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
              <Overview 
                studies={studies} 
                user={user}
                projectId={projectId}
              />
              </PrivateRoute>
            } />        
            <Route path="/setup" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
              <Setup 
                setUser={setUser}
                setStudies={setStudies}
                projectId={projectId}
              />
              </PrivateRoute>
            } />        
            <Route path="/import" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
              <Import 
                studies={studies} 
                setStudies={setStudies}
                projectId={projectId}
              />
              </PrivateRoute>
            } />
            <Route path="/screening" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
              <TAScreening 
                studies={studies} 
                setStudies={setStudies}
                user={user}
                setUser={setUser}
                projectId={projectId}
              />
              </PrivateRoute>
            } />
            <Route path="/fulltext" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
              <FullTextScreening
                studies={studies} 
                setStudies={setStudies}
                user={user}
                setUser={setUser}
                projectId={projectId}
              />
              </PrivateRoute>
            } />
            <Route path="/included" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
              <IncludedStudies
                studies={studies} 
                setStudies={setStudies}
                user={user}
                setUser={setUser}
                projectId={projectId}
              />
              </PrivateRoute>
            } />
            <Route path="/excluded" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
              <ExcludedStudies
                studies={studies} 
                setStudies={setStudies}
                user={user}
                setUser={setUser}
                projectId={projectId}
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
