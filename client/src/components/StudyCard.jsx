import { useEffect, useState } from "react";
import { updateStudyStatus } from "../utils/screeningTools";

export default function StudyCard(props) {
    const { 
        studies, 
        setStudies, 
        savedStudies, 
        toggleDetails, 
        setToggleDetails, 
        studyTags, 
        setStudyTags, 
        user, 
        setUser,
        inclusionCriteria = [],
        setInclusionCriteria, 
        exclusionCriteria = [],
        setExclusionCriteria,
        searchFilter,
        setSearchFilter,
        highlighted,
        setHighlighted
    } = props;

    function handleVote(studyId, action) {
        setStudies(prev => {
            const updated = prev.map(study => {
                if (study.id !== studyId) return study;

                let votes = {
                    accept: study.votes.accept.filter(u => u.id !== user.id),
                    reject: study.votes.reject.filter(u => u.id !== user.id)
                };

                if (action === "accept") {
                    votes.accept.push(user)
                } else if (action === "reject") {
                    votes.reject.push(user);
                } else if (action === "remove") {
                    votes = { accept: [], reject: [] };
                }
                
                votes = {
                    accept: [...new Map(votes.accept.map(u => [u.id, u])).values()],
                    reject: [...new Map(votes.reject.map(u => [u.id, u])).values()]
                }
    
                const status = updateStudyStatus(votes)
    
                console.log(`Updating study ${studyId} by ${user} - action: ${action}`, votes, "Status: ", status);
    
                return { ...study, votes, status };
            })
            localStorage.setItem("studies", JSON.stringify(updated));
            return updated;
        })
    }

    function handleResolveConflict(studyId, action) {
        setStudies(prev => {
            const updated = prev.map(study => {
                if (study.id !== studyId) return study;

                let votes = {
                    accept: study.votes.accept,
                    reject: study.votes.reject
                };

                if (action === "accept") {
                    votes.accept.push(user)
                } else if (action === "reject") {
                    votes.reject.push(user);
                }
    
                if (votes.accept.length >=3) votes.accept.pop();
                if (votes.reject.length >= 3) votes.reject.pop();

                const status = updateStudyStatus(votes)
    
                console.log("Conflict resolved", `Updating study ${studyId} by ${user} - action: ${action}`, votes, "Status: ", status);
    
                return { ...study, votes, status };
            })
            localStorage.setItem("studies", JSON.stringify(updated));
            return updated;
        })
    }

    function handleToggleDetails(studyID) {
        setToggleDetails(prev => ({
            ...prev,
            [studyID]: !prev[studyID]
        }));
    }

    function handleAddNote(studyId, note) {
        setStudies(prev => 
            prev.map(study =>
                study.id === studyId ? {...study, note } : study
            )
        )
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

    function highlightContent(text, includedWords = [], excludedWords = [], filteredWords = []) {
        if (!text) return ""

        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const fullText = [
            ...includedWords.map((w) => ({ word: w.trim(), type: "include" })),
            ...excludedWords.map((w) => ({ word: w.trim(), type: "exclude" })),
            ...filteredWords.map((w) => ({ word: w.trim(), type: "filter" }))
        ];

        if (fullText.length === 0) return text;

        const regex = new RegExp(
            fullText.map((item) => escapeRegex(item.word)).join("|"),
            "gi"
        );

        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            const before = text.slice(lastIndex, match.index);
            if (before) parts.push(before);

            const found = fullText.find(
                (item) => item.word && item.word.toLowerCase() === match[0].toLowerCase().trim()
            );

            parts.push(
                <span key={match.index} className={`highlight-${found.type || "include"}`}>
                    {match[0]}
                </span>
            );

            lastIndex = regex.lastIndex;
        }

        if (lastIndex < text.length) {
            parts.push(text.slice(lastIndex));
        }

        return parts;          
    }

    const searchWords = searchFilter
        ? searchFilter
            .split(" ")       // split by spaces
            .map(w => w.trim())
            .filter(Boolean)  // remove empty strings
        : [];

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
                        <h3 className="study-title">
                            {highlighted ? (
                                <span className="highlightable">
                                    {highlightContent(study.title, inclusionCriteria, exclusionCriteria, searchWords)}
                                </span>
                            ) : 
                            <span className="highlightable">
                                    {study.title}
                            </span>
                            }
                        </h3>
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
                                <p className="keywords">
                                    <strong>Keywords: </strong>
                                    {highlighted ? (
                                        <span className="highlightable">
                                            {highlightContent(study.keywords, inclusionCriteria, exclusionCriteria, searchWords)}
                                        </span>
                                    ) : 
                                        <span className="highlightable">
                                                {study.keywords}
                                        </span>
                                    }
                                </p>
                                <p className="abstract">
                                    <strong>Abstract: </strong>
                                    {highlighted ? (
                                        <span className="highlightable">
                                            {highlightContent(study.abstract, inclusionCriteria, exclusionCriteria, searchWords)}
                                        </span>
                                    ) : 
                                        <span className="highlightable">
                                                {study.abstract}
                                        </span>
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                    
                    {/* Actions section */}

                    <div className="actions">
                        {(study.status === "No votes" || study.status === "Awaiting second vote") && (
                            <>
                                <button className="accept-btn" onClick={() => handleVote(study.id, "accept")}>ACCEPT</button>
                                <button className="reject-btn" onClick={() => handleVote(study.id, "reject")}>REJECT</button>
                                <button onClick={() => handleVote(study.id, "remove")}>REVERT</button>
                            </>
                        )}

                        {(study.status === "Conflict") && (
                            <>
                                <button className="accept-btn" onClick={() => handleResolveConflict(study.id, "accept")}>CONFIRM ACCEPT</button>
                                <button className="reject-btn" onClick={() => handleResolveConflict(study.id, "reject")}>CONFIRM REJECT</button>
                                <button onClick={() => handleVote(study.id, "remove")}>REVERT</button>
                            </>
                        )}

                        {(study.status === "Accepted" || study.status === "Rejected") && (
                            <button onClick={() => handleVote(study.id, "remove")}>REVERT</button>
                        )}
                        
                        
                        <button onClick={(e) => (handleAddNote(study.id, e.target.value))}>ADD NOTE</button>
                        <select onChange={(e) => (handleAssignTag(study.id, e.target.value))}>
                            <option value="">Select tag</option>
                            {(studyTags.map((tag, tagIndex) => (
                                <option key={tagIndex} value={tag}>
                                    {tag}
                                </option>
                            )))}
                        </select>
                    </div>

                    <h3>Status: {study.status}</h3> 

                    {(study.status === "Conflict" || study.status === "Awaiting second vote") && (
                        <>
                            <p>Accept vote: {study.votes.accept.map(user => user.username).join(", ")}</p>
                            <p>Reject vote: {study.votes.reject.map(user => user.username).join(", ")}</p>
                        </>
                    )}
                </div>
            )})}
        </div>
    )
}