import { useState, useEffect, useMemo } from "react";
import Navbar from "./Navbar";
import StudyCard from "./StudyCard";

import ScreeningFiltersBar from "./ScreeningFiltersBar";
import PaginationBar from "./PaginationBar";

import { getFTStatus } from "../utils/screeningTools";
import useScreeningFilters from "../hooks/useScreeningFilters.jsx";
import useStatusCounts from "../hooks/useStatusCounts";

export default function ExcludedScreening({
    user,
    studyTags,
    projectId,
    handleAssignTag,
    handleAddNote,
    fullTextExclusionReasons
}) {
    const [studies, setStudies] = useState([]);
    const [toggleDetails, setToggleDetails] = useState({});

    async function fetchStudies() {
        try {
            const res = await fetch(
                `/api/projects/${projectId}/studies-with-scores`,
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

    // Only FT-rejected studies
    const excludedStudies = useMemo(() => {
        return studies.filter(
            study => getFTStatus(study.screening, user?.userid) === "REJECTED"
        );
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
    } = useScreeningFilters(excludedStudies)

    return (
        <>
            <Navbar />

            <div className="page-container">
                <h2>
                    <i className="fa-solid fa-circle-xmark"></i> Final Excluded Studies
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
                    studies={excludedStudies}
                    studyTags={studyTags}
                />

                <StudyCard
                    studies={paginatedStudies}
                    toggleDetails={toggleDetails}
                    setToggleDetails={setToggleDetails}
                    user={user}
                    projectId={projectId}
                    refreshScreenings={fetchStudies}
                    studyTags={studyTags}
                    handleAssignTag={handleAssignTag}
                    handleAddNote={handleAddNote}
                    fullTextExclusionReasons={fullTextExclusionReasons}
                    highlighted={highlighted}
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
