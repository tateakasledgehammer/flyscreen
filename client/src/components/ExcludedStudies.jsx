import { formatAuthors, handleSortByOrder } from "../utils/screeningTools";
import StudyCard from "./StudyCard";
import ScreeningFilters from "./ScreeningFilters";
import { useState, useEffect } from "react";

export default function ExcludedStudies(props) {
    const {
        studies,
        setStudies,
        toggleDetails,
        setToggleDetails,
        studyTags,
        setStudyTags,
        user,
        setUser,
        inclusionCriteria,
        setInclusionCriteria,
        exclusionCriteria,
        setExclusionCriteria,
        fullTextExclusionReasons,
        setFullTextExclusionReasons,
        searchFilter,
        setSearchFilter,
        showExclusionFilter
    } = props;

    const [sortBy, setSortBy] = useState('index_asc');
    const [searchFilterInput, setSearchFilterInput] = useState("");
    const [highlighted, setHighlighted] = useState(false)
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setStudies(prev => handleSortByOrder(prev, sortBy));
    }, [sortBy]);

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

    const [tagFilter, setTagFilter] = useState("")
    function handleSortByTag(value) {
        setTagFilter(value)
    }

    function handleSortByFullTextExclusionReason(value) {
        setTagFilter(value)
    }

    function handleExportStudies() {
        alert("This function has not been set up")
    }

    function handleSortByPublicationDate() {
        const years = studies.map(study => study.year);
        const filteredYears = [...new Set(years)]
        console.log("Dates: ", filteredYears);
    }

    const rejectedStudies = studies
        .filter(study => study.fullTextStatus === "Full Text Rejected")
        .filter(study => {
            if (!searchFilter) return true;
            const term = searchFilter.toLocaleLowerCase();
            return (
                study.title.toLowerCase().includes(term) ||
                study.abstract.toLowerCase().includes(term) ||
                study.keywords.toLowerCase().includes(term)
            )
        });

    const [selectedYear, setSelectedYear] = useState(null);
    function handleSortByPublicationDate(value) {
        setSelectedYear(value);
    }
    const filteredStudiesBySelectedYear = rejectedStudies.filter(study => {
        if (!selectedYear) return true;
        return String(selectedYear) === String(study.year);
    })

    const filteredRejectedStudies = filteredStudiesBySelectedYear.filter((study) => {
        if (!tagFilter) return true;
        return study.tagStatus === tagFilter || study.fullTextExclusionStatus === tagFilter;
    })


    return (
        <div className="page-container">
            <h2><i className="fa-solid fa-list-check"></i> Manage Excluded Studies</h2>
            <div className="filter-notice">
                <h3>Your Excluded Studies ({rejectedStudies.length})</h3>
                <button onClick={handleExportStudies}>Export studies</button>
            </div>
            {/*
                <ul>
                    {acceptedStudies.map((study) => (
                        <>
                            <h4 key={study.id}>"{study.title}"" by <i>{formatAuthors(study.authors)}</i></h4>
                            <p key={study.id}>{study.abstract}</p>
                            <hr />
                        </>
                    ))}
                </ul>
            */}

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
                handleSortByFullTextExclusionReason={handleSortByFullTextExclusionReason}
                fullTextExclusionReasons={fullTextExclusionReasons}
                handleSortByPublicationDate={handleSortByPublicationDate}

                showExclusionFilter={true}
            />

            {/* Filter notice */}
            <div>
                {searchFilter && (
                    <h3 className="filter-notice">Filter: {searchFilter}</h3>
                )}
            </div>
            
            <StudyCard 
                studies={filteredRejectedStudies}
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