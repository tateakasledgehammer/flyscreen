import { useState, useEffect } from "react"
import StudyCard from "./StudyCard";
import { handleSortByOrder } from "../utils/screeningTools";
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
    } = props;

    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1)

    const [sortBy, setSortBy] = useState('index_asc');

    const [searchFilterInput, setSearchFilterInput] = useState("");
    const [statusFilter, setStatusFilter] = useState("UNSCREENED")

    const [highlighted, setHighlighted] = useState(false)

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

    const filteredStudies = studies.filter(study => {
        if (!searchFilter) return true;
        const term = searchFilter.toLocaleLowerCase();
        return (
            study.title.toLowerCase().includes(term) ||
            study.abstract.toLowerCase().includes(term) ||
            study.keywords.toLowerCase().includes(term)
        )
    })

    const filteredStudiesByStatus = filteredStudies.filter(study => {
        if (statusFilter === "UNSCREENED") {
            return study.status === "No votes"
        } else if (statusFilter === "AWAITING SECOND VOTE") {
            const userHasVotedCheck =
                study.votes.accept.some(u => u.username === user.username) ||
                study.votes.reject.some(u => u.username === user.username)

            return study.status === "Awaiting second vote" && !userHasVotedCheck;
        } else if (statusFilter === "CONFLICT") {
            return study.status === "Conflict"
        } else if (statusFilter === "ACCEPTED") {
            return study.status === "Accepted"
        } else if (statusFilter === "REJECTED") {
            return study.status === "Rejected"
        } else {
            return study.status === "No votes"
        }
    })
    
    const sortedStudies = handleSortByOrder(filteredStudiesByStatus);
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const visibleStudies = sortedStudies.slice(startIndex, endIndex);

    return (
        <>
            <h2>
                <i className="fa-solid fa-magnifying-glass"></i> Title & Abstract Screening
            </h2>

            {/* Navigation bar for the screening */}
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
            />

            <div className="toggle-status">
                {(statusFilter == "UNSCREENED") ? (
                    <button onClick={() => toggleStudyStatusShowing("UNSCREENED")}
                    style={{ fontWeight: "700", backgroundColor: "#213547", color: "white" }}>
                        UNSCREENED ({studies.filter(study => !study.status || study.status === "No votes").length})
                    </button>
                ) : (
                    <button onClick={() => toggleStudyStatusShowing("UNSCREENED")}>
                        UNSCREENED ({studies.filter(study => !study.status || study.status === "No votes").length})
                    </button>
                )}

                {(statusFilter == "AWAITING SECOND VOTE") ? (
                    <button onClick={() => toggleStudyStatusShowing("AWAITING SECOND VOTE")}
                    style={{ fontWeight: "700", backgroundColor: "#213547", color: "white" }}>
                        AWAITING SECOND VOTE ({studies.filter(study => !study.status || study.status === "Awaiting second vote").length})
                    </button>
                ) : (
                    <button onClick={() => toggleStudyStatusShowing("AWAITING SECOND VOTE")}>
                        AWAITING SECOND VOTE ({studies.filter(study => !study.status || study.status === "Awaiting second vote").length})
                    </button>
                )}    

                {(statusFilter == "CONFLICT") ? (
                    <button onClick={() => toggleStudyStatusShowing("CONFLICT")}
                    style={{ fontWeight: "700", backgroundColor: "#213547", color: "white" }}>
                        CONFLICT ({studies.filter(study => !study.status || study.status === "Conflict").length})
                    </button>
                ) : (
                    <button onClick={() => toggleStudyStatusShowing("CONFLICT")}>
                        CONFLICT ({studies.filter(study => !study.status || study.status === "Conflict").length})
                    </button>
                )}

                {/* commenting out accepted as only available at full text screening stage

                {(statusFilter == "ACCEPTED") ? (
                    <button onClick={() => toggleStudyStatusShowing("ACCEPTED")}
                    style={{ fontWeight: "700", backgroundColor: "#213547", color: "white" }}>
                        ACCEPTED ({studies.filter(study => !study.status || study.status === "Accepted").length})
                    </button>
                ) : (
                    <button onClick={() => toggleStudyStatusShowing("ACCEPTED")}>
                        ACCEPTED ({studies.filter(study => !study.status || study.status === "Accepted").length})
                    </button>
                )}

                */}

                {(statusFilter == "REJECTED") ? (
                    <button onClick={() => toggleStudyStatusShowing("REJECTED")}
                    style={{ fontWeight: "700", backgroundColor: "#213547", color: "white" }}>
                        REJECTED ({studies.filter(study => !study.status || study.status === "Rejected").length})
                    </button>
                ) : (
                    <button onClick={() => toggleStudyStatusShowing("REJECTED")}>
                        REJECTED ({studies.filter(study => !study.status || study.status === "Rejected").length})
                    </button>
                )}
            </div>
            
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

            {studies.length > 0 && (
                <button onClick={handleLoadMoreStudies}>
                    Load more...
                </button>
            )}
        </>
    )
}