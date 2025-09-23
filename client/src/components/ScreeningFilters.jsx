import { handleSortByOrder } from "../utils/screeningTools";

export default function ScreeningFilters(props) {
    const {
        studies,
        setSortBy,
        handleItemsPerPage,
        itemsPerPage,
        searchFilterInput,
        setSearchFilterInput,
        handleSetSearchFilter,
        handleRemoveSearchFilter,
        handleToggleDetailsGlobal,
        handleToggleHighlightsGlobal,
        highlighted,
        studyTags,
        handleSortByTag,
        fullTextExclusionReasons,
        handleSortByFullTextExclusionReason,
        showExclusionFilter
    } = props

    return (
        <div className="screening-nav">
            {/* Items per page */}
            <div className="nav-group">
                <i className="fa-solid fa-list-ol"></i>
                <select id="itemsPerPage" onChange={handleItemsPerPage} value={itemsPerPage}>
                    <option defaultValue={25}>Select</option>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
                <span>per page</span>
            </div>

            {/* Sort studies */}
            <div className="nav-group">
                <i className="fa-solid fa-sort"></i>
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
            </div>

            {/* Filter studies */}
            <div className="nav-group filter-group">
                <i className="fa-solid fa-filter"></i>
                <input 
                    onChange={(e) => setSearchFilterInput(e.target.value)}
                    value={searchFilterInput}
                    type="text" 
                    placeholder="Set a filter..." 
                />
                <button onClick={handleSetSearchFilter}>Add</button>
                <button onClick={handleRemoveSearchFilter}>Clear</button>
            </div>

            {/* Toggle highlights / abstract */}
            <div className="nav-group">
                <button id="toggleDetailsBtn" onClick={handleToggleDetailsGlobal}>
                    ▲ Hide Details
                </button>
                <button id="toggleHighlightableBtn" onClick={handleToggleHighlightsGlobal}>
                    {highlighted ? "Highlights Off" : "Highlights On"}
                </button>
            </div>

            {/* Tag filter */}
            <div className="nav-group">
                <i className="fa-solid fa-tag"></i>
                <select onChange={(e) => (handleSortByTag(e.target.value))}>
                    <option value="">Select tag</option>
                    {Array.isArray(studyTags) && (studyTags.map((tag, tagIndex) => (
                        <option key={tagIndex} value={tag}>
                            {tag}
                        </option>
                    )))}
                </select>
            </div>

            {showExclusionFilter && (
            <div className="nav-group">
                <i className="fa-solid fa-rectangle-xmark"></i>
                <select
                    onChange={(e) => (handleSortByFullTextExclusionReason(e.target.value))}
                >
                    <option value="">Select exclusion reason</option>
                    {Array.isArray(fullTextExclusionReasons) && (fullTextExclusionReasons.map((reason, reasonIndex) => (
                        <option key={reasonIndex} value={reason}>
                            {reason}
                        </option>
                    )))}
                </select>
            </div>
            )}
        </div>
    )
}