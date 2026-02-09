const safeString = (val) => 
    typeof val === "string" ? val : "";

const safeNumber = (val) => 
    typeof val === "number"
        ? val
        : parseInt(val, 10) || 0;

export function ensureStudyShape(study) {
    return {
        ...study,
        title: study.title ?? "",
        authors: study.authors ?? "",
        year: study.year ?? null,
        screening: study.screening ?? {
            TA: { ACCEPT: [], REJECT: [] },
            FULLTEXT: { ACCEPT: [], REJECT: [] }
        },
        probabilityScore: study.probabilityScore ?? { score: 0, details: {} }
    };
}

export function handleSortByOrder(studies, sortBy) {
    return [...studies].sort((a, b) => {
        switch (sortBy) {
            case 'year_asc':
                return safeNumber(a.year) - safeNumber(b.year);
            case 'year_des':
                return safeNumber(b.year) - safeNumber(a.year);
            case 'title_asc':
                return safeString(a.title).localeCompare(safeString(b.title));
            case 'title_des':
                return safeString(b.title).localeCompare(safeString(a.title));
            case 'author_asc':
                return safeString(a.authors).localeCompare(safeString(b.authors));
            case 'author_des':
                return safeString(b.authors).localeCompare(safeString(a.authors));
            case 'index_asc':
                return safeNumber(a.id) - safeNumber(b.id);
            case 'probability_asc':
                return (a.probabilityScore?.score || 0) -
                    (b.probabilityScore?.score || 0);
            case 'probability_des':
                return (b.probabilityScore?.score || 0) -
                    (a.probabilityScore?.score || 0);
            default:
                return 0;
        }
    });
}

/* CAN USERS VOTE */
export function canUserVoteTA(screening, currentUserId) {
    const ta = screening?.TA;

    if (!ta) return true
    
    const a = ta.ACCEPT.length;
    const r = ta.REJECT.length;

    if (a >= 2 || r >= 2) return false;
    if (a > 0 && r > 0) return true;

    const userAccepted = ta.ACCEPT.includes(currentUserId);
    const userRejected = ta.REJECT.includes(currentUserId);
    const userHasVoted = userAccepted || userRejected;

    if (userHasVoted) return false;

    return true;
}

export function canUserVoteFT(screening, currentUserId) {
    const ft = screening?.FULLTEXT;

    if (!ft) return true
    
    const a = ft.ACCEPT.length;
    const r = ft.REJECT.length;

    if (a >= 2 || r >= 2) return false;
    if (a > 0 && r > 0) return true;

    const userAccepted = ft.ACCEPT.includes(currentUserId);
    const userRejected = ft.REJECT.includes(currentUserId);
    const userHasVoted = userAccepted || userRejected;

    if (userHasVoted) return false;

    return true;
}

/* SCREENING STATUS */
export function getTAStatus(screening, currentUserId) {
    const ta = screening?.TA;

    if (!ta || (ta.ACCEPT.length === 0 || ta.REJECT.length === 0)) {
        return "UNSCREENED";
    }
    
    const a = ta.ACCEPT.length;
    const r = ta.REJECT.length;

    if (a >= 2) return "ACCEPTED";
    if (r >= 2) return "REJECTED";
    if (a > 0 && r > 0) return "CONFLICT";

    const userAccepted = ta.ACCEPT.includes(currentUserId);
    const userRejected = ta.REJECT.includes(currentUserId);
    const userHasVoted = userAccepted || userRejected;

    if (!userHasVoted) return "PENDING"

    return "ALREADY VOTED";
}
export function getFullTextStatus(screening, currentUserId) {
    const ft = screening?.FULLTEXT;

    if (!ft || (ft.ACCEPT.length === 0 || ft.REJECT.length === 0)) {
        return "UNSCREENED";
    }
    
    const a = ft.ACCEPT.length;
    const r = ft.REJECT.length;

    if (a >= 2) return "ACCEPTED";
    if (r >= 2) return "REJECTED";
    if (a > 0 && r > 0) return "CONFLICT";

    const userAccepted = ft.ACCEPT.includes(currentUserId);
    const userRejected = ft.REJECT.includes(currentUserId);
    const userHasVoted = userAccepted || userRejected;

    if (!userHasVoted) return "PENDING"

    return "ALREADY VOTED";
}

/* FORMATTING */
export function formatAuthors(authorString) {
    if (!authorString) return "N/A";

    const parts = authorString.split(",").map(a => a.trim());
    const authors = [];

    for (let i = 0; i < parts.length; i +=2) {
        const last = parts[i] || "";
        authors.push(`${last}`.trim());
    }

    if (authors.length === 1) return authorString;
    if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
    if (authors.length > 2) return `${authors[0]} et al.`
}

export function capitaliseFirstLetter(str) {
    if (typeof str !== 'string' || str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/* PROBABILIY SCORE MANGEMENT */
export function handleProbabilityScore({
    abstract = "",
    keywords = "",
    inclusionCriteria = [],
    exclusionCriteria = []    
}) {

    const mainString = `${abstract} ${keywords}`.toLowerCase();

    let score = 0;
    const inclusionMatches = {};
    const exclusionMatches = {};

    inclusionCriteria.forEach(section => {
        const matches = (section.criteria || [])
            .map(term => term.trim().toLowerCase())
            .filter(Boolean)
            .filter(term => mainString.includes(term.toLowerCase())
        );

        inclusionMatches[section.category] = 
            matches.length > 0 ? matches : [];

        if (matches.length > 0) score +=1;
    });

    exclusionCriteria.forEach(section => {
        const matches = (section.criteria || [])
            .map(term => term.trim().toLowerCase())
            .filter(Boolean)
            .filter(term => mainString.includes(term.toLowerCase())
        );

        exclusionMatches[section.category] = 
            matches.length > 0 ? matches : [];

        if (matches.length > 0) score -=1;
    });

    return {
        score,
        inclusionMatches,
        exclusionMatches
    };
}
