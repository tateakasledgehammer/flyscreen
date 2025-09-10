import { useState } from "react";

export default function StudyCard(props) {
    const { studies, setStudies, savedStudies, toggleDetails, setToggleDetails, studyTags, setStudyTags, user, setUser } = props;

    function handleToggleDetails(studyID) {
        setToggleDetails(prev => ({
            ...prev,
            [studyID]: !prev[studyID]
        }));
    }

    function handleAcceptStudy(studyId) {
        setStudies(prev => {
            return prev.map(study => {
                if (study.id !== studyId) return study;

                // prevent duplicate votes
                const votes = {
                    accept: [...study.votes.accept],
                    reject: study.votes.reject.filter(currentUser => currentUser !== user)
                };
                
                if (!votes.accept.includes(user)) {
                    votes.accept.push(user)
                }

                let status = ""
                if (votes.accept.length >= 2) {
                    status = "Accepted";
                }
                if (votes.reject.length >= 2) {
                    status = "Rejected";
                }
                if (votes.accept.length === 1) {
                    status = "1 vote to accept";
                }
                if (votes.reject.length === 1) {
                    status = "1 vote to reject";
                }
                if (votes.reject.length === 1 && votes.accept.length === 1) {
                    status = "Two different votes";
                }
                else status = "No votes";

                console.log("Updating study - accepted", studyId, user, votes, status);
                return {...study, votes, status};
        })})
    }

    function handleRejectStudy(studyId) {
        setStudies(prev => {
            return prev.map(study => {
                if (study.id !== studyId) return study;

                // prevent duplicate votes
                const votes = {
                    accept: study.votes.accept.filter(currentUser => currentUser !== user),
                    reject: study.votes.reject.filter(currentUser => currentUser !== user)
                };
                
                if (!votes.reject.includes(user)) {
                    votes.reject.push(user)
                }

                let status = ""
                if (votes.accept.length >= 2) {
                    status = "Accepted";
                }
                if (votes.reject.length >= 2) {
                    status = "Rejected";
                }
                if (votes.accept.length === 1) {
                    status = "1 vote to accept";
                }
                if (votes.reject.length === 1) {
                    status = "1 vote to reject";
                }
                if (votes.reject.length === 1 && votes.accept.length === 1) {
                    status = "Two different votes";
                }
                else status = "No votes";

                console.log("Updating study - rejected", studyId, user, votes, status);
                return {...study, votes, status};
        })})
    }


    function handleRemoveVote(studyId) {
        setStudies(prev => {
            return prev.map(study => {
                if (study.id !== studyId) return study;

                // prevent duplicate votes
                const votes = {
                    accept: study.votes.accept.filter(currentUser => currentUser !== user),
                    reject: study.votes.reject.filter(currentUser => currentUser !== user)
                };

                let status = ""
                if (votes.accept.length >= 2) {
                    status = "Accepted";
                }
                if (votes.reject.length >= 2) {
                    status = "Rejected";
                }
                if (votes.accept.length === 1) {
                    status = "1 vote to accept";
                }
                if (votes.reject.length === 1) {
                    status = "1 vote to reject";
                }
                if (votes.reject.length === 1 && votes.accept.length === 1) {
                    status = "Two different votes";
                }
                else status = "No votes";

                console.log("Updating study - reverted", studyId, user, votes, status);
                return {...study, votes, status};
        })})
    }

    function handleAddNote(studyId) {
        studies[studyId].note = e.target.value
        console.log(studies[studyId]);
    }

    function handleAssignTag(studyId, value) {
        setStudyTags(prev => 
            prev.map(study =>
                study.id === studyId ? {...study, tagStatus: value} : study
            )
        )
    }

    function formatAuthors(authorString) {
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

    if (!studies || studies.length === 0) {
        return <p>No studies visible. None uploaded or studies per page not set.</p>;
    }

    return (
        <div>
            {studies.map((study, index) => {
                const isExpanded = toggleDetails?.[study.id] || false;
                return (
                <div key={study.id} className="study-card">
                    {/* Study information */}
                    <div className="title-wrapper">
                        <h3 className="study-title"><span className="highlightable">{study.title}</span></h3>
                        <div className="percentile-card">XX%</div>
                    </div>
                    <div className="study-info">
                        <p><strong>Study Index: </strong>{study.id}</p>
                        <p className="authors"><strong>Authors: </strong>{formatAuthors(study.authors)}</p>
                        <p className="year"><strong>Year: </strong>{study.year}</p>
                        <p className="type"><strong>Type: </strong>{study.type}</p>
                        <p className="language"><strong>Language: </strong>{study.language}</p>
                        <p className="journal"><strong>Journal: </strong>{study.journal}</p>
                        <p className="volume"><strong>Volume: </strong>{study.volume}</p>
                        <p className="issue"><strong>Issue: </strong>{study.issue}</p>
                        <p className="doi"><strong>DOI: </strong>
                            {(study.doi !== "N/A") ? (
                                <a 
                                    href={`https://doi.org/${study.doi}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {study.doi}
                                </a>
                            ) : ("N/A")}
                        </p>
                    </div>

                    {/* Button to toggle keywords & abstract */}
                    <div>
                        <button className="adding-bottom-margin" onClick={() => (handleToggleDetails(study.id))}>
                            {!isExpanded ? "▲ Hide details" : "▼ Show details"}
                        </button>

                        {!isExpanded && (
                            <div>
                                <p className="keywords"><strong>Keywords: </strong><span className="highlightable">{study.keywords}</span></p>
                                <p className="abstract"><strong>Abstract: </strong><span className="highlightable">{study.abstract}</span></p>
                            </div>
                        )}
                    </div>
                    
                    {/* Actions section */}
                    <div className="actions">
                        <button className="accept-btn" onClick={() => (handleAcceptStudy(study.id))}>ACCEPT</button>
                        <button className="reject-btn" onClick={() => (handleRejectStudy(study.id))}>REJECT</button>
                        <button onClick={() => (handleRemoveVote(study.id))}>REVERT</button>
                        
                        <button onClick={() => (handleAddNote(index))}>ADD NOTE</button>
                        <select onChange={(e) => (handleAssignTag(index, e.target.value))}>
                            <option value="">Select tag</option>
                            {(studyTags.map((tag, tagIndex) => (
                                <option key={tagIndex} value={tag}>
                                    {tag}
                                </option>
                            )))}
                        </select>
                    </div>
                </div>
            )})}
        </div>
    )
}