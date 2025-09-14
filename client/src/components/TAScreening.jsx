import { useState, useEffect } from "react"
import StudyCard from "./StudyCard";
import { handleSortByOrder } from "../utils/screeningTools";

export default function TAScreening(props) {
    const { 
        studies, 
        setStudies, 
        savedStudies, 
        toggleDetails, 
        setToggleDetails, 
        studyTags, 
        setStudyTags, 
        user, 
        setUser, 
        searchFilter, 
        setSearchFilter, 
        inclusionCriteria, 
        setInclusionCriteria, 
        exclusionCriteria, 
        setExclusionCriteria,
    } = props;

    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1)

    const [sortBy, setSortBy] = useState('index_asc');

    const [searchFilterInput, setSearchFilterInput] = useState("");
    const [statusFilter, setStatusFilter] = useState("")

    const [highlighted, setHighlighted] = useState(true)

    function handleItemsPerPage(e) {
        setItemsPerPage(e.target.value);
        setCurrentPage(1);
    }

    useEffect(() => {
        setStudies(prev => handleSortByOrder(prev, sortBy));
    }, [sortBy]);
    
    function handleSetSearchFilter(e) {
        setSearchFilter(searchFilterInput);
        setCurrentPage(1);
        setSearchFilterInput("");
    }

    function handleRemoveSearchFilter() {
        setSearchFilter("");
        setCurrentPage(1);
        setSearchFilterInput("")
    }

    function handleToggleDetailsGlobal() {
        
    }

    function handleToggleHighlightsGlobal() {
        setHighlighted(prev => !prev);
    }

    function handleLoadMoreStudies() {
        setItemsPerPage(itemsPerPage * 2)
    }

    function toggleStudyStatusShowing(filter) {
        if (filter === "UNSCREENED") {
            setStatusFilter(studies.filter(study => !study.status || study.status === "No votes"));
        } else if (filter === "AWAITING SECOND VOTE") {
            setStatusFilter(studies.filter(study =>
                study.status === "One for" || study.status === "One against"
            ))
        } else if (filter === "ACCEPTED") {
            setStatusFilter(studies.filter(study => study.status === "Accepted"));
        } else if (filter === "REJECTED") {
            setStatusFilter(studies.filter(study => study.status === "Rejected"));
        } else {
            setStatusFilter("studies")
        }
    }

    const filteredStudies = studies.filter(study => {
        if (!searchFilter) return true;
        const term = searchFilter.toLocaleLowerCase();
        return (
            study.title.toLowerCase().includes(term) ||
            study.abstract.toLowerCase().includes(term) ||
            study.keywords.toLowerCase().includes(term)
        )

        if (statusFilter === "UNSCREENED") {
            return study.status === "No votes"
        } else if (statusFilter === "AWAITING SECOND VOTE") {
            return study.status === "One for" || study.status === "One against";
        } else if (statusFilter === "ACCEPTED") {
            return study.status === "Accepted"
        } else if (statusFilter === "REJECTED") {
            return study.status === "Rejected"
        }
    })
    
    const sortedStudies = handleSortByOrder(filteredStudies);
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const visibleStudies = sortedStudies.slice(startIndex, endIndex);

    return (
        <>
            <h1>
                <i className="fa-solid fa-magnifying-glass"></i> Title & Abstract Screening
            </h1>

            {/* Navigation bar for the screening */}
            <div id="screening-nav">
                {/* Items per page */}
                <label>Show per page:</label>
                <select id="itemsPerPage" onChange={handleItemsPerPage} value={itemsPerPage}>
                    <option defaultValue={25}>Select</option>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>

                {/* Sort studies */}
                <label>Sort by:</label>
                <select id="sortBy" onChange={(e) => setSortBy(e.target.value)}>
                    <option value="index_asc">Study Index</option>
                    <option value="year_asc">Year (Oldest First)</option>
                    <option value="year_des">Year (Newest First)</option>
                    <option value="title_asc">Title (A - Z)</option>
                    <option value="title_des">Title (Z - A)</option>
                    <option value="author_asc">Author (A - Z)</option>
                    <option value="author_des">Author (Z - A)</option>
                    <option value="probability_asc">Probability Score (Ascending)</option>
                    <option value="probability_des">Probability Score (Descending)</option>
                </select>

                {/* Filter studies */}
                <label>Set A Filter</label>
                <input 
                    onChange={(e) => setSearchFilterInput(e.target.value)}
                    value={searchFilterInput}
                    type="text" 
                    placeholder="Set a filter..." 
                />
                <button 
                    onClick={handleSetSearchFilter}
                    >
                    Add Filter
                </button>
                <button 
                    id="clearFilterBtn" 
                    onClick={handleRemoveSearchFilter}
                    >
                    Clear Filter
                </button>

                {/* Toggle highlights / abstract */}
                <button id="toggleDetailsBtn" onClick={handleToggleDetailsGlobal}>▲ Hide Details</button>
                <button id="toggleHighlightableBtn" onClick={handleToggleHighlightsGlobal}>
                    {highlighted ? "Toggle Highlights Off" : "Toggle Highlights On"}
                </button>
            </div>

            <div className="toggle-status">
                <button 
                    onClick={() => toggleStudyStatusShowing("UNSCREENED")}
                >
                    UNSCREENED ({studies.filter(study => !study.status || study.status === "No votes").length})
                </button>

                <button 
                    onClick={() => toggleStudyStatusShowing("AWAITING SECOND VOTE")}
                >
                    AWAITING SECOND VOTE ({studies.filter(study => study.status === "One for" && study.status === "One against").length})
                </button>

                <button 
                    onClick={() => toggleStudyStatusShowing("CONFLICT")}
                >
                    CONFLICT ({studies.filter(study => study.status === "Conflict").length})
                </button>

                <button 
                    onClick={() => toggleStudyStatusShowing("ACCEPTED")}
                >
                    ACCEPTED ({studies.filter(study => study.status === "Accepted").length})
                </button>

                <button 
                    onClick={() => toggleStudyStatusShowing("REJECTED")}
                >
                    REJECTED ({studies.filter(study => study.status === "Rejected").length})
                    </button>
            </div>

            {/* Filter notice */}
            <div>
                {searchFilter && (
                    <h3 className="filter-notice">Filter: {searchFilter}</h3>
                )}
            </div>

            {/* Output section */}
            <StudyCard 
                studies={visibleStudies} 
                setStudies={setStudies} 
                toggleDetails={toggleDetails}
                setToggleDetails={setToggleDetails}
                studyTags={studyTags}
                setStudyTags={setStudyTags}
                user={user}
                setUser={setUser}
                inclusionCriteria={inclusionCriteria} 
                setInclusionCriteria={setInclusionCriteria} 
                exclusionCriteria={exclusionCriteria} 
                setExclusionCriteria={setExclusionCriteria}
                searchFilter={searchFilter}
                setSearchFilter={setSearchFilter}
                highlighted={highlighted}
                setHighlighted={setHighlighted}
            />

            <br />
            <br />
            <br />
            <br />
            <br />

            {/* Load more button */}

            {studies.length > 0 && (
                <button onClick={handleLoadMoreStudies}>
                    Load more...
                </button>
            )}
        </>
    )
}