import { useState, useEffect, useMemo } from "react";
import Navbar from "./Navbar";
import StudyCard from "./StudyCard";

import ScreeningFiltersBar from "./ScreeningFiltersBar";
import PaginationBar from "./PaginationBar";

import useScreeningFilters from "../hooks/useScreeningFilters.jsx";

export default function IncludedScreening({
    user,
    projectId,
    handleAssignTag,
    handleAddNote
}) {
    const [studies, setStudies] = useState([]);
    const [studyTags, setStudyTags] = useState([]);
    const [toggleDetails, setToggleDetails] = useState({});
    const [statusFilter, setStatusFilter] = useState("UNSCREENED");

    async function fetchScreeningSummary() {
        const res = await fetch(`/api/projects/${projectId}/screenings/summary`, {
            credentials: "include"
        });
        return await res.json();
    }

    async function fetchStudies() {
        try {
            const [studiesRes, summary] = await Promise.all([
                fetch(`/api/projects/${projectId}/studies-with-scores`,
                { credentials: "include" }),
                fetchScreeningSummary()
            ]);

            const studies = await studiesRes.json();

            const data = studies.map(s => ({
                ...s,
                screening: summary[s.id] || {
                    TA: { votes: [], myVote: null, status: "UNSCREENED" },
                    FULLTEXT: { votes: [], myVote: null, status: "UNSCREENED" }
                },
                tags: summary[s.id]?.tags || [],
                notes: summary[s.id]?.notes || [],
            }));
                
            setStudies(data);
        } catch (err) {
            console.error("Failed to fetch studies:", err);
        }
    }

    useEffect(() => {
        if (!projectId) return;

        fetch(`/api/projects/${projectId}/tags`, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                setStudyTags(data.map(t => t.name));
            });
    }, [projectId]);

    useEffect(() => {
        if (projectId) fetchStudies();
    }, [projectId]);

    // Only FT-accepted studies
    const includedStudies = useMemo(() => {
        return studies.filter(
            study => study.screening?.FULLTEXT?.final?.vote === "ACCEPT"
        );
    }, [studies]);

    // criteria
    const [inclusionTerms, setInclusionTerms] = useState([]);
    const [exclusionTerms, setExclusionTerms] = useState([]);
    const [fullTextExclusionReasons, setFullTextExclusionReasons] = useState([]);

    useEffect(() => {
        if (!projectId) return;

        fetch(`/api/projects/${projectId}/criteria`, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                setInclusionTerms(data.inclusionCriteria.flatMap(section => section.criteria));
                setExclusionTerms(data.exclusionCriteria.flatMap(section => section.criteria));
                setFullTextExclusionReasons(data.fullTextExclusionReasons ?? []);
            });
    }, [projectId]);

    const {
        filteredStudies,
        paginatedStudies,
        totalPages,
        searchFilter,
        setSearchFilter,
        sortOption,
        setSortOption,
        languageFilter,
        setLanguageFilter,
        typeFilter,
        setTypeFilter,
        tagFilter,
        setTagFilter,
        highlighted,
        setHighlighted,
        itemsPerPage,
        setItemsPerPage,
        currentPage,
        setCurrentPage,
        clearFilters,
        highlightContent,
        getScoreColour
    } = useScreeningFilters(includedStudies)

    return (
        <>
            <div className="page-container">
                <h1>
                    <i className="fa-solid fa-circle-check"></i> Final Included Studies
                </h1>

                <ScreeningFiltersBar
                    searchFilter={searchFilter}
                    setSearchFilter={setSearchFilter}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                    languageFilter={languageFilter}
                    setLanguageFilter={setLanguageFilter}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter}
                    tagFilter={tagFilter}
                    setTagFilter={setTagFilter}
                    itemsPerPage={itemsPerPage}
                    setItemsPerPage={setItemsPerPage}
                    highlighted={highlighted}
                    setHighlighted={setHighlighted}
                    clearFilters={clearFilters}
                    studies={includedStudies}
                    studyTags={studyTags}
                />

                <StudyCard
                    stage="FULLTEXT"
                    studies={paginatedStudies}
                    toggleDetails={toggleDetails}
                    setToggleDetails={setToggleDetails}
                    user={user}
                    projectId={projectId}
                    refreshScreenings={fetchStudies}
                    studyTags={studyTags}
                    handleAssignTag={handleAssignTag}
                    handleAddNote={handleAddNote}
                    highlighted={highlighted}
                    highlightContent={highlightContent}
                    getScoreColour={getScoreColour}
                    inclusionTerms={inclusionTerms}
                    exclusionTerms={exclusionTerms}
                    fullTextExclusionReasons={fullTextExclusionReasons}
                />

                <PaginationBar
                    totalPages={totalPages}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
            </div>
        </>
    );
}
