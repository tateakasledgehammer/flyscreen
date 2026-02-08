import { useState, useEffect } from "react";
import { handleSortByOrder, ensureStudyShape, getFullTextStatus } from "../utils/screeningTools";
import StudyCard from "./StudyCard";
import Navbar from "./Navbar";
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
    const [hideDetails, setHideDetails] = useState(false);

    const [screenings, setScreenings] = useState([]);
    useEffect(() => {
        fetch("http://localhost:5005/api/screenings", {
            credentials: "include"
        })
            .then(res => res.json())
            .then(setScreenings)
    }, []);

    function refreshScreenings() {
        fetch("http://localhost:5005/api/screenings/summary", {
            credentials: "include"
        })
            .then(res => res.json())
            .then(setScreenings);
    }

    const safeStudies = studies.map(ensureStudyShape);

    const taAcceptedStudies = safeStudies.filter(study => getStudyStatus(study.id, screenings) === "Accepted");
    
    const studiesWithFullTextStatus = taAcceptedStudies.map(study => ({
        ...study,
        status: getFullTextStatus(study)
    }));

    const fullTextSubheadings = [
        { label: "UNSCREENED", key: "Full Text No Votes" },
        { label: "AWAITING SECOND VOTE", key: "Full Text Awaiting Second Vote" },
        { label: "CONFLICT", key: "Full Text Conflict" },
        /* { label: "ACCEPTED", key: "Full Text Accepted" }, */
        { label: "REJECTED", key: "Full Text Rejected" }
    ];

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
        setHideDetails(prev => !prev);
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

    function clearFilters() {
        setSelectedType("");
        setSelectedLanguage("");
        setSelectedYear(null);
        setSearchFilter("");
        setSearchFilterInput("");
        setSortBy('index_asc');
        setHighlighted(false);
        setItemsPerPage(25);
        setTagFilter("");
    }
    
    const filteredStudies = studiesWithFullTextStatus
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
        const status = getFullTextStatus(study.screening);
        
        if(statusFilter === "UNSCREENED") return status === "UNSCREENED";
        if(statusFilter === "PENDING") return status === "PENDING";
        if(statusFilter === "CONFLICT") return status === "CONFLICT";
        if(statusFilter === "REJECTED") return status === "REJECTED";
        return true;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const sortedStudies = handleSortByOrder(filteredStudiesByFullTextStatus, sortBy);
    const screenedStudies = sortedStudies.slice(startIndex, endIndex);

    return (
        <>
        <Navbar />
        <div className="page-container">
            <h2><i className="fa-solid fa-book-open-reader"></i> Full Text Review</h2>

            <ScreeningFilters
                studies={studiesWithFullTextStatus}
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
                clearFilters={clearFilters}
            />

            <div className="toggle-status">
                {fullTextSubheadings.map((sub, i) => {
                    const count = screenedStudies.filter(study => study.fullTextStatus === sub.key).length;
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
                refreshScreenings={refreshScreenings}
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
                hideDetails={hideDetails}
                setHideDetails={setHideDetails}
            />
        </div>
        </>
    )
}