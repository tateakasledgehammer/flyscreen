/**
 * Study shape (post-import, canonical):
 * {
 *   id: number
 *   title: string
 *   abstract: string
 *   authors: string
 *   year: number | null
 *   journal: string
 *   keywords: string
 *   votes: { accept: User[], reject: User[] }
 *   fullTextVotes: { accept: User[], reject: User[] }
 * }
 */

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
        votes: study.votes ?? { accept: [], reject: [] },
        fullTextVotes: study.fullTextVotes ?? { accept: [], reject: [] },
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

export function updateStudyStatus(votes) {
    if (votes.accept.length >= 2) {
        return "Accepted";
    } else if (votes.reject.length >= 2) {
        return "Rejected";
    } else if (votes.reject.length === 1 && votes.accept.length === 1) {
        return "Conflict";
    } else if (votes.accept.length === 1 || votes.reject.length === 1) {
        return "Awaiting second vote";
    } else {
        return "No votes"
    };
}

export function updateFullTextScreeningStatus(fullTextVotes) {
    if (fullTextVotes.accept.length >= 2) {
        return "Full Text Accepted";
    } else if (fullTextVotes.reject.length >= 2) {
        return "Full Text Rejected";
    } else if (fullTextVotes.reject.length === 1 && fullTextVotes.accept.length === 1) {
        return "Full Text Conflict";
    } else if (fullTextVotes.accept.length === 1 || fullTextVotes.reject.length === 1) {
        return "Full Text Awaiting Second Vote";
    } else {
        return "Full Text No Votes"
    };
}

export function formatAuthors(authorString) {
    if (!authorString) return "N/A";

    const parts = authorString.split(",").map(a => a.trim());

    const authors = [];

    for (let i = 0; i < parts.length; i +=2) {
        const last = parts[i] || "";
        const first = parts[i + 1] || "";
        authors.push(`${last}`.trim());
    }

    if (authors.length === 1) {
        return authorString;
    }
    if (authors.length === 2) {
        return authors[0] + " & " + authors[1];
    }

    if (authors.length > 2) {
        return authors[0] + " et al."
    }
}

export function capitaliseFirstLetter(str) {
    if (typeof str !== 'string' || str.length === 0) {
        return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getStudyStatus(studyId, screenings) {
    const votes = screenings.filter(s => s.study_id === studyId);

    const included = votes.filter(v => v.status === "included").length;
    const excluded = votes.filter(v => v.status === "excluded").length;

    if (included >= 2) return "Accepted"
    if (excluded >= 2) return "Rejected"
    if (included > 0 && excluded > 0) return "Conflict";
    if (included === 1 || excluded === 1) return "Awaiting Second Vote"
    return "No Votes"
}

export function getFullTextStudyStatus(study) {
    const acceptVotes = Array.isArray(study.fullTextVotes?.accept) ? study.fullTextVotes.accept : [];
    const rejectVotes = Array.isArray(study.fullTextVotes?.reject) ? study.fullTextVotes.reject : [];

    const acceptCount = acceptVotes.length;
    const rejectCount = rejectVotes.length;

    if (acceptCount >= 2) return "Full Text Accepted"
    if (rejectCount >= 2) return "Full Text Rejected"
    if (acceptCount > 0 && rejectCount > 0) return "Full Text Conflict";
    if (acceptCount === 1 || rejectCount === 1) return "Full Text Awaiting Second Vote"
    
    return "Full Text No Votes"
}