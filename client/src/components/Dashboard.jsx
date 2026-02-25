import { useState, useEffect } from "react"
import Navbar from "./Navbar";
import CreateProject from "./CreateProject";

export default function Dashboard(props) {
    const { 
        projectTitle, 
        setProjectTitle, 
        projectId, 
        setProjectId 
    } = props;

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function fetchProjects() {
        try {
            const res = await fetch("http://localhost:5005/api/projects", {
                credentials: "include"
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to load projects");
                return;
            }

            setProjects(data);
        } catch (err) {
            console.error("Failed to fetch projects:", err);
            setError("Failed to connect to server")
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProjects();
    }, []);

    function handleSelectProject(id) {
        setProjectId(id);
    }
    
    return (
        <>
        <Navbar />
        <div className="page-container">
            <h2><i className="fa-solid fa-grip"></i> Dashboard</h2>
            <h3>Your projects:</h3>

            {loading && <p>Loading projects...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {!loading && projects.length === 0 && (
                <p>You have no projects yet. Create one below.</p>
            )}

            {projects.map((proj) => (
                <div 
                    key={proj.id}
                    className="homepage-section"
                    style={{ cursor: "pointer", background: proj.id === projectId ? "#e8f5e9" : "white" }}
                    onClick={() => handleSelectProject(proj.id)}
                >
                    <p>Project: <a><strong>{proj.name}</strong></a> with [insert collaborators]</p>
                    <p>Create: {" "}
                        {new Date(proj.created_at).toLocaleDateString()}
                    </p>
                    <p>
                        Status: {" "}
                        {proj.id === projectId ? (
                            <span style={{ color: "green" }}>Selected</span>
                        ) : (
                            "Click to select"
                        )}
                    </p>
                </div>
            ))}

            <CreateProject 
                projectTitle={projectTitle}
                setProjectTitle={setProjectTitle}
                setProjectId={setProjectId}
            />
        </div>
        </>
        
    )
}