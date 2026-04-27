import { useState, useEffect, useMemo } from "react";
import { getFTStatus, getTAStatus } from "../utils/screeningTools";
import StudyCard from "./StudyCard";
import Navbar from "./Navbar";
import StatusToggleBar from "./StatusToggleBar";
import ScreeningFiltersBar from "./ScreeningFiltersBar";
import PaginationBar from "./PaginationBar";
import useScreeningFilters from "../hooks/useScreeningFilters.jsx";
import useStatusCounts from "../hooks/useStatusCounts";

export default function FullTextScreening(props) {
    const { 
        user,
        projectId,
        handleAssignTag,
        handleAddNote
    } = props;

    // general useState for screening
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

    const taAcceptedStudies = useMemo(() => {
        return studies.filter(
            study => getTAStatus(study.screening, user?.userid) === "ACCEPTED"
        )
    }, [studies, user]);
    
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
    } = useScreeningFilters(taAcceptedStudies)

    const { countByStatus, matchesStatus } = useStatusCounts(taAcceptedStudies, user, getFTStatus, "FULLTEXT");

    const finalFiltered = useMemo(() => {
        return filteredStudies.filter(study => 
            matchesStatus(study, statusFilter)
        );
    }, [filteredStudies, statusFilter, matchesStatus])

    const paginatedFinal = useMemo(() => {
        return finalFiltered.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [finalFiltered, currentPage, itemsPerPage]);

    const finalTotalPages = Math.ceil(finalFiltered.length / itemsPerPage);

    return (
        <>
        <div className="page-container">
            <h1><i className="fa-solid fa-book-open-reader"></i> Full Text Review</h1>

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
                studies={taAcceptedStudies}
                studyTags={studyTags}
            />

            <StatusToggleBar
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                countByStatus={countByStatus}
                totalCount={taAcceptedStudies.length}
            />
            
            {/* Filter notice */}
            <div>
                {searchFilter && (
                    <h3 className="filter-notice">Filter: {searchFilter}</h3>
                )}
            </div>
            
            {/* Output section */}
            <StudyCard 
                stage="FULLTEXT"
                studies={paginatedFinal} 
                toggleDetails={toggleDetails}
                setToggleDetails={setToggleDetails}
                user={user}
                projectId={projectId}
                refreshScreenings={fetchStudies}
                studyTags={studyTags}
                handleAssignTag={handleAssignTag}
                handleAddNote={handleAddNote}
                fullTextExclusionReasons={fullTextExclusionReasons}
                highlightContent={highlightContent}
                getScoreColour={getScoreColour}
                inclusionTerms={inclusionTerms}
                exclusionTerms={exclusionTerms}
            />

            <PaginationBar 
                totalPages={finalTotalPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />
        </div>
        </>
    )
}