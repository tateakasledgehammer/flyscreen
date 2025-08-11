import { useState, useEffect } from "react"
import StudyCard from "./StudyCard";

export default function TAScreening(props) {
    const { studies, setStudies, savedStudies } = props;

    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [sortBy, setSortBy] = useState('index_asc');
    const [searchFilter, setSearchFilter] = useState(null);
    const [toggleDetails, setToggleDetails] = useState(null)

    function handleItemsPerPage() {

    }
    
    function handleSortByOrder(studies) {
        return [...studies].sort((a, b) => {
            switch (sortBy) {
                case 'year_asc':
                    return (a.PY?.[0] || 0) - (b.PY?.[0] || 0);
                case 'year_des':
                    return (b.PY?.[0] || 0) - (a.PY?.[0] || 0);
                case 'title_asc':
                    return (a.T1?.[0] || '').localeCompare(b.T1?.[0] || 0)
                case 'title_des':
                    return (b.T1?.[0] || '').localeCompare(a.T1?.[0] || 0)
                case 'author_asc':
                    return (a.AU?.[0] || '').localeCompare(b.AU?.[0] || 0);
                case 'author_des':
                    return (b.AU?.[0] || '').localeCompare(a.AU?.[0] || 0);
                case 'index_asc':
                    return a.index - b.index;
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

    }

    return (
        <>
            <h1>
                <i className="fa-solid fa-magnifying-glass"></i> Title & Abstract Screening
            </h1>

            {/* Navigation bar for the screening */}
            <div id="screening-nav">
                {/* Items per page */}
                <label>Show per page:</label>
                <select id="itemsPerPage" onChange={handleItemsPerPage}>
                    <option defaultValue={0}>Select</option>
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
            <StudyCard studies={studies} setStudies={setStudies} />

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