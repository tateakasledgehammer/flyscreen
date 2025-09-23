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
        handleSortByTag
    } = props

    return (
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
                <option value="probability_asc">Probability Score (Ascending)</option>
                <option value="probability_des">Probability Score (Descending)</option>
            </select>

            {/* Filter studies */}
            <label>Set A Filter</label>
            <input 
                onChange={(e) => setSearchFilterInput(e.target.value)}
                value={searchFilterInput}
                type="text" 
                placeholder="Set a filter..." 
            />
            <button 
                onClick={handleSetSearchFilter}
                >
                Add Filter
            </button>
            <button 
                id="clearFilterBtn" 
                onClick={handleRemoveSearchFilter}
                >
                Clear Filter
            </button>

            {/* Toggle highlights / abstract */}
            <button id="toggleDetailsBtn" onClick={handleToggleDetailsGlobal}>▲ Hide Details</button>
            
            <button id="toggleHighlightableBtn" onClick={handleToggleHighlightsGlobal}>
                {highlighted ? "Toggle Highlights Off" : "Toggle Highlights On"}
            </button>

            <select
                onChange={(e) => (handleSortByTag(e.target.value))}
            >
                <option value="">Select tag</option>
                {Array.isArray(studyTags) && (studyTags.map((tag, tagIndex) => (
                    <option key={tagIndex} value={tag}>
                        {tag}
                    </option>
                )))}
            </select>
        </div>
    )
}