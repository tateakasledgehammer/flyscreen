export function handleSortByOrder(studies, sortBy) {
        return [...studies].sort((a, b) => {
            switch (sortBy) {
                case 'year_asc':
                    return (a.year - b.year);
                case 'year_des':
                    return (b.year - a.year);
                case 'title_asc':
                    return a.title.localeCompare(b.title);
                case 'title_des':
                    return b.title.localeCompare(a.title);
                case 'author_asc':
                    return a.authors.localeCompare(b.authors);
                case 'author_des':
                    return b.authors.localeCompare(a.authors);
                case 'index_asc':
                    return a.id.localeCompare(b.id)
                case 'probability_asc':
                    return 0;
                case 'probability_des':
                    return 0;
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