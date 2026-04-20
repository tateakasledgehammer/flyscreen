export default function StatusToggleBar({
    statusFilter,
    setStatusFilter,
    countByStatus,
    totalCount
}) {
    {/* status filters */}
    const statuses = [
        { key: "UNSCREENED", label: "Unscreened" }, 
        { key: "PENDING_OTHERS", label: "Awaiting Your Vote" }, 
        { key: "PENDING_MINE", label: "Already Voted" }, 
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
                        backgroundColor: "var(--cream)", 
                        color: "var(--ink)",
                        } : {}
                    }
                >
                    {label} ({countByStatus[key] ?? 0})
                </button>
            ))}            
        </div>
    )
}