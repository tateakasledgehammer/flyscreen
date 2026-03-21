import { useState, useEffect, useMemo } from "react"
import StudyCard from "./StudyCard";
import Navbar from "./Navbar";

import { getTAStatus, canUserVoteTA } from "../utils/screeningTools";

import ScreeningFiltersBar from "./ScreeningFiltersBar";
import StatusToggleBar from "./StatusToggleBar";
import PaginationBar from "./PaginationBar";

import useStatusCounts from "../hooks/useStatusCounts";
import useScreeningFilters from "../hooks/useScreeningFilters";

export default function TAScreening(props) {
    const { 
        user,
        studyTags,
        projectId,
        handleAssignTag,
        handleAddNote,
        handleFullTextExclusion,
        fullTextExclusionReasons
    } = props;

    // general useState for screening
    const [studies, setStudies] = useState([]);
    const [toggleDetails, setToggleDetails] = useState({});
    const [statusFilter, setStatusFilter] = useState("");

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
                }
            }))
                
            setStudies(data);
        } catch (err) {
            console.error("Failed to fetch studies:", err);
        }
    }

    useEffect(() => {
        if (projectId) fetchStudies();
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
        clearFilters
    } = useScreeningFilters(studies)

    const { countByStatus, matchesStatus } = 
        useStatusCounts(studies, user, getTAStatus, "TA");

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
        <Navbar />
        
        <div className="page-container">
            <h2>
                <i className="fa-solid fa-magnifying-glass"></i> Title & Abstract Screening
            </h2>

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
                studies={studies}
                studyTags={studyTags}
            />

            <StatusToggleBar
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                countByStatus={countByStatus}
                totalCount={studies.length}
            />
            
            {/* Filter notice */}
            <div>
                {searchFilter && (
                    <h3 className="filter-notice">Filter: {searchFilter}</h3>
                )}
            </div>

            {/* Output section */}
            <StudyCard 
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
                handleFullTextExclusion={handleFullTextExclusion}
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