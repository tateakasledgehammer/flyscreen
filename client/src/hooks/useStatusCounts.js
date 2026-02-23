import { useMemo } from "react";

export default function useStatusCounts(studies, user, statusFunction) {
    const countByStatus = useMemo(() => {
        const counts = {
            UNSCREENED: 0,
            PENDING: 0,
            CONFLICT: 0,
            ACCEPTED: 0,
            REJECTED: 0
        };
    
        for (const study of studies) {
            const status = statusFunction(study.screening, user?.userid);
            if (counts[status] !== undefined) {
                counts[status]++;
            }
        }

        return counts;
    }, [studies, user, statusFunction]);

    function matchesStatus(study, statusFilter) {
        if (!statusFilter) return true;
        const status = statusFunction(study.screening, user?.userid);
        return status === statusFilter;
    }

    return { countByStatus, matchesStatus }
}