import { useState, useEffect } from "react"
import Navbar from "./Navbar";
import CreateProject from "./CreateProject";

export default function Dashboard(props) {
    const { 
        projectId, 
        setProjectId,
        user,
        setUser
    } = props;

    const [email, setEmail] = useState(user?.email || "");
    const [profileMsg, setProfileMsg] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordMsg, setPasswordMsg] = useState("");

    const [projects, setProjects] = useState([]);
    const [projectTitle, setProjectTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function fetchProjects() {
        try {
            const res = await fetch("/api/projects", {
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

    async function handleUpdateProfile(e) {
        e.preventDefault();
        const res = await fetch("/api/auth/update-profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (data.success) {
            setProfileMsg("Profile updated.");
            setUser(prev => ({ ...prev, email }));
        } else {
            setProfileMsg(data.errors?.[0] || "Something went wrong.");
        }
    }

    async function handleChangePassword(e) {
        e.preventDefault();
        const res = await fetch("/api/auth/change-password", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ currentPassword, newPassword })
        });
        const data = await res.json();
        setPasswordMsg(data.success ? "Password updated." : (data.errors?.[0] || "Something went wrong."));
        if (data.success) {
            setCurrentPassword("");
            setNewPassword("");
        }
    }

    const joinedDate = user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })
        : "Unknown";

    function handleSelectProject(id) {
        setProjectId(id);
    }

    async function handleRenameProject(proj) {
        const newName = prompt("New project:", proj.name);
        if (!newName || !newName.trim()) return;

        const res = await fetch(`/api/projects/${proj.id}`, {
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

        const resUser = await fetch(`/api/users/by-username/${username}`, {
            credentials: "include"
        });
        const userData = await resUser.json();

        if (!userData?.id) {
            alert("User not found");
            return;
        }

        await fetch(`/api/projects/${proj.id}/collaborators`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ userId: userData.id })
        });

        await fetchProjects();
        alert("Reviewer added");
    }

    async function handleRemoveCollaborator(projectId, userId) {
        if (!window.confirm("Remove this collaborator?")) return;

        await fetch(`/api/projects/${projectId}/collaborators/${userId}`, {
            method: "DELETE",
            credentials: "include"
        })

        await fetchProjects();
    }

    async function handleArchiveProject(id) {
        if (!window.confirm("Archive this project? It will be hidden but not deleted")) return;

        const res = await fetch(`/api/projects/${id}/archive`, {
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
            const res = await fetch(`/api/projects/${id}`, {
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
        <div className="page-container">
            <h1><i className="fa-solid fa-grip"></i> Dashboard</h1>
            <div className="homepage-section">
                <h3>Your information:</h3>
                <p>Username: {user?.username}</p>
                <p>Email: {user?.email || "Not set"}</p>
                <p>Account made on: {joinedDate}</p>

            <br />

            <h3>Update email:</h3>
            <label className="auth-label">Email</label>
            <input
                className="auth-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.edu"
            />
            <button onClick={handleUpdateProfile}>Save Email</button>
            {profileMsg && <p style={{ marginTop: 8, fontSize: "0.85rem" }}>{profileMsg}</p>}

            <br />
            <br />

            <h3>Update password:</h3>
            <label className="auth-label">Current Password</label>
            <input
                className="auth-input"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="********"
            />

            <label className="auth-label">New Password</label>
            <input
                className="auth-input"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="********"
            />
            <button onClick={handleChangePassword}>Update Password</button>
            {passwordMsg && <p style={{ marginTop: 8, fontSize: "0.85rem" }}>{profileMsg}</p>}
            
            <br />
            <br />

            </div>

            <br />
            
            <div className="homepage-section">
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
                        style={{ 
                            cursor: "pointer", 
                            border: proj.id === projectId ? "3px solid" : "1px solid var(--border)",
                            // background: proj.id === projectId ? "var(--ink)" : "transparent",
                            // color: proj.id === projectId ? "var(--cream" : "var(--ink)"
                        
                        }}
                        onClick={() => handleSelectProject(proj.id)}
                    >
                        <p>
                            <strong>
                                Project: {proj.name}
                            </strong> with {" "} 
                        </p>
                        {proj.collaborators?.length > 0 ? (
                            <ul>
                                {proj.collaborators.map(c => (
                                    <li key={c.id}>
                                        {c.username} ({c.role})
                                        <button 
                                        className="criteria-subheading"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveCollaborator(proj.id, c.id);
                                        }}>
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            "no other reviewers"
                        )}

                        <p><strong>Created:</strong> {" "}
                            {new Date(proj.created_at).toLocaleDateString()}
                        </p>
                        <p>
                            <strong>
                            Status: 
                            </strong>
                            {" "}
                            {proj.id === projectId ? (
                                <span>Selected</span>
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
            </div>

            <br />
            <br />

            <CreateProject 
                projectTitle={projectTitle}
                setProjectTitle={setProjectTitle}
                setProjectId={setProjectId}
            />

            <br />
            <br />

        </div>
        </>
        
    )
}