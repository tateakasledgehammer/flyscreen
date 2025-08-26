import { useState, useEffect } from "react"
import StudyCard from "./StudyCard";

export default function TAScreening(props) {
    const { studies, setStudies, savedStudies, toggleDetails, setToggleDetails } = props;

    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1)

    const [sortBy, setSortBy] = useState('index_asc');
    const [searchFilter, setSearchFilter] = useState(null);

    function handleItemsPerPage(e) {
        setItemsPerPage(e.target.value);
        setCurrentPage(1);
    }
    
    function handleSortByOrder(studies) {
        return [...studies].sort((a, b) => {
            switch (sortBy) {
                case 'year_asc':
                    return (a.year - b.year);
                case 'year_des':
                    return (b.year - a.year);
                case 'title_asc':
                    return a.title.localeCompare(b.title);
                case 'title_des':
                    return b.title.localeCompare(a.title);
                case 'author_asc':
                    return a.authors.localeCompare(b.authors);
                case 'author_des':
                    return b.authors.localeCompare(a.authors);
                case 'index_asc':
                    return a.id.localeCompare(b.id)
                default:
                    return 0;
            }
        });
    }

    useEffect(() => {
        setStudies(prev => handleSortByOrder(prev, sortBy));
    }, [sortBy]);
    
    function handleSetSearchFilter() {

    }
    function handleRemoveSearchFilter() {

    }
    function handleToggleDetailsGlobal() {

    }
    function handleToggleHighlights() {

    }
    function handleLoadMoreStudies() {
        setItemsPerPage(itemsPerPage * 2)
    }

    const sortedStudies = handleSortByOrder(studies);
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
                </select>

                {/* Filter studies */}
                <label>Set A Filter</label>
                <input type="text" id="newFilterInput" placeholder="Set a filter..." />
                <button id="addFilterBtn" onClick={handleSetSearchFilter}>Add Filter</button>
                <button id="clearFilterBtn" onClick={handleRemoveSearchFilter}>Clear</button>

                {/* Toggle highlights / abstract */}
                <button id="toggleDetailsBtn" onClick={handleToggleDetailsGlobal}>▲ Hide Details</button>
                <button id="toggleHighlightableBtn" onClick={handleToggleHighlights}>Toggle Highlights Off</button>
            </div>

            {/* Filter notice */}
            <div>

            </div>

            {/* Output section */}
            <StudyCard 
                studies={visibleStudies} 
                setStudies={setStudies} 
                toggleDetails={toggleDetails}
                setToggleDetails={setToggleDetails}
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