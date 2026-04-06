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
export function canUserVoteTA(screening) {
    if (!screening || !screening.TA) return false;

    const { votes = [], myVote = null } = screening.TA;

    if (myVote) return false;
    if (votes.length >= 2) return false;

    return true;
}
export function canUserVoteFT(screening) {
    if (!screening || !screening.FULLTEXT) return false;

    const { votes = [], myVote = null } = screening.FULLTEXT;

    if (myVote !== null) return false;
    if (votes.length >= 2) return false;

    return true;
}

/* SCREENING STATUS */
export function getTAStatus(screening) {
    if (!screening || !screening.TA) return "UNSCREENED";
    return screening.TA.status || "UNSCREENED";
}

export function getFTStatus(screening) {
    if (!screening || !screening.FULLTEXT) return "UNSCREENED";
    return screening.FULLTEXT.status || "UNSCREENED";
}


/* FORMATTING */
export function formatAuthors(authors) {
    if (!authors) return "N/A";

    if (Array.isArray(authors)) {
        if (authors.length === 1) return authors;
        if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
        if (authors.length > 2) return `${authors[0]} et al.`
        return "N/A";
    }

    const parts = authors.split(";").map(a => a.trim()).filter(Boolean);

    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return `${parts[0]} & ${parts[1]}`;
    if (parts.length > 2) return `${parts[0]} et al.`;
    
    return "N/A";
}

export function formatKeywords(keywords) {
    if (!keywords) return "N/A";

    if (Array.isArray(keywords)) {
        return keywords.join(", ");
    }

    return keywords.split(";").map(k => k.trim()).join(", ");
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
