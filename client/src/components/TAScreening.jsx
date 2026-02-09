import { useState, useEffect } from "react"
import StudyCard from "./StudyCard";
import Navbar from "./Navbar";
import { handleSortByOrder, getTAStatus, canUserVoteTA } from "../utils/screeningTools";
import ScreeningFilters from "./ScreeningFilters";

export default function TAScreening(props) {
    const { 
        studies, 
        setStudies, 
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

    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('index_asc');
    const [searchFilterInput, setSearchFilterInput] = useState("");
    const [statusFilter, setStatusFilter] = useState("UNSCREENED");
    const [highlighted, setHighlighted] = useState(false);
    const [hideDetails, setHideDetails] = useState(false);

    const [screenings, setScreenings] = useState({});
    useEffect(() => {
        fetch("http://localhost:5005/api/screenings/summary", {
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

    function handleItemsPerPage(e) {
        setItemsPerPage(e.target.value);
        setCurrentPage(1);
    }
    
    const [tagFilter, setTagFilter] = useState("")
    function handleSortByTag(value) {
        setTagFilter(value)
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
        setStatusFilter(filter)
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
        setStatusFilter("UNSCREENED")
        setSortBy('index_asc');
        setHighlighted(false);
        setItemsPerPage(25);
        setTagFilter("");
    }

    function countByStatus(status) {
        return studiesWithScreening.filter(
            study => getTAStatus(study.screening, user?.userid) === status
        ).length;
    }

    const studiesSafe = Array.isArray(studies) ? studies : [];
    
    const studiesWithScreening = studiesSafe.map(study => ({
        ...study,
        screening: screenings[study.id] ?? {
            TA: { ACCEPT: [], REJECT: [] },
            FULLTEXT: { ACCEPT: [], REJECT: [] }
        }
    }))

    const filteredStudies = studiesWithScreening
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
    
    const filteredStudiesByStatus = filteredStudies.filter(study => {
        const status = getTAStatus(study.screening, user?.userid);

        if(statusFilter === "UNSCREENED") return status === "UNSCREENED";
        if(statusFilter === "PENDING") return status === "PENDING";
        if(statusFilter === "CONFLICT") return status === "CONFLICT";
        if(statusFilter === "REJECTED") return status === "REJECTED";
        if(statusFilter === "ALREADY VOTED") return status === "ALREADY VOTED";
        return true;
    })
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const sortedStudies = handleSortByOrder(filteredStudiesByStatus, sortBy);
    const visibleStudies = sortedStudies.slice(startIndex, endIndex);

    return (
        <>
        <Navbar />
        <div className="page-container">
            <h2>
                <i className="fa-solid fa-magnifying-glass"></i> Title & Abstract Screening
            </h2>

            {/* Navigation bar for the screening */}
            <ScreeningFilters
                studies={studiesWithScreening}
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
                hideDetails={hideDetails}
                studyTags={studyTags}
                handleSortByTag={handleSortByTag}
                handleSortByPublicationDate={handleSortByPublicationDate}
                handleSortByLanguage={handleSortByLanguage}
                handleSortByType={handleSortByType}
                clearFilters={clearFilters}
            />

            <div className="toggle-status">
                <button onClick={() => toggleStudyStatusShowing("UNSCREENED")}
                style={ statusFilter === "UNSCREENED" ? { 
                    fontWeight: "700", 
                    backgroundColor: "#213547", 
                    color: "white" 
                    } : {}}
                >
                    UNSCREENED ({countByStatus("UNSCREENED")})
                </button>

                <button onClick={() => toggleStudyStatusShowing("PENDING")}
                style={ statusFilter === "PENDING" ? { 
                    fontWeight: "700", 
                    backgroundColor: "#213547", 
                    color: "white" 
                    } : {}}
                >
                    PENDING ({countByStatus("PENDING")})
                </button>

                <button onClick={() => toggleStudyStatusShowing("ALREADY VOTED")}
                style={ statusFilter === "ALREADY VOTED" ? { 
                    fontWeight: "700", 
                    backgroundColor: "#213547", 
                    color: "white" 
                    } : {}}
                >
                    ALREADY VOTED ({countByStatus("ALREADY VOTED")})
                </button>

                <button onClick={() => toggleStudyStatusShowing("CONFLICT")}
                style={ statusFilter === "CONFLICT" ? { 
                    fontWeight: "700", 
                    backgroundColor: "#213547", 
                    color: "white" 
                    } : {}}
                >
                    CONFLICT ({countByStatus("CONFLICT")})
                </button>

                <button onClick={() => toggleStudyStatusShowing("REJECTED")}
                style={ statusFilter === "REJECTED" ? { 
                    fontWeight: "700", 
                    backgroundColor: "#213547", 
                    color: "white" 
                    } : {}}
                >
                    REJECTED ({countByStatus("REJECTED")})
                </button>
            </div>

            {/* Second vote notice */}
            {(statusFilter == "PENDING") && (
                <p className="filter-notice" /*{style={{ color: "red" }}}*/>Studies that you have voted on will not appear</p>
            )}

            {/* Filter notice */}
            <div>
                {searchFilter && (
                    <h3 className="filter-notice">Filter: {searchFilter}</h3>
                )}
            </div>

            {/* Output section */}
            <StudyCard 
                studies={visibleStudies} 
                refreshScreenings={refreshScreenings}
                toggleDetails={toggleDetails}
                setToggleDetails={setToggleDetails}
                studyTags={studyTags}
                setStudyTags={setStudyTags}
                inclusionCriteria={inclusionCriteria} 
                setInclusionCriteria={setInclusionCriteria} 
                exclusionCriteria={exclusionCriteria} 
                setExclusionCriteria={setExclusionCriteria}
                searchFilter={searchFilter}
                setSearchFilter={setSearchFilter}
                highlighted={highlighted}
                setHighlighted={setHighlighted}
                hideDetails={hideDetails}
                setHideDetails={setHideDetails}
            />

            <br />
            <br />

            {studiesWithScreening.length > 0 && (
                <button onClick={handleLoadMoreStudies}>
                    Load more...
                </button>
            )}
        </div>
    </>
    )
}