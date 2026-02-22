export default function PaginationBar({
    totalPages,
    currentPage,
    setCurrentPage
}) {
    return (
        <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
                <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={currentPage === i + 1 ? "active" : ""}
                >
                    {i + 1}
                </button>
            ))}
        </div>
    )
}