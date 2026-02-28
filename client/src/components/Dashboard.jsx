import { useState, useEffect } from "react"
import Navbar from "./Navbar";
import CreateProject from "./CreateProject";

export default function Dashboard(props) {
    const { 
        projectId, 
        setProjectId 
    } = props;

    const [projects, setProjects] = useState([]);
    const [projectTitle, setProjectTitle] = useState("");
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

    async function handleRenameProject(proj) {
        const newName = prompt("New project:", proj.name);
        if (!newName || !newName.trim()) return;

        const res = await fetch(`http://localhost:5005/api/projects/${proj.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name: newName })
        });

        if (res.ok) {
            setProjects(prev =>
                prev.map(p => p.id === proj.id ? { ...p, name: newName } : p)
            );
        }
    }

    async function handleAddReviewer(proj) {
        const username = prompt("Enter collaborator username:");
        if (!username || !username.trim()) return;

        const resUser = await fetch(`http://localhost:5005/api/users/by-username/${username}`, {
            credentials: "include"
        });
        const userData = await resUser.json();

        if (!userData?.id) {
            alert("User not found");
            return;
        }

        await fetch(`http://localhost:5005/api/projects/${proj.id}/collaborators`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ userId: userData.id })
        });

        alert("Reviewer added");
    }

    async function handleArchiveProject(id) {
        if (!window.confirm("Archive this project? It will be hidden but not deleted")) return;

        const res = await fetch(`http://localhost:5005/api/projects/${id}/archive`, {
                method: "PATCH",
                credentials: "include"
            });

            if (res.ok) {
                setProjects(prev => prev.filter(p => p.id !== id));
            }
    }

    async function handleDeleteProject(id) {
        if (!window.confirm("Delete this project and all its data?")) return;

        try {
            const res = await fetch(`http://localhost:5005/api/projects/${id}`, {
                method: "DELETE",
                credentials: "include"
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Failed to delete project");
                return;
            }

            setProjects((prev) => prev.filter((p) => p.id !== id));

            if (projectId === id) {
                setProjectId(null);
            }

        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to connect to the server");
        }

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
                    <p>
                        Project: <strong>{proj.name}</strong> with {" "}
                        {proj.collaborators?.map(c => c.username).join(", ") || "no other reviewers"}
                    </p>
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
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); handleAddReviewer(proj);
                        }}
                        style={{
                            margin: "12px 24px"
                        }}
                    >
                        Add reviewer
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); handleRenameProject(proj);
                        }}
                        style={{
                            margin: "12px 24px"
                        }}
                    >
                        Rename
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); handleArchiveProject(proj.id);
                        }}
                        style={{
                            margin: "12px 24px"
                        }}
                    >
                        Archive
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); handleDeleteProject(proj.id);
                        }}
                        style={{
                            margin: "12px 24px"
                        }}
                    >
                        Delete
                    </button>
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