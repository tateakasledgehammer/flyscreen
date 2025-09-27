import { useState, useEffect } from "react";
import { handleSortByOrder } from "../utils/screeningTools";
import StudyCard from "./StudyCard";
import ScreeningFilters from "./ScreeningFilters";

export default function FullTextScreening(props) {
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
        fullTextExclusionReasons,
        setFullTextExclusionReasons
    } = props;

    const [sortBy, setSortBy] = useState('index_asc');
    const [searchFilterInput, setSearchFilterInput] = useState("");
    const [highlighted, setHighlighted] = useState(false)
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    const [fullTextStatusFilter, setFullTextStatusFilter] = useState("UNSCREENED")

    const fullTextSubheadings = [
        { label: "UNSCREENED", key: "Full Text No Votes" },
        { label: "AWAITING SECOND VOTE", key: "Full Text Awaiting Second Vote" },
        { label: "CONFLICT", key: "Full Text Conflict" },
        /* { label: "ACCEPTED", key: "Full Text Accepted" }, */
        { label: "REJECTED", key: "Full Text Rejected" }
    ];

    useEffect(() => {
        setStudies(prev => handleSortByOrder(prev, sortBy));
    }, [sortBy]);

    const [tagFilter, setTagFilter] = useState("")
    function handleSortByTag(value) {
        setTagFilter(value)
    }

    function handleItemsPerPage(e) {
        setItemsPerPage(e.target.value);
        setCurrentPage(1);
    }
    
    function handleSetSearchFilter(e) {
        setSearchFilter(searchFilterInput);
        setCurrentPage(1);
        setSearchFilterInput("");
    }

    function handleRemoveSearchFilter() {
        setSearchFilter("");
        setCurrentPage(1);
        setSearchFilterInput("")
        if (searchFilter === "") alert("No filter to clear")
    }

    function handleToggleDetailsGlobal() {
        alert("This function has not been set up")
    }

    function handleToggleHighlightsGlobal() {
        setHighlighted(prev => !prev);
    }

    function handleLoadMoreStudies() {
        setItemsPerPage(itemsPerPage * 2)
    }

    function toggleStudyStatusShowing(filter) {
        setFullTextStatusFilter(filter)
    }

    function toggleStudyStatusShowing(filter) {
        setFullTextStatusFilter(filter)
    }

    const [selectedYear, setSelectedYear] = useState(null);
    function handleSortByPublicationDate(value) {
        setSelectedYear(value);
    }

    const [selectedLanguage, setSelectedLanguage] = useState("");
    function handleSortByLanguage(value) {
        setSelectedLanguage(value);
    }

    const [selectedType, setSelectedType] = useState("");
    function handleSortByType(value) {
        setSelectedType(value)
    }

    const filteredStudies = studies
        .filter(study => study.status === "Accepted")
        .filter(study => {
            if (!searchFilter) return true;
            return (
                study.title.toLowerCase().includes(searchFilter.toLocaleLowerCase()) ||
                study.abstract.toLowerCase().includes(searchFilter.toLocaleLowerCase()) ||
                study.keywords.toLowerCase().includes(searchFilter.toLocaleLowerCase())
            )
        })
        .filter(study => {
            if (selectedYear && String(study.year) !== String(selectedYear)) return false;
            if (selectedLanguage && study.language !== selectedLanguage) return false;
            if (selectedType && study.type !== selectedType) return false;
            if (tagFilter && !(study.tagStatus === tagFilter || study.fullTextExclusionStatus === tagFilter)) return false;
            return true;
        });

    const filteredStudiesByFullTextStatus = filteredStudies.filter(study => {
        switch (fullTextStatusFilter) {
            case "UNSCREENED":
                return !study.fullTextStatus || study.fullTextStatus === "Full Text No Votes";

            case "AWAITING SECOND VOTE":
                const userHasVotedCheck =
                    study.fullTextVotes?.accept?.some(u => u.username === user.username) ||
                    study.fullTextVotes?.reject?.some(u => u.username === user.username);
                return study.fullTextStatus === "Full Text Awaiting Second Vote" && !userHasVotedCheck;
            
            case "CONFLICT":
                return study.fullTextStatus === "Full Text Conflict";
            
            case "ACCEPTED":
                return study.fullTextStatus === "Full Text Accepted";
            
            case "REJECTED":
                return study.fullTextStatus === "Full Text Rejected";
            
            default:
                return false;
    }});

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const sortedStudies = handleSortByOrder(filteredStudiesByFullTextStatus);
    const screenedStudies = sortedStudies.slice(startIndex, endIndex);

    return (
        <div className="page-container">
            <h2><i className="fa-solid fa-book-open-reader"></i> Full Text Review</h2>

            <ScreeningFilters
                studies={studies}
                setSortBy={setSortBy}
                handleItemsPerPage={handleItemsPerPage}
                itemsPerPage={itemsPerPage}
                searchFilterInput={searchFilterInput}
                setSearchFilterInput={setSearchFilterInput}
                handleSetSearchFilter={handleSetSearchFilter}
                handleRemoveSearchFilter={handleRemoveSearchFilter}
                handleToggleDetailsGlobal={handleToggleDetailsGlobal}
                handleToggleHighlightsGlobal={handleToggleHighlightsGlobal}
                highlighted={highlighted}
                setHighlighted={setHighlighted}
                studyTags={studyTags}
                handleSortByTag={handleSortByTag}
                handleSortByPublicationDate={handleSortByPublicationDate}
                handleSortByLanguage={handleSortByLanguage}
                handleSortByType={handleSortByType}
            />

            <div className="toggle-status">
                {fullTextSubheadings.map((sub, i) => {
                    const count = filterForAcceptedStudies.filter(study => study.fullTextStatus === sub.key).length;
                    const isActive = fullTextStatusFilter === sub.label;
                    return (
                        <button
                            key={i}
                            onClick={() => setFullTextStatusFilter(sub.label)}
                            style={isActive ? { fontWeight: "700", backgroundColor: "#213547", color: "white" } : {}}
                        >
                            {sub.label} ({count})
                        </button>
                    )
                })}
            </div>

            {/* Second vote notice */}
            {(fullTextStatusFilter == "AWAITING SECOND VOTE") && (
                <p className="filter-notice" style={{ color: "red" }}>Studies that you have voted on will not appear</p>
            )}

            {/* Filter notice */}
            <div>
                {searchFilter && (
                    <h3 className="filter-notice">Filter: {searchFilter}</h3>
                )}
            </div>
            
            <StudyCard 
                studies={screenedStudies}
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
                fullTextExclusionReasons={fullTextExclusionReasons}
                setFullTextExclusionReasons={setFullTextExclusionReasons}
                searchFilter={searchFilter}
                setSearchFilter={setSearchFilter}
                highlighted={highlighted}
                setHighlighted={setHighlighted}
            />
        </div>
    )
}