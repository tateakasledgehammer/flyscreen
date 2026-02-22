import { useState, useEffect, useMemo } from "react"
import StudyCard from "./StudyCard";
import Navbar from "./Navbar";
import { handleSortByOrder, getTAStatus, canUserVoteTA } from "../utils/screeningTools";
import ScreeningFilters from "./ScreeningFilters";

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

            {/* Search */}
            <input
                type="text"
                placeholder="Search studies..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
            />

            {/* Sorting */}
            <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
            >
                <option value="year-asc">Year (Old → New)</option>
                <option value="year-des">Year (New → Old)</option>
                <option value="title-asc">Title (A → Z)</option>
                <option value="title-des">Title (Z → A)</option>
                <option value="score-asc">Score (Low → High)</option>
                <option value="score-desc">Score (High → Low)</option>
            </select>

            {/* Filters */}
            <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)}>
                <option value="">All languages</option>
                {[...new Set(studies.map(s => s.language))].map((lang, i) => (
                    <option key={i} value={lang}>{lang}</option>
                ))}
            </select>

            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="">All types</option>
                {[...new Set(studies.map(s => s.type))].map((type, i) => (
                    <option key={i} value={type}>{type}</option>
                ))}
            </select>

            <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
                <option value="">All tags</option>
                {[...new Set(studies.map(s => s.tag))].map((tag, i) => (
                    <option key={i} value={tag}>{tag}</option>
                ))}
            </select>

            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(e.target.value)}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
            </select>

            {/* highlights */}
            <button onClick={() => setHighlighted(prev => !prev)}>
                {highlighted ? "Highlights Off" : "Highlights On"}
            </button>

            {/* clear */}
            <button onClick={clearFilters}>Clear Filters</button>

            {/* status filters */}
            <div className="toggle-status">
                {["UNSCREENED", "PENDING", "CONFLICT", "ACCEPTED", "REJECTED"].map(status => (
                    <button 
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        style={ statusFilter === status ? { 
                            fontWeight: "700", 
                            backgroundColor: "#213547", 
                            color: "white" 
                            } : {}
                        }
                    >
                        {status} ({countByStatus[status]})
                    </button>
                ))}
                
                <button onClick={() => setStatusFilter("")}>All ({studies.length})</button>
            </div>

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

            <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button 
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={currentPage === i + 1 ? "active" : ""}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    </>
    )
}