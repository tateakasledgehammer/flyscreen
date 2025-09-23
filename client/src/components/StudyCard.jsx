import { useEffect, useState } from "react";
import { updateStudyStatus, formatAuthors, updateFullTextScreeningStatus } from "../utils/screeningTools";
import StudyInfo from "./StudyInfo";

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
        setHighlighted,
        study
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

                const status = updateStudyStatus(votes);
    
                console.log("Conflict resolved", `Updating study ${studyId} by ${user} - action: ${action}`, votes, "Status: ", status);
    
                return { ...study, votes, status };
            })
            localStorage.setItem("studies", JSON.stringify(updated));
            return updated;
        })
    }

    function handleFullTextVote(studyId, action) {
        setStudies(prev => {
            const updated = prev.map(study => {
                if (study.id !== studyId) return study;
                
                let fullTextVotes = {
                    accept: study.fullTextVotes.accept.filter(u => u.id !== user.id),
                    reject: study.fullTextVotes.reject.filter(u => u.id !== user.id)
                };

                if (action === "accept") {
                    fullTextVotes.accept.push(user);
                } else if (action === "reject") {
                    fullTextVotes.reject.push(user);
                } else if (action === "remove") {
                    fullTextVotes = { accept: [], reject: [] };
                }

                fullTextVotes = {
                    accept: [...new Map(fullTextVotes.accept.map(u => [u.id, u])).values()],
                    reject: [...new Map(fullTextVotes.reject.map(u => [u.id, u])).values()]
                }

                const fullTextStatus = updateFullTextScreeningStatus(fullTextVotes);

                console.log(`Updating study ${studyId} by ${user} - action: ${action}`, fullTextVotes, "Full Text Screening Status: ", fullTextStatus);

                return { ...study, fullTextVotes, fullTextStatus }
            })
            localStorage.setItem("studies", JSON.stringify(updated));
            return updated;
        })
    }

    function handleResolveFullTextConflict(studyId, action) {
        setStudies(prev => {
            const updated = prev.map(study => {
                if (study.id !== studyId) return study;

                let fullTextVotes = {
                    accept: study.fullTextVotes.accept,
                    reject: study.fullTextVotes.reject
                };

                if (action === "accept") {
                    fullTextVotes.accept.push(user)
                } else if (action === "reject") {
                    fullTextVotes.reject.push(user);
                }
    
                if (fullTextVotes.accept.length >=3) fullTextVotes.accept.pop();
                if (fullTextVotes.reject.length >= 3) fullTextVotes.reject.pop();

                const fullTextStatus = updateFullTextScreeningStatus(fullTextVotes);
    
                console.log("Conflict resolved", `Updating study ${studyId} by ${user} - action: ${action}`, fullTextVotes, "Status: ", fullTextStatus);
    
                return { ...study, fullTextVotes, fullTextStatus };
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
        setStudies(prev => 
            prev.map(study =>
                study.id === studyId ? {...study, tagStatus: value} : study
            )
        )
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

                    <StudyInfo
                        study={study}
                        highlighted={highlighted}
                        highlightContent={highlightContent}
                        inclusionCriteria={inclusionCriteria}
                        exclusionCriteria={exclusionCriteria}
                        searchWords={searchWords}
                        isExpanded={isExpanded}
                    />
                    
                    {/* Actions section */}

                    <div className="actions">
                        {/* TITLE ABSTRACT SCREENING BUTTONS */}
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
                        {(study.status === "Rejected") && (
                                <button onClick={() => handleVote(study.id, "remove")}>REVERT</button>
                        )}

                        {/* FULL TEXT SCREENING BUTTONS */}
                        {(study.fullTextStatus === "Full Text No Votes") || (study.fullTextStatus === "Full Text Awaiting Second Vote") && (
                            <>
                                <button 
                                    className="accept-btn" 
                                    onClick={() => handleFullTextVote(study.id, "accept")}
                                >
                                    FT ACCEPT
                                </button>

                                <button 
                                    className="reject-btn" 
                                    onClick={() => handleFullTextVote(study.id, "reject")}
                                >
                                    FT REJECT
                                </button>
                                <button 
                                    onClick={() => handleFullTextVote(study.id, "remove")}
                                >
                                    FT REVERT
                                </button>
                            </>
                        )}

                        {(study.fullTextStatus === "Full Text Conflict") && (
                            <>
                                <button className="accept-btn" onClick={() => handleResolveFullTextConflict(study.id, "accept")}>CONFIRM FT ACCEPT</button>
                                <button className="reject-btn" onClick={() => handleResolveFullTextConflict(study.id, "reject")}>CONFIRM FT REJECT</button>
                                <button onClick={() => handleFullTextVote(study.id, "remove")}>REVERT</button>
                            </>
                        )}
                        {(study.fullTextStatus === "Full Text Accepted" || study.fullTextStatus === "Full Text Rejected") && (
                            <button 
                                onClick={() => handleFullTextVote(study.id, "remove")}
                            >
                                FT REVERT
                            </button>
                        )}
                        
                        {/* REVERT / NOTE / TAG for all */}
                        <button onClick={(e) => (handleAddNote(study.id, e.target.value))}>ADD NOTE</button>
                        <select
                            value={study.tagStatus || ""}
                            onChange={(e) => (handleAssignTag(study.id, e.target.value))}
                        >
                            <option value="">Select tag</option>
                            {Array.isArray(studyTags) && (studyTags.map((tag, tagIndex) => (
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
                    {study.status === "Accepted" && (
                        <>
                            <p>Accept vote: {study.fullTextVotes.accept.map(user => user.username).join(", ")}</p>
                            <p>Reject vote: {study.fullTextVotes.reject.map(user => user.username).join(", ")}</p>
                        </>
                    )}
                </div>
            )})}
        </div>
    )
}