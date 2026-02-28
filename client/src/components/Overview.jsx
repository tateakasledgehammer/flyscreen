import { capitaliseFirstLetter } from "../utils/screeningTools"
import Navbar from "./Navbar"
import { useState, useEffect } from "react"

export default function Overview(props) {
    const { 
        user,
        projectId,
        studies
    } = props

    const [project, setProject] = useState(null);
    const [studiesCount, setStudiesCount] = useState(0);
    const [progress, setProgress] = useState(null);
    const [myStats, setMyStats] = useState(null);

    async function fetchProject() {
        try {
            const res = await fetch(
                `http://localhost:5005/api/projects/${projectId}`,
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
                `http://localhost:5005/api/projects/${projectId}/studies-with-scores`,
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
                `http://localhost:5005/api/projects/${projectId}/progress`,
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
                `http://localhost:5005/api/projects/${projectId}/my-stats`,
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

    if (!project || !progress) {
        return (
            <>
            <Navbar />
            <div className="page-container">
                <h2>Loading overview...</h2>
            </div>
            </>
        )
    }

    function handlePrismaDiagram() {
        alert("This function has not been set up")
    }

    if (!projectId) {
        return (
            <>
            <Navbar />
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

    if (!!project || !progress || !progress.ta || !progress.ft) {
        return (
            <>
            <Navbar />
            <div className="page-container">
                <h2><i className="fa-solid fa-house-chimney"></i> Your Homepage</h2>
                
                {/* Add class and styling for the homepage cards + progress bar */}
                <div className="homepage-section">
                    <h3>Loading overview...</h3>
                    <p>(you may need to upload some studies)</p>
                </div>
            </div>
            </>
        );
    }
    
    return (
        <>
        <Navbar />
        <div className="page-container">
            <h2><i className="fa-solid fa-house-chimney"></i> Your Homepage</h2>
            
            {/* Add class and styling for the homepage cards + progress bar */}
            <div className="homepage-section">
                <h3>Overview</h3>
                <ul>
                    <li>Study Title: {project.title || "No title set"}</li>
                    <li>Study Type: {project.studyType || "No study type set"}</li>
                    <li>Reviewers needed for screening: {project.numberOfReviewersForScreening || "Screener number not set"}</li>
                    <li>Reviewers needed for full text view: {project.numberOfReviewersForFullText || "Reviewer number not set"}</li>
                    <li>Reviewers needed for extraction: {project.numberOfReviewersForExtraction || "Extraction number not set"}</li>
                    
                    {/*  OTHER REVIEWERS !! */}
                    <li>Primary reviewer: {user.username}</li>
                    <li>Other reviewers: {user.username}</li>
                </ul>
            </div>
            <div className="homepage-section">
                <h3>Import Your Studies</h3>
                <ul>
                    <li>Number of imported studies: {studiesCount}</li>
                </ul>
            </div>
            <div className="homepage-section">   
                <h3>Set Up Your Review</h3>
                <ul>
                    {/* Study Tags */}
                    {(!project.tags || project.tags.length === 0) && <li>Tags: No tags provided.</li>}

                    {project.tags && project.tags.length > 0 && (
                    <>
                        <li>Tags: </li>
                        <ul>
                            {(project.tags?.map((tag, i) => (
                                <li key={i}>{tag}</li>
                            )))}
                        </ul>
                    </>
                    )}                  

                    {/* Inclusion Criteria */}
                    <li>Inclusion Criteria:</li>

                    {project.inclusionCriteria && project.inclusionCriteria.length > 0 && (
                    <>
                        <ul>
                            {(!project.inclusionCriteria || project.inclusionCriteria.length === 0) && <li>No inclusion criteria set provided.</li>}

                            {(project.inclusionCriteria?.map((section, i) => (
                                <li key={i}>
                                    {capitaliseFirstLetter(section.category)}: {section.criteria.join(", ")}
                                </li>
                            )))}
                        </ul>
                    </>
                    )}
                    {/* Exclusion Criteria */}
                    <li>Exclusion Criteria:</li>

                    {project.exclusionCriteria && project.exclusionCriteria.length > 0 && (
                    <>
                        <ul>
                            {(!project.exclusionCriteria || project.exclusionCriteria.length === 0) && <li>No exclusion criteria set provided.</li>}

                            {(project.exclusionCriteria?.map((section, i) => (
                                <li key={i}>
                                    {capitaliseFirstLetter(section.category)}: {section.criteria.join(", ")}
                                </li>
                            )))}
                        </ul>
                    </>
                    )}
                    {/* Full Text Exclusion Criteria */}
                    <li>Full Text Exclusion Criteria:</li>

                    {project.fullTextExclusionReasons && project.fullTextExclusionReasons.length > 0 && (
                    <>
                        <ul>
                            {(!project.fullTextExclusionReasons || project.fullTextExclusionReasons.length === 0) && <li>No exclusion criteria set provided.</li>}

                            {(project.fullTextExclusionReasons?.map((reason, i) => (
                                <li key={i}>{reason}</li>
                            )))}
                        </ul>
                    </>
                    )}
                </ul>
            </div>
            <div className="homepage-section">
                <h3>Title & Abstract Screening</h3>
                <button onClick={handlePrismaDiagram}>See PRISMA Flow Diagram</button>
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
            <div className="homepage-section">
                <h3>Your Screening Stats</h3>
                <ul>
                    <li>TA Screened: {myStats?.taScreened}</li>
                    <li>TA Screened: {myStats?.ftScreened}</li>
                </ul>
            </div>
        </div>
    </>
    )
}