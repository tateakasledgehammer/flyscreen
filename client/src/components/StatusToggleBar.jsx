export default function StatusToggleBar({
    statusFilter,
    setStatusFilter,
    countByStatus,
    totalCount
}) {
    {/* status filters */}
    const statuses = [
        { key: "UNSCREENED", label: "Unscreened" }, 
        { key: "PENDING_MINE", label: "Awaiting Your Vote" }, 
        { key: "PENDING_OTHERS", label: "Already Voted" }, 
        { key: "CONFLICT", label: "Conflict" }, 
        { key: "ACCEPTED", label: "Accepted" }, 
        { key: "REJECTED", label: "Rejected" }
    ];

    return (
        <div className="toggle-status">
            {statuses.map(({ key, label }) => (
                <button 
                    key={key}
                    onClick={() => setStatusFilter(key)}
                    style={ statusFilter === key ? { 
                        fontWeight: "700", 
                        backgroundColor: "#213547", 
                        color: "white" 
                        } : {}
                    }
                >
                    {label} ({countByStatus[key] ?? 0})
                </button>
            ))}            
        </div>
    )
}