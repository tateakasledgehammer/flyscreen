export default function PaginationBar({
    totalPages,
    currentPage,
    setCurrentPage
}) {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 3; // how many pages around the current page

    const addPage = (p) => {
        pages.push(
            <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={currentPage === p ? "active" : ""}
            >
                {p}
            </button>
        );
    };

    const addEllipsis = (key) => {
        pages.push(
            <button style={{ border: "none", background: "none" }} key={key} className="ellipsis">…</button>
        );
    };

    // Always show first page
    addPage(1);

    // Left ellipsis
    if (currentPage > maxVisible) {
        addEllipsis("left");
    }

    // Middle pages
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let p = start; p <= end; p++) {
        addPage(p);
    }

    // Right ellipsis
    if (currentPage < totalPages - maxVisible + 1) {
        addEllipsis("right");
    }

    // Always show last page
    if (totalPages > 1) {
        addPage(totalPages);
    }

    return <div className="pagination">{pages}</div>;
}
