import { useState, useEffect, useMemo } from "react";
import Navbar from "./Navbar";
import StudyCard from "./StudyCard";

import ScreeningFiltersBar from "./ScreeningFiltersBar";
import PaginationBar from "./PaginationBar";

import { getFullTextStatus } from "../utils/screeningTools";

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

    // Filters
    const [searchFilter, setSearchFilter] = useState("");
    const [sortOption, setSortOption] = useState("score-desc");
    const [languageFilter, setLanguageFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [tagFilter, setTagFilter] = useState("");
    const [highlighted, setHighlighted] = useState(true);

    // Pagination
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

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

    // Only FT-rejected studies
    const excludedStudies = useMemo(() => {
        return studies.filter(
            study => getFullTextStatus(study.screening, user?.userid) === "REJECTED"
        );
    }, [studies, user]);

    // Search
    const searchWords = searchFilter
        .split(" ")
        .map(w => w.trim().toLowerCase())
        .filter(Boolean);

    function matchesSearch(study) {
        if (searchWords.length === 0) return true;
        const text = `${study.title} ${study.abstract} ${study.keywords}`.toLowerCase();
        return searchWords.every(w => text.includes(w));
    }

    // Filters
    function matchesLanguage(study) {
        return languageFilter === "" || study.language === languageFilter;
    }

    function matchesType(study) {
        return typeFilter === "" || study.type === typeFilter;
    }

    function matchesTag(study) {
        return tagFilter === "" || study.tagStatus === tagFilter;
    }

    // Sorting
    function sortStudies(list) {
        const sorted = [...list];

        if (sortOption === "score-desc") {
            sorted.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        } else if (sortOption === "score-asc") {
            sorted.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
        } else if (sortOption === "year-desc") {
            sorted.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
        } else if (sortOption === "year-asc") {
            sorted.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
        } else if (sortOption === "title-asc") {
            sorted.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortOption === "title-desc") {
            sorted.sort((a, b) => b.title.localeCompare(a.title));
        }

        return sorted;
    }

    // Apply filters
    const filteredStudies = sortStudies(
        excludedStudies.filter(study =>
            matchesSearch(study) &&
            matchesLanguage(study) &&
            matchesType(study) &&
            matchesTag(study)
        )
    );

    // Pagination
    const totalPages = Math.ceil(filteredStudies.length / itemsPerPage);
    const paginatedStudies = filteredStudies.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Clear filters
    function clearFilters() {
        setSearchFilter("");
        setSortOption("score-desc");
        setLanguageFilter("");
        setTypeFilter("");
        setTagFilter("");
        setHighlighted(true);
        setItemsPerPage(25);
        setCurrentPage(1);
    }

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
