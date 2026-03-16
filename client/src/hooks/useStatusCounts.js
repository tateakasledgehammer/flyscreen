import { useMemo } from "react";

export default function useStatusCounts(studies, user, statusFunction, stage) {
    const userId = user?.id || user?.userid;
    
    const countByStatus = useMemo(() => {
        const counts = {
            UNSCREENED: 0,
            PENDING: 0,
            PENDING_MINE: 0,
            PENDING_OTHERS: 0,
            CONFLICT: 0,
            ACCEPTED: 0,
            REJECTED: 0
        };
    
        for (const study of studies) {
            const status = statusFunction(study.screening, userId);
            const s = study.screening?.[stage];
            const myVote = s?.myVote;
            
            if (status === "PENDING") {
                counts.PENDING++;

                if (myVote) {
                    counts.PENDING_MINE++;
                } else {
                    counts.PENDING_OTHERS++;
                }
            } else {
                counts[status]++;
            }
        }

        return counts;
    }, [studies, user, statusFunction, stage]);

    function matchesStatus(study, statusFilter) {
        if (!statusFilter) return true;

        const status = statusFunction(study.screening, user?.userid);
        const s = study.screening?.[stage];
        const myVote = s?.myVote;

        if (statusFilter === "PENDING_MINE") {
            return status === "PENDING" && !!myVote;
        }
        if (statusFilter === "PENDING_OTHERS") {
            return status === "PENDING" && !myVote;
        }

        return status === statusFilter;
    }

    return { countByStatus, matchesStatus }
}