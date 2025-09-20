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

export function handleAcceptStudy(studyId) {
    setStudies(prev => {
        return prev.map(study => {
            if (study.id !== studyId) return study;

            const votes = {
                accept: study.votes.accept.filter(currentUser => currentUser !== user),
                reject: study.votes.reject.filter(currentUser => currentUser !== user)
            };
            
            votes.accept.push(user);

            const status = updateStudyStatus(votes);

            console.log("Updating study - accepted", studyId, user, votes, "Status: ", status);
            return {...study, votes, status};
    });
});
}

export function handleRejectStudy(studyId) {
    setStudies(prev => {
        return prev.map(study => {
            if (study.id !== studyId) return study;

            const votes = {
                accept: study.votes.accept.filter(currentUser => currentUser !== user),
                reject: study.votes.reject.filter(currentUser => currentUser !== user),
            };
            
            votes.reject.push(user)
            
            const status = updateStudyStatus(votes);

            console.log("Updating study - rejected", studyId, user, votes, "Status: ", status);
            return {...study, votes, status};
    });
});
}

export function handleRemoveVote(studyId) {
    setStudies(prev => {
        return prev.map(study => {
            if (study.id !== studyId) return study;

            const votes = {
                accept: study.votes.accept.filter(currentUser => currentUser !== user),
                reject: study.votes.reject.filter(currentUser => currentUser !== user)
            };

            const status = updateStudyStatus(votes);

            console.log("Updating study - reverted", studyId, user, votes, "Status: ", status);
            return {...study, votes, status};
    });
});
}