import StudyCard from "./StudyCard";
import { useState, useEffect } from "react";
import { handleSortByOrder } from "../utils/screeningTools";
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
    } = props;

    const [sortBy, setSortBy] = useState('index_asc');
    const [searchFilterInput, setSearchFilterInput] = useState("");
    const [highlighted, setHighlighted] = useState(false)
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("ACCEPTED")

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
        setStatusFilter(filter)
    }

    function toggleStudyStatusShowing(filter) {
        setStatusFilter(filter)
    }

    const filteredStudies = studies.filter(study => {
        if (!searchFilter) return true;
        const term = searchFilter.toLocaleLowerCase();
        return (
            study.title.toLowerCase().includes(term) ||
            study.abstract.toLowerCase().includes(term) ||
            study.keywords.toLowerCase().includes(term)
        )
    })

    const filterForAcceptedStudies = filteredStudies.filter(study => {
        if (statusFilter === "ACCEPTED") {
            return study.status === "Accepted"
        }
    });

    const sortedStudies = handleSortByOrder(filterForAcceptedStudies);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const screenedStudies = sortedStudies.slice(startIndex, endIndex);

    return (
        <>
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
            />

            {/* Second vote notice */}
            {(statusFilter == "AWAITING SECOND VOTE") && (
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
                searchFilter={searchFilter}
                setSearchFilter={setSearchFilter}
                highlighted={highlighted}
                setHighlighted={setHighlighted}
            />
        </>
    )
}