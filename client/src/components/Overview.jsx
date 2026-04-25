import { capitaliseFirstLetter } from "../utils/screeningTools"
import Navbar from "./Navbar"
import { useState, useEffect } from "react"
import Prisma from "./Prisma";

function ProgressBar({ label, completed, total, color }) {
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

    return (
        <div style={{ marginBottom: "10px", maxWidth: "90%" }}>
            <strong>{label}: {completed}/{total} ({pct}%)</strong>
            <div style={{
                height: "40px",
                background: "#e5e7eb",
                borderRadius: "4px",
                marginTop: "4px"
            }}>
                <div style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: color,
                    borderRadius: "4px"
                }} />
            </div>
        </div>
    );
}

export default function Overview(props) {
    const { 
        user,
        projectId
    } = props

    const [project, setProject] = useState(null);
    const [studiesCount, setStudiesCount] = useState(0);
    const [progress, setProgress] = useState(null);
    const [myStats, setMyStats] = useState(null);
    const [showPrisma, setShowPrisma] = useState(false);

    async function fetchProject() {
        try {
            const res = await fetch(
                `/api/projects/${projectId}/setup`,
                { credentials: "include" }
            );
            const data = await res.json();
            setProject(data);
        } catch (err) {
            console.error("Failed to fetch project:", err);
        }
    }

    async function fetchStudiesCount() {
        try {
            const res = await fetch(
                `/api/projects/${projectId}/studies-with-scores`,
                { credentials: "include" }
            );
            const data = await res.json();
            setStudiesCount(data.length);
        } catch (err) {
            console.error("Failed to fetch studies:", err);
        }
    }

    async function fetchProgress() {
        try {
            const res = await fetch(
                `/api/projects/${projectId}/progress`,
                { credentials: "include" }
            );
            const data = await res.json();
            setProgress(data);
        } catch (err) {
            console.error("Failed to fetch progress:", err);
        }
    }

    async function fetchMyStats() {
        try {
            const res = await fetch(
                `/api/projects/${projectId}/my-stats`,
                { credentials: "include" }
            );
            const data = await res.json();
            setMyStats(data);
        } catch (err) {
            console.error("Failed to fetch stats:", err);
        }
    }

    useEffect(() => {
        if (!projectId) return;
        fetchProgress();
        fetchStudiesCount();
        fetchMyStats();
        fetchProject();
    }, [projectId]);

    if (!projectId) {
        return (
            <>
            <div className="page-container">
                <h2><i className="fa-solid fa-house-chimney"></i> Your Homepage</h2>
                
                {/* Add class and styling for the homepage cards + progress bar */}
                <div className="homepage-section">
                    <h3>Overview</h3>
                    <p>Please go to dashboard and select or create a project.</p>
                </div>
            </div>
            </>
        );
    }

    if (!project || !progress) {
        return (
            <>
            <div className="page-container">
                <h2>Loading overview...</h2>
                <p>(you may need to upload some studies)</p>
            </div>
            </>
        )
    }

    const taFinished = progress.ta.accepted + progress.ta.rejected + progress.ta.conflict;
    const taAwaiting = progress.ta.pending;
    const taUnscreened = progress.ta.unscreened;

    const ftFinished = progress.ft.accepted + progress.ft.rejected;
    const ftAwaiting = progress.ft.pending + progress.ft.conflict;
    const ftUnscreened = progress.ft.unscreened;
    const ftTotal = progress.ta.accepted;
    
    function handlePrismaDiagram() {
        setShowPrisma(true);
    }
    
    return (
        <>
        <div className="page-container">
            <h1>
                <i className="fa-solid fa-house-chimney"></i> Your Homepage
            </h1>
            
            {/* Add class and styling for the homepage cards + progress bar */}
            <div className="homepage-section">
                <h3>Project Overview</h3>
                <ul>
                    <li>Project Name: {project.name}</li>
                    <li>Study Title: {project.title}</li>
                    <li>Study Type: {project.study_type}</li>
                    <li>Reviewers needed for screening: {project.reviewerSettings?.screening}</li>
                    <li>Reviewers needed for full text view: {project.reviewerSettings?.fulltext}</li>
                    <li>Reviewers needed for extraction: {project.reviewerSettings?.extraction}</li>
                </ul>

                {/*  REVIEWERS !! */}
                <h3>Collaborators:</h3>
                <ul>
                    {project.collaborators?.map(c => (
                        <li key={c.id}>{c.username} ({c.role})</li>
                    ))}
                </ul>

            </div>

            <div className="homepage-section">   
                <h3>Review Settings</h3>

                    <ul>
                        <li><strong>Tags:</strong></li>
                        <ul>
                            {project.tags?.length > 0
                                ? project.tags.map(tag => (<li key={tag.id}>{tag.name}</li>))
                                : <li>No tags provided.</li>
                            }
                        </ul>
                    </ul>

                    <ul>
                        <li><strong>Inclusion Criteria:</strong></li>
                        <ul>
                            {project.inclusionCriteria?.map(section => (
                                <li key={section.category}>
                                    <strong>{capitaliseFirstLetter(section.category)}</strong>: {section.criteria.join(", ")}
                                </li>
                            ))}
                        </ul>
                    </ul>

                    <ul>
                        <li><strong>Exclusion Criteria:</strong></li>
                        <ul>
                            {project.exclusionCriteria?.map(section => (
                                <li key={section.category}>
                                    <strong>{capitaliseFirstLetter(section.category)}</strong>: {section.criteria.join(", ")}
                                </li>
                            ))}
                        </ul>
                    </ul>
                
                    <ul>
                        <li><strong>Full Text Exclusion Criteria:</strong></li>
                        <ul>
                            {project.fullTextExclusionReasons?.map(reason => (
                                <li key={reason}>{reason}</li>
                            ))}
                        </ul>
                    </ul>
            </div>

            <div className="homepage-section">
                <h3>Title & Abstract Screening</h3>
                <ul>
                    <li>Unscreened: {progress.ta.unscreened}</li>
                    <li>One Vote: {progress.ta.pending}</li>
                    <li>Approved: {progress.ta.accepted}</li>
                    <li>Conflicts: {progress.ta.conflict}</li>
                    <li>Rejected: {progress.ta.rejected}</li>
                </ul>
            </div>
            <div className="homepage-section">    
                <h3>Full Text Screening</h3>
                {/* ? copy above rather than double up */}
                <ul>
                    <li>Unscreened: {progress.ft.unscreened}</li>
                    <li>One Vote: {progress.ft.pending}</li>
                    <li>Approved: {progress.ft.accepted}</li>
                    <li>Conflicts: {progress.ft.conflict}</li>
                    <li>Rejected: {progress.ft.rejected}</li>
                </ul>
            </div>

            <br />
            <br />
            
            <h3>Title & Abstract Screening Progress</h3>
            <ProgressBar
                label="Unscreened"
                completed={taUnscreened}
                total={progress.totalStudies}
                color="#9ca3af"
            />
            <ProgressBar
                label="Awaiting Second Vote"
                completed={taAwaiting}
                total={progress.totalStudies}
                color="#fb923c"
            />
            <ProgressBar
                label="Finished"
                completed={taFinished}
                total={progress.totalStudies}
                color="#22c55e"
            />

            <br />

            <h3>Full Text Screening Progress</h3>
            <ProgressBar
                label="Unscreened"
                completed={ftUnscreened}
                total={ftTotal}
                color="#9ca3af"
            />
            <ProgressBar
                label="Awaiting Second Vote"
                completed={ftAwaiting}
                total={ftTotal}
                color="#fb923c"
            />
            <ProgressBar
                label="Finished"
                completed={ftFinished}
                total={ftTotal}
                color="#22c55e"
            />

            <button onClick={handlePrismaDiagram}>
                See PRISMA Flow Diagram
            </button>

            {showPrisma && (
                <Prisma 
                    projectId={projectId}
                    onClose={() => setShowPrisma(false)}
                />
            )}

            <br />
            <br />
            
            <div className="homepage-section">
                <h3>Your Screening Stats</h3>
                <ul>
                    <li>Title & Abstract Screened: {myStats?.TA?.ACCEPT + myStats?.TA?.REJECT}</li>
                    <li>Full Text Screened: {myStats?.FULLTEXT?.ACCEPT + myStats?.FULLTEXT?.REJECT}</li>
                </ul>
            </div>
        </div>
    </>
    )
}