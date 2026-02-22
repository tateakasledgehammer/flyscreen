import { useState, useEffect, useMemo } from "react"
import StudyCard from "./StudyCard";
import Navbar from "./Navbar";
import { handleSortByOrder, getTAStatus, canUserVoteTA } from "../utils/screeningTools";
import { ScreeningFiltersBar } from "./ScreeningFiltersBar";
import { StatusToggleBar } from "./StatusToggleBar";
import { PaginationBar } from "./PaginationBar";

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
    const [toggleDetails, setToggleDetails] = useState([]);
    const [searchFilter, setSearchFilter] = useState("");
    const [sortOption, setSortOption] = useState("score-desc")

    // pagination
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    // other filters
    const [highlighted, setHighlighted] = useState(true);
    const [tagFilter, setTagFilter] = useState("");
    const [languageFilter, setLanguageFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
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

    const countByStatus = useMemo(() => {
        const counts = {
            UNSCREENED: 0,
            PENDING: 0,
            CONFLICT: 0,
            ACCEPTED: 0,
            REJECTED: 0
        };

        for (const study of studies) {
            const status = getTAStatus(study.screening, user?.userid);
            if (counts[status] !== undefined) {
                counts[status]++;
            }
        }

        return counts;
    }, [studies, user])

    const searchWords = searchFilter
        .split(" ")
        .map(w => w.trim().toLowerCase())
        .filter(Boolean);

    function matchesSearch(study) {
        if (searchWords.length === 0) return true;
        const text = `${study.title} ${study.abstract} ${study.keywords}`.toLowerCase();
        return searchWords.every(w => text.includes(w));
    }

    //
    // filters
    //
    function matchesLanguage(study) {
        return languageFilter === "" || study.language === languageFilter;
    }
    function matchesType(study) {
        return typeFilter === "" || study.type === typeFilter;
    }
    function matchesTag(study) {
        return tagFilter === "" || study.tagStatus === tagFilter;
    }
    function matchesStatus(study) {
        if (!statusFilter) return true;
        const status = getTAStatus(study.screening, user?.userid);
        return status === statusFilter;
    }

    // sort
    function sortStudies(list) {
        const sorted = [...list];

        if (sortOption === "score-desc") {
            sorted.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        } else if (sortOption === "score-asc") {
            sorted.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
        } else if (sortOption === "year-desc") {
            sorted.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
        } else if (sortOption === "year-asc") {
            sorted.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
        } else if (sortOption === "title-asc") {
            sorted.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortOption === "title-desc") {
            sorted.sort((a, b) => b.title.localeCompare(a.title));
        }

        return sorted;
    }

    const filteredStudies = sortStudies(
        studies.filter(study => 
            matchesSearch(study) &&
            matchesLanguage(study) &&
            matchesTag(study) &&
            matchesType(study) &&
            matchesStatus(study)
        )
    );

    // Pagination
    const totalPages = Math.ceil(filteredStudies.length / itemsPerPage);
    const paginatedStudies = filteredStudies.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Clear function
    function clearFilters() {
        setSearchFilter("");
        setSortOption("score-desc");
        setLanguageFilter("");
        setTypeFilter("");
        setTagFilter("");
        setHighlighted(true);
        setCurrentPage(1);
        setItemsPerPage(25);
        setStatusFilter("");
    }

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
                totalCount={totalCount}
            />
            
            {/* Filter notice */}
            <div>
                {searchFilter && (
                    <h3 className="filter-notice">Filter: {searchFilter}</h3>
                )}
            </div>
            
            {/* Output section */}
            <StudyCard 
                studies={filteredStudies} 
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
                totalPages={totalPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />
        </div>
    </>
    )
}