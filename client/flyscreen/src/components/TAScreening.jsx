export default function TAScreening() {
    return (
        <>
            <h1><i className="fa-solid fa-magnifying-glass"></i> Title & Abstract Screening</h1>

            {/* Navigation bar for the screening */}
            <div id="screening-nav">
                {/* Items per page */}
                <label for="itemsPerPage">Show per page:</label>
                <select id="itemsPerPage">
                    <option value="25" selected>25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>

                {/* Sort studies */}
                <label for="sortBy">Sort by:</label>
                <select id="sortBy">
                    <option value="year_asc">Year (Oldest First)</option>
                    <option value="year_des">Year (Newest First)</option>
                    <option value="title_asc">Title (A - Z)</option>
                    <option value="title_des">Title (Z - A)</option>
                    <option value="author_asc">Author (A - Z)</option>
                    <option value="author_des">Author (Z - A)</option>
                    <option value="index_asc">Study Index</option>
                </select>

                {/* Filter studies */}
                <label for="filterStudies">Set A Filter</label>
                <input type="text" id="newFilterInput" placeholder="Set a filter..." />
                <button id="addFilterBtn">Add Filter</button>
                <button id="clearFilterBtn">Clear</button>

                {/* Toggle highlights / abstract */}
                <button id="toggleDetailsBtn" class="">▲ Hide Details</button>
                <button id="toggleHighlightableBtn">Toggle Highlights Off</button>
            </div>

            {/* Filter notice */}
            <div>

            </div>

            {/* Output section */}
            <div>
                
            </div>

            <br />
            <br />
            <br />
            <br />
            <br />

            {/* Load more button */}
            <button>
                Load more...
            </button>


        </>
    )
}