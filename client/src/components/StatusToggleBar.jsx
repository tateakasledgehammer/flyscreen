export default function StatusToggleBar({
    statusFilter,
    setStatusFilter,
    countByStatus,
    totalCount
}) {
    {/* status filters */}
    const statuses = ["UNSCREENED", "PENDING", "CONFLICT", "ACCEPTED", "REJECTED"];

    <div className="toggle-status">
        {statuses.map(status => (
            <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                style={ statusFilter === status ? { 
                    fontWeight: "700", 
                    backgroundColor: "#213547", 
                    color: "white" 
                    } : {}
                }
            >
                {status} ({countByStatus[status]})
            </button>
        ))}
        
        <button onClick={() => setStatusFilter("")}>All</button>
    </div>
}