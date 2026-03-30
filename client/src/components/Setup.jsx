import { useEffect, useState, useRef } from "react";

import Navbar from "./Navbar";

import ReviewTitleSection from "./setup/ReviewTitleSection";
import StudyTypeSection from "./setup/StudyTypeSection";
import TagSetupSection from "./setup/TagSetupSection";
import FilterTermSection from "./setup/FilterTermSection"
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

    const [tags, setTags] = useState([])
    const [newTag, setNewTag] = useState('');

    const [filters, setFilters] = useState([]);
    const [newFilter, setNewFilter] = useState('');

    const [inclusionSections, setInclusionSections] = useState([]);
    const [exclusionSections, setExclusionSections] = useState([]);
    const [fullTextReasons, setFullTextReasons] = useState([]);
    
    const [background, setBackground] = useState({
        title: "",
        context: "",
        study_type: "",
        question_type: "",
        research_area: ""
    });

    const [reviewerSettings, setReviewerSettings] = useState({
        screening: 2,
        fulltext: 2,
        extraction: 2
    });

    const [savedToast, setSavedToast] = useState(false);
    function showSavedToast() {
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 1500);
    }

    // Load everything
    useEffect(() => {
        if (!projectId) return;
        loadSetup();
    }, [projectId]);

    async function loadSetup() {
        if (!projectId) return;

        try {
            const res = await fetch(`/api/projects/${projectId}/setup`, {
                credentials: "include"
            });

            if (!res.ok) {
                console.error("Setup load failed", res.status);
                return;
            }

            const data = await res.json();

            setTags(data.tags || []);
            setFilters(data.filters || []);
    
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
        
            setBackground({
                title: data.title || "",
                context: data.context || "",
                study_type: data.study_type || "",
                question_type: data.question_type || "",
                research_area: data.research_area || ""
            });
            
            setReviewerSettings({
                screening: data.reviewerSettings?.screening ?? 2,
                fulltext: data.reviewerSettings?.fulltext ?? 2,
                extraction: data.reviewerSettings?.extraction ?? 2,
            });    

        } catch (err) {
            console.error("Setup load error:", err);
        }
    }

    // save
    const setupTimer = useRef(null);
    const criteriaTimer = useRef(null);

    async function saveSetup() {
        try {
            await fetch(`/api/projects/${projectId}/setup`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tags,
                    filters,
                    background,
                    reviewerSettings
                })
            });

            console.log("Setup auto-saved");
            showSavedToast();

        } catch (err) {
            console.error("Unified save failed:", err);
        }
    }

    async function saveCriteria() {
        try {
            await fetch(`/api/projects/${projectId}/criteria`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inclusionCriteria: inclusionSections,
                    exclusionCriteria: exclusionSections,
                    fullTextExclusionReasons: fullTextReasons,
                })
            });

            console.log("Criteria auto-saved");
            showSavedToast();

        } catch (err) {
            console.error("Failed to save criteria:", err);
        }
    }

    function setupAutosave() {
        if (setupTimer.current) clearTimeout(setupTimer.current);
        setupTimer.current = setTimeout(() => saveSetup(), 500);
    }
    function criteriaAutosave() {
        if (criteriaTimer.current) clearTimeout(criteriaTimer.current);
        criteriaTimer.current = setTimeout(() => saveCriteria(), 500);
    }

    useEffect(() => setupAutosave(), [background, reviewerSettings, tags, filters]);
    useEffect(() => criteriaAutosave(), [inclusionSections, exclusionSections, fullTextReasons]);

    // tags
    async function addTag() {
        if (!newTag.trim()) return;

        const res = await fetch(`/api/projects/${projectId}/tags`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newTag.trim() })
        });

        const created = await res.json();
        setTags(prev => [...prev, created]);
        setNewTag("");
    }

    async function deleteTag(tagId) {
        const res = await fetch(`/api/projects/${projectId}/tags/${tagId}`, {
            method: "DELETE",
            credentials: "include"
        });

        setTags(prev => prev.filter(t => t.id !== tagId));
    }

    // filters
    async function addFilter() {
        if (!newFilter.trim()) return;

        const res = await fetch(`/api/projects/${projectId}/filters`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newFilter.trim() })
        });

        const created = await res.json();
        setFilters(prev => [...prev, created]);
        setNewFilter("");
    }

    async function deleteFilter(filterId) {
        console.log("Deleting filter with ID:", filterId);
        const res = await fetch(`/api/projects/${projectId}/filters/${filterId}`, {
            method: "DELETE",
            credentials: "include"
        });

        setFilters(prev => prev.filter(f => f.id !== filterId));
    }

    // Reset
    function resetApp() {
        setStudies([]);
        localStorage.clear();
        window.location.href = "/";
    }

    // Rescoring
    const [isRescoring, setIsRescoring] = useState(false);

    async function handleRescore() {
        setIsRescoring(true);

        try {
            const res = await fetch(`/api/projects/${projectId}/rescore`, {
                method: "POST",
                credentials: "include"
            });

            if (!res.ok) throw new Error("Rescore failed");

        } catch (err) {
            console.error("Rescore failed:", err);
        }

        setIsRescoring(false);
    }

    return (
        <>
        <Navbar />
        <div className="page-container">
        <h2><i className="fa-solid fa-circle-info"></i> Setup Your Review</h2>

        <div className="homepage-section">
            <h3>Clear</h3>
            <button onClick={resetApp}>Reset</button>
            <br /><br />
            <h3>Rescore Studies</h3>
            <button 
                onClick={handleRescore}
                disabled={isRescoring}
            >
                {isRescoring ? "Re-scoring.." : "Re-score All"}
            </button>
            <br /><br />
        </div>

        <ReviewTitleSection
            background={background}
            setBackground={setBackground}
        />
        <StudyTypeSection
            background={background}
            setBackground={setBackground}
        />
        <QuestionTypeSection
            background={background}
            setBackground={setBackground}
        />
        <ResearchAreaSection
            background={background}
            setBackground={setBackground}
        />
        
        <br />
        <hr />

        <ReviewerSettingsSection
            reviewerSettings={reviewerSettings}
            setReviewerSettings={setReviewerSettings}
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

        <FilterTermSection
            filters={filters}
            newFilter={newFilter}
            setNewFilter={setNewFilter}
            addFilter={addFilter}
            deleteFilter={deleteFilter}
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
        />

        {savedToast && (
            <div className="saved-toast">
                Saved!
            </div>
        )}

        <button onClick={resetApp}>
            Reset
        </button>

        </div>
        </>
    )
}