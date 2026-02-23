import { useState, useEffect, useMemo } from "react";
import { getFullTextStatus, getTAStatus } from "../utils/screeningTools";
import StudyCard from "./StudyCard";
import Navbar from "./Navbar";
import StatusToggleBar from "./StatusToggleBar";
import ScreeningFiltersBar from "./ScreeningFiltersBar";
import PaginationBar from "./PaginationBar";
import useScreeningFilters from "../hooks/useScreeningFilters";
import useStatusCounts from "../hooks/useStatusCounts";

export default function FullTextScreening(props) {
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

    async function fetchStudies() {
        try {
            const res = await fetch(
                `http://localhost:5005/api/projects/${projectId}/studies-with-scores`,
                { credentials: "include" }
            );
            const data = await res.json();
            setStudies(data);
        } catch (err) {
            console.error("Failed to fetch studies:", err);
        }
    }

    useEffect(() => {
        if (projectId) fetchStudies();
    }, [projectId]);

    // HIDE DETAILS FILTER - ** ADD **

    const taAcceptedStudies = useMemo(() => {
        return studies.filter(
            study => getTAStatus(study.screening, user?.userid) === "ACCEPTED"
        )
    }, [studies, user]);
    
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
    } = useScreeningFilters(taAcceptedStudies)

    const { countByStatus, matchesStatus } = useStatusCounts(taAcceptedStudies, user, getFullTextStatus);

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
            <h2><i className="fa-solid fa-book-open-reader"></i> Full Text Review</h2>

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