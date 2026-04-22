export default function ScreeningFiltersBar({
    searchFilter,
    setSearchFilter,
    sortOption,
    setSortOption,
    languageFilter,
    setLanguageFilter,
    typeFilter,
    setTypeFilter,
    tagFilter,
    setTagFilter,
    itemsPerPage,
    setItemsPerPage,
    highlighted,
    setHighlighted,
    clearFilters,
    studies,
    studyTags,
    setStudyTags
}) {
    return (
        <>
        <div className="filters-bar">
            {/* Search */}
            <div className="filter-item">
                <i className="fa-solid fa-layer-group"></i>
                <input
                    type="text"
                    placeholder="Search studies..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                />
            </div>

            {/* Sorting */}
            <div className="filter-item">
            <i className="fa-solid fa-arrow-down-wide-short"></i>
            <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
            >
                <option value="year-asc">Year (Old → New)</option>
                <option value="year-desc">Year (New → Old)</option>
                <option value="title-asc">Title (A → Z)</option>
                <option value="title-desc">Title (Z → A)</option>
                <option value="score-asc">Score (Low → High)</option>
                <option value="score-desc">Score (High → Low)</option>
            </select>
            </div>

            {/* Filters */}
            <div className="filter-item">
            <i className="fa-solid fa-language"></i>
            <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)}>
                <option value="">All languages</option>
                {[...new Set(studies.map(s => s.language).filter(Boolean))].map((lang, i) => (
                    <option key={i} value={lang}>{lang}</option>
                ))}
            </select>
            </div>

            {/* Type */}
            <div className="filter-item">
            <i className="fa-solid fa-shapes"></i>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="">All types</option>
                {[...new Set(studies.map(s => s.type).filter(Boolean))].map((type, i) => (
                    <option key={i} value={type}>{type}</option>
                ))}
            </select>
            </div>

            {/* Tags */} 
            <div className="filter-item">
            <i className="fa-solid fa-tags"></i>
            <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
                <option value="">All tags</option>
                {studyTags.map((tag, i) => (
                    <option key={i} value={tag}>{tag}</option>
                ))}
            </select>
            </div>
            
            {/* Type */}
            <div className="filter-item">
            <i className="fa-solid fa-list-ol"></i>
            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
            </select>
            </div>

        </div>
        <div className="filter-status">
            {/* highlights */}
            <button onClick={() => setHighlighted(prev => !prev)}>
                {highlighted ? "Highlights Off" : "Highlights On"} <i className="fa-solid fa-highlighter"></i>
            </button>

            {/* clear */}
            <button onClick={clearFilters}>Clear Filters <i className="fa-solid fa-eraser"></i>
            </button>
        </div>
        </>
    )
}

