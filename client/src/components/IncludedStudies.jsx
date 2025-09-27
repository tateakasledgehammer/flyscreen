import { formatAuthors, handleSortByOrder } from "../utils/screeningTools";
import StudyCard from "./StudyCard";
import ScreeningFilters from "./ScreeningFilters";
import { useState, useEffect } from "react";

export default function IncludedStudies(props) {
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
    } = props;

    const [sortBy, setSortBy] = useState('index_asc');
    const [searchFilterInput, setSearchFilterInput] = useState("");
    const [highlighted, setHighlighted] = useState(false)
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

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

    function handleExportStudies() {
        alert("This function has not been set up")
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

    const acceptedStudies = studies
        .filter(study => study.fullTextStatus === "Full Text Accepted")
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

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const sortedStudies = handleSortByOrder(acceptedStudies);
    const filteredAcceptedStudies = sortedStudies.slice(startIndex, endIndex);
    

    return (
        <div className="page-container">
            <h2><i className="fa-solid fa-list-check"></i> Manage Included Studies</h2>
            <div className="filter-notice">
                <h3>Your Included Studies ({acceptedStudies.length})</h3>
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
                handleSortByPublicationDate={handleSortByPublicationDate}
                handleSortByLanguage={handleSortByLanguage}
                handleSortByType={handleSortByType}
                clearFilters={clearFilters}

            />

            {/* Filter notice */}
            <div>
                {searchFilter && (
                    <h3 className="filter-notice">Filter: {searchFilter}</h3>
                )}
            </div>

            <StudyCard 
                studies={filteredAcceptedStudies}
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