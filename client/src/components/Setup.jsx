import { useEffect, useState } from "react";
import Navbar from "./Navbar";

import ReviewTitleSection from "./setup/ReviewTitleSection";
import StudyTypeSection from "./setup/StudyTypeSection";
import TagSetupSection from "./setup/TagSetupSection";
import CriteriaSetupSection from "./setup/CriteriaSetupSection";
import QuestionTypeSection from "./setup/QuestionTypeSection";
import ResearchAreaSection from "./setup/ResearchAreaSection";
import ReviewerSettingsSection from "./setup/ReviewerSettingsSection";

export default function Setup(props) {
    const { 
        projectId,
        setUser,
        setStudies
    } = props;

    //
    // TAGS
    //

    const [tags, setTags] = useState([])
    const [newTag, setNewTag] = useState('');

    async function loadTags() {
        if (!projectId) return;
        const res = await fetch(`/api/projects/${projectId}/tags`,
            { credentials: "include" }
        );
        const data = await res.json();
        setTags(data);
    }

    async function addTag(name) {
        if (!newTag.trim()) return;
        await fetch(`/api/projects/${projectId}/tags`, { 
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newTag.trim() })
        });
        setNewTag("");
        loadTags();
    }

    async function deleteTag(tagId) {
        await fetch(`/api/projects/${projectId}/tags`, { 
            method: "DELETE",
            credentials: "include" 
        });
        loadTags();
    }

    //
    // Criteria
    // 

    const [inclusionSections, setInclusionSections] = useState([]);
    const [exclusionSections, setExclusionSections] = useState([]);
    const [fullTextReasons, setFullTextReasons] = useState([]);

    async function loadCriteria() {
        if (!projectId) return;

        const res = await fetch(`http://localhost:5005/api/projects/${projectId}/criteria`, {
            credentials: "include"
        });
        const data = await res.json();

        const hasInclusion = Array.isArray(data.inclusionCriteria) && data.inclusionCriteria.length > 0;
        const hasExclusion = Array.isArray(data.exclusionCriteria) && data.exclusionCriteria.length > 0;

        if (!hasInclusion && !hasExclusion) {
            setInclusionSections([
                { category: "Population", criteria: [], type: "inclusion" },
                { category: "Intervention", criteria: [], type: "inclusion" },
                { category: "Comparator", criteria: [], type: "inclusion" },
                { category: "Outcomes", criteria: [], type: "inclusion" },
                { category: "Study Design", criteria: [], type: "inclusion" },
            ]);
            setExclusionSections([
                { category: "Population", criteria: [], type: "exclusion" },
                { category: "Intervention", criteria: [], type: "exclusion" },
                { category: "Comparator", criteria: [], type: "exclusion" },
                { category: "Outcomes", criteria: [], type: "exclusion" },
                { category: "Study Design", criteria: [], type: "exclusion" },
            ]);

            setFullTextReasons([]);
            return;
        }
        
        setInclusionSections(data.inclusionCriteria || []);
        setExclusionSections(data.exclusionCriteria || []);
        setFullTextReasons(data.fullTextExclusionReasons || []);
    }
    
    async function saveCriteriaToBackend() {
        await fetch(`/api/projects/${projectId}/criteria`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                inclusionCriteria: inclusionSections,
                exclusionCriteria: exclusionSections,
                fullTextExclusionReasons: fullTextReasons
            })
        });
    }

    //
    // Background info
    //

    const [background, setBackground] = useState({
        title: "",
        study_type: "",
        question_type: "",
        research_area: ""
    });

    async function loadBackgroundInfo() {
        if (!projectId) return;
        const res = await fetch(`/api/projects/${projectId}/background`, { credentials: "include" });
        const data = await res.json();
        setBackground({
            title: data?.title || "",
            study_type: data?.study_type || "",
            question_type: data?.question_type || "",
            research_area: data?.research_area || ""
        });
    }
    async function saveBackgroundInfo() {
        await fetch(`/api/projects/${projectId}/background`, {  
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(background)
        });
    }

    //
    // Reviewer settings
    //
    const [reviewerSettings, setReviewerSettings] = useState({
        screening: 2,
        fulltext: 2,
        extraction: 2
    })

    async function loadReviewerSettings() {
        if (!project) return;
        const res = await fetch(`/api/projects/${projectId}/reviewers`, { credentials: "include" });
        const data = await res.json();
        setReviewerSettings(prev => ({
            screening: data?.screening || 2,
            fulltext: data?.fulltext || 2,
            extraction: data?.extraction || 2,
        }));    
    }
    async function saveReviewerSettings() {
        await fetch(`/api/projects/${projectId}/reviewers`, {  
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reviewerSettings)
        });
    }

    //
    // Load everything
    //

    useEffect(() => {
        if (!projectId) return;
        loadTags();
        loadCriteria();
        loadBackgroundInfo();
        loadReviewerSettings();
    }, [projectId]);

    //
    // Reset
    //

    function resetApp() {
        setStudies([]);
        localStorage.clear();
        window.location.href = "/";
    }

    return (
        <>
        <Navbar />
        <div className="page-container">
        <h2><i className="fa-solid fa-circle-info"></i> Setup Your Review</h2>

        <div className="homepage-section">
                <h3>Clear</h3>
                <button onClick={resetApp}>Reset</button>
                <br />
                <br />
        </div>

        <ReviewTitleSection
            background={background}
            setBackground={setBackground}
            saveBackgroundInfo={saveBackgroundInfo}
        />
        <StudyTypeSection
            background={background}
            setBackground={setBackground}
            saveBackgroundInfo={saveBackgroundInfo}
        />
        <QuestionTypeSection
            background={background}
            setBackground={setBackground}
            saveBackgroundInfo={saveBackgroundInfo}
        />
        <ResearchAreaSection
            background={background}
            setBackground={setBackground}
            saveBackgroundInfo={saveBackgroundInfo}
        />
        
        <br />
        <hr />

        <ReviewerSettingsSection
            reviewerSettings={reviewerSettings}
            setReviewerSettings={setReviewerSettings}
            saveReviewerSettings={saveReviewerSettings}
        />

        <br />
        <hr />

        <TagSetupSection
            tags={tags}
            newTag={newTag}
            setNewTag={setNewTag}
            addTag={addTag}
            deleteTag={deleteTag}
        />

        <br />
        <hr />

        <CriteriaSetupSection
            // Inclusion
            inclusionSections={inclusionSections}
            exclusionSections={exclusionSections}
            setInclusionSections={setInclusionSections}
            setExclusionSections={setExclusionSections}
            fullTextReasons={fullTextReasons}
            setFullTextReasons={setFullTextReasons}
            saveCriteriaToBackend={saveCriteriaToBackend}
        />

        <button onClick={resetApp}>
            Reset
        </button>

        </div>
        </>
    )
}