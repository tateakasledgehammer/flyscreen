import { useState, useEffect } from "react";
import CreateProject from "./CreateProject";

export default function Dashboard(props) {
    const {
        projectId,
        setProjectId,
        user,
        setUser
    } = props;

    // ── USER PROFILE STATE ──────────────────────────────────
    const [email, setEmail] = useState(user?.email || "");
    const [profileMsg, setProfileMsg] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordMsg, setPasswordMsg] = useState("");

    // ── PROJECT STATE ───────────────────────────────────────
    const [projects, setProjects] = useState([]);
    const [projectTitle, setProjectTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ── INLINE ACTION STATE (instead of prompts) ───────
    const [renamingId, setRenamingId] = useState(null);
    const [renameValue, setRenameValue] = useState("");

    const [addingReviewerId, setAddingReviewerId] = useState(null);
    const [reviewerUsername, setReviewerUsername] = useState("");
    const [reviewerMsg, setReviewerMsg] = useState("");

    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [confirmArchiveId, setConfirmArchiveId] = useState(null);
    const [confirmRemoveCollaborator, setConfirmRemoveCollaborator] = useState(null);
    // confirmRemoveCollaborator = { projectId, userId, username } | null

    // ── FETCH PROJECTS ──────────────────────────────────────
    async function fetchProjects() {
        try {
            const res = await fetch("/api/projects", { credentials: "include" });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Failed to load projects"); return; }
            setProjects(data);
        } catch (err) {
            console.error("Failed to fetch projects:", err);
            setError("Failed to connect to server");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchProjects(); }, []);

    // ── PROFILE HANDLERS ────────────────────────────────────
    async function handleUpdateProfile(e) {
        e.preventDefault();
        try {
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
        } catch {
            setProfileMsg("Failed to connect.");
        }
    }

    async function handleChangePassword(e) {
        e.preventDefault();
        try {
            const res = await fetch("/api/auth/change-password", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();
            setPasswordMsg(data.success ? "Password updated." : (data.errors?.[0] || "Something went wrong."));
            if (data.success) { setCurrentPassword(""); setNewPassword(""); }
        } catch {
            setPasswordMsg("Failed to connect.");
        }
    }

    // ── RENAME ──────────────────────────────────────────────
    async function submitRename(projId) {
        if (!renameValue.trim()) return;
        try {
            const res = await fetch(`/api/projects/${projId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: renameValue.trim() })
            });
            if (res.ok) {
                setProjects(prev =>
                    prev.map(p => p.id === projId ? { ...p, name: renameValue.trim() } : p)
                );
            }
        } catch (err) {
            console.error("Rename failed:", err);
        } finally {
            setRenamingId(null);
            setRenameValue("");
        }
    }

    // ── ADD REVIEWER ────────────────────────────────────────
    async function submitAddReviewer(proj) {
        if (!reviewerUsername.trim()) return;
        setReviewerMsg("");
        try {
            const resUser = await fetch(`/api/users/by-username/${reviewerUsername.trim()}`, {
                credentials: "include"
            });
            const userData = await resUser.json();
            if (!userData?.id) { setReviewerMsg("User not found."); return; }

            await fetch(`/api/projects/${proj.id}/collaborators`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ userId: userData.id })
            });

            await fetchProjects();
            setReviewerMsg("Reviewer added.");
            setReviewerUsername("");
            setTimeout(() => { setAddingReviewerId(null); setReviewerMsg(""); }, 1500);
        } catch (err) {
            console.error("Add reviewer failed:", err);
            setReviewerMsg("Something went wrong.");
        }
    }

    // ── REMOVE COLLABORATOR ─────────────────────────────────
    // Replaces: handleRemoveCollaborator (used window.confirm())
    async function submitRemoveCollaborator() {
        if (!confirmRemoveCollaborator) return;
        const { projectId: pid, userId } = confirmRemoveCollaborator;
        try {
            await fetch(`/api/projects/${pid}/collaborators/${userId}`, {
                method: "DELETE",
                credentials: "include"
            });
            await fetchProjects();
        } catch (err) {
            console.error("Remove collaborator failed:", err);
        } finally {
            setConfirmRemoveCollaborator(null);
        }
    }

    // ── ARCHIVE ─────────────────────────────────────────────
    // Replaces: handleArchiveProject (used window.confirm())
    async function submitArchive(id) {
        try {
            const res = await fetch(`/api/projects/${id}/archive`, {
                method: "PATCH",
                credentials: "include"
            });
            if (res.ok) setProjects(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error("Archive failed:", err);
        } finally {
            setConfirmArchiveId(null);
        }
    }

    // ── DELETE ──────────────────────────────────────────────
    // Replaces: handleDeleteProject (used window.confirm() + alert())
    async function submitDelete(id) {
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: "DELETE",
                credentials: "include"
            });
            const data = await res.json();
            if (!res.ok) { console.error(data.error); return; }
            setProjects(prev => prev.filter(p => p.id !== id));
            if (projectId === id) setProjectId(null);
        } catch (err) {
            console.error("Delete failed:", err);
        } finally {
            setConfirmDeleteId(null);
        }
    }

    const joinedDate = user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-AU", {
            day: "numeric", month: "long", year: "numeric"
          })
        : "Unknown";

    // ── RENDER ──────────────────────────────────────────────
    return (
        <div className="page-container">
            <h1><i className="fa-solid fa-grip" /> Dashboard</h1>

            {/* ── USER INFO ── */}
            <div className="homepage-section">
                <h3>Your information</h3>
                <p>Username: <strong>{user?.username}</strong></p>
                <p>Email: <strong>{user?.email || "Not set"}</strong></p>
                <p>Member since: <strong>{joinedDate}</strong></p>

                <br />

                <h3>Update email</h3>
                <label className="auth-label">Email</label>
                <input
                    className="auth-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.edu"
                />
                <button onClick={handleUpdateProfile}>Save email</button>
                {profileMsg && <p style={{ marginTop: 8, fontSize: "0.85rem" }}>{profileMsg}</p>}

                <br /><br />

                <h3>Change password</h3>
                <label className="auth-label">Current password</label>
                <input
                    className="auth-input"
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="current password"
                />
                <label className="auth-label">New password</label>
                <input
                    className="auth-input"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="new password (6–32 characters)"
                />
                <button onClick={handleChangePassword}>Update password</button>
                {passwordMsg && <p style={{ marginTop: 8, fontSize: "0.85rem" }}>{passwordMsg}</p>}
            </div>

            <br />

            {/* ── PROJECTS ── */}
            <div className="homepage-section">
                <h3>Your projects</h3>

                {loading && <p>Loading projects...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
                {!loading && projects.length === 0 && (
                    <p>No projects yet. Create one below.</p>
                )}

                {projects.map((proj) => (
                    <div
                        key={proj.id}
                        className="homepage-section"
                        style={{
                            cursor: "pointer",
                            border: proj.id === projectId ? "3px solid" : "1px solid var(--border)"
                        }}
                        onClick={() => setProjectId(proj.id)}
                    >
                        {/* Project name / rename inline */}
                        {renamingId === proj.id ? (
                            <div onClick={e => e.stopPropagation()} style={{ marginBottom: 8 }}>
                                <input
                                    value={renameValue}
                                    onChange={e => setRenameValue(e.target.value)}
                                    autoFocus
                                    style={{ marginRight: 8 }}
                                    onKeyDown={e => e.key === "Enter" && submitRename(proj.id)}
                                />
                                <button onClick={() => submitRename(proj.id)} style={{ marginRight: 4 }}>Save</button>
                                <button onClick={() => { setRenamingId(null); setRenameValue(""); }}>Cancel</button>
                            </div>
                        ) : (
                            <p><strong>Project: {proj.name}</strong></p>
                        )}

                        {/* Collaborators */}
                        {proj.collaborators?.length > 0 ? (
                            <ul>
                                {proj.collaborators.map(c => (
                                    <li key={c.id} style={{ marginBottom: 4 }}>
                                        {c.username} ({c.role})
                                        {confirmRemoveCollaborator?.userId === c.id && confirmRemoveCollaborator?.projectId === proj.id ? (
                                            // ── Inline confirm remove collaborator ──
                                            <span onClick={e => e.stopPropagation()} style={{ marginLeft: 8 }}>
                                                Remove {c.username}?{" "}
                                                <button onClick={submitRemoveCollaborator} style={{ marginRight: 4 }}>Yes</button>
                                                <button onClick={() => setConfirmRemoveCollaborator(null)}>No</button>
                                            </span>
                                        ) : (
                                            <button
                                                style={{ marginLeft: 8 }}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    setConfirmRemoveCollaborator({ projectId: proj.id, userId: c.id, username: c.username });
                                                }}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>No other reviewers</p>
                        )}

                        {/* Add reviewer inline */}
                        {addingReviewerId === proj.id ? (
                            <div onClick={e => e.stopPropagation()} style={{ margin: "8px 0" }}>
                                <input
                                    value={reviewerUsername}
                                    onChange={e => setReviewerUsername(e.target.value)}
                                    placeholder="username..."
                                    autoFocus
                                    style={{ marginRight: 8 }}
                                    onKeyDown={e => e.key === "Enter" && submitAddReviewer(proj)}
                                />
                                <button onClick={() => submitAddReviewer(proj)} style={{ marginRight: 4 }}>Add</button>
                                <button onClick={() => { setAddingReviewerId(null); setReviewerUsername(""); setReviewerMsg(""); }}>Cancel</button>
                                {reviewerMsg && <span style={{ marginLeft: 8, fontSize: "0.85rem" }}>{reviewerMsg}</span>}
                            </div>
                        ) : null}

                        <p style={{ fontSize: "0.85rem", marginTop: 6 }}>
                            <strong>Created:</strong> {new Date(proj.created_at).toLocaleDateString()}
                        </p>
                        <p style={{ fontSize: "0.85rem" }}>
                            <strong>Status:</strong>{" "}
                            {proj.id === projectId ? <span>Selected</span> : "Click to select"}
                        </p>

                        {/* ── Action buttons ── */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => { setAddingReviewerId(proj.id); setReviewerUsername(""); setReviewerMsg(""); }}>
                                Add reviewer
                            </button>
                            <button onClick={() => { setRenamingId(proj.id); setRenameValue(proj.name); }}>
                                Rename
                            </button>

                            {/* ── Inline confirm archive ── */}
                            {confirmArchiveId === proj.id ? (
                                <span>
                                    Archive this project?{" "}
                                    <button onClick={() => submitArchive(proj.id)} style={{ marginRight: 4 }}>Yes</button>
                                    <button onClick={() => setConfirmArchiveId(null)}>No</button>
                                </span>
                            ) : (
                                <button onClick={() => setConfirmArchiveId(proj.id)}>Archive</button>
                            )}

                            {/* ── Inline confirm delete ── */}
                            {confirmDeleteId === proj.id ? (
                                <span>
                                    Delete all data?{" "}
                                    <button
                                        onClick={() => submitDelete(proj.id)}
                                        style={{ marginRight: 4, background: "rgb(237,159,159)" }}
                                    >
                                        Yes, delete
                                    </button>
                                    <button onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                                </span>
                            ) : (
                                <button
                                    onClick={() => setConfirmDeleteId(proj.id)}
                                    style={{ background: "rgb(237,159,159)" }}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <br /><br />

            <CreateProject
                projectTitle={projectTitle}
                setProjectTitle={setProjectTitle}
                setProjectId={setProjectId}
            />

            <br /><br />
        </div>
    );
}