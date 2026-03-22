import { useEffect } from "react";
import { 
    getTAStatus, 
    getFTStatus, 
    canUserVoteTA, 
    canUserVoteFT, 
    formatAuthors,  
} from "../utils/screeningTools";

import StudyInfo from "./StudyInfo";

export default function StudyCard(props) {
    const { 
        studies,
        toggleDetails, 
        setToggleDetails, 
        studyTags, 
        user, 
        fullTextExclusionReasons,
        searchFilter,
        refreshScreenings,        
        projectId
    } = props;

    function submitVote(studyId, stage, vote) { 
        fetch(`/api/projects/${projectId}/screenings`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                study_id: studyId,
                stage,
                vote
            })
        })
        .then(res => {
            if (!res.ok) return console.error("Vote failed");
            refreshScreenings();
        })
        .catch(err => console.error("Error submitting vote", err));
    }

    function handleToggleDetails(studyID) {
        setToggleDetails(prev => ({
            ...prev,
            [studyID]: !prev[studyID]
        }));
    }

    function highlightContent(
        text, 
        includedWords = [], 
        excludedWords = [], 
        filteredWords = []
    ) {
        if (!text) return ""
        if (typeof text !== "string") text = String(text || "");

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

    function getScoreColour(score) {
        if (score >= 0.80) return "score-green";
        if (score >= 0.60) return "score-yellow";
        if (score >= 0.40) return "score-orange";
        if (score >= 0.10) return "score-red";
        return "score-grey"
    }

    if (!studies || studies.length === 0) {
        return (
            <>
            <br />
            <h3>No studies visible.</h3>
            </>
        );
    }

    return (
        <div>
            {studies.map((study) => {
                async function resolve(decision) {
                    await fetch(`/api/projects/${projectId}/studies/${study.id}/resolve`, {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ decision, stage: "TA" })
                    });
            
                    refreshScreenings();
                }

                async function revertVote(stage) {
                    await fetch(`/api/projects/${projectId}/studies/${study.id}/revert`, {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ stage })
                    });

                    refreshScreenings();
                }

                async function handleAddNote(studyId) {
                    const content = prompt("Enter your note:");
                    if (!content) return;

                    await fetch(`/api/projects/${projectId}/notes`, {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ study_id: studyId, content })
                    });

                    refreshScreenings();
                }

                async function handleAssignTag(studyId, tag) {
                    await fetch(`/api/projects/${projectId}/tags/attach`, {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ study_id: studyId, tag })
                    });

                    refreshScreenings();
                }

                async function handleFullTextExclusion(studyId, reason) {
                    await fetch(`/api/projects/${projectId}/studies/${studyId}/fulltext-exclusion`, {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ reason })
                    });

                    refreshScreenings();
                }

                async function removeTag(studyId, tagId) {
                    await fetch(`/api/projects/${projectId}/studies/${studyId}/tags/${tagId}`, {
                        method: "DELETE",
                        credentials: "include"
                    });

                    refreshScreenings();
                }

                async function removeNote(noteId) {
                    await fetch(`/api/projects/${projectId}/notes/${noteId}`, {
                        method: "DELETE",
                        credentials: "include"
                    });

                    refreshScreenings();
                }
  
                const isExpanded = 
                    toggleDetails.hasOwnProperty(study.id)
                        ? toggleDetails[study.id] 
                        : false;

                const taStatus = getTAStatus(study.screening);
                const ftStatus = getFTStatus(study.screening);
                const canVoteTA = canUserVoteTA(study.screening, user?.id);
                const canVoteFT = canUserVoteFT(study.screening, user?.id);
                
                const scoreColour = getScoreColour(study.score ?? 0)

                return (
                <div key={study.id} className="study-card">
                    {/* Score Badge */}
                    <div className={`score-badge ${scoreColour}`}>
                        {study.score?.toFixed(2) ?? "N/A"}
                        <span className="tooltip">{study.explanation}</span>
                    </div>

                    {/* Study information */}
                    <StudyInfo
                        study={study}
                        highlightContent={highlightContent}
                        isExpanded={isExpanded}
                        handleToggleDetails={handleToggleDetails}
                    />
                    
                    {/* Actions section */}
                    <div className="actions">
                        {/* TITLE ABSTRACT SCREENING BUTTONS */}
                        {(taStatus === "UNSCREENED" || taStatus === "PENDING") && (
                            <>
                                <button disabled={!canVoteTA} onClick={() => submitVote(study.id, "TA", "ACCEPT")}>ACCEPT</button>
                                <button disabled={!canVoteTA} onClick={() => submitVote(study.id, "TA", "REJECT")}>REJECT</button>
                            </>
                        )}

                        {(taStatus === "CONFLICT") && (
                            <>
                            <button onClick={() => resolve("ACCEPT")}>Resolve as ACCEPT</button>
                            <button onClick={() => resolve("REJECT")}>Resolve as REJECT</button>
                            </>
                        )}

                        {/* FULL TEXT SCREENING BUTTONS */}
                        {((ftStatus === "UNSCREENED" || ftStatus === "PENDING" || ftStatus === "CONFLICT") && taStatus === "ACCEPTED") && (
                            <>
                                <button disabled={!canVoteFT} onClick={() => submitVote(study.id, "FULLTEXT", "ACCEPT")}>ACCEPT</button>
                                <button disabled={!canVoteFT} onClick={() => submitVote(study.id, "FULLTEXT", "REJECT")}>REJECT</button>
                            </>
                        )}

                        {taStatus === "PENDING" && study.screening.TA.myVote && (
                            <button onClick={() => revertVote("TA")}>UNDO VOTE</button>
                        )}
                        {taStatus === "CONFLICT" && (
                            <button onClick={() => revertVote("TA")}>UNDO VOTE</button>
                        )}
                        {(taStatus === "ACCEPTED" || taStatus === "REJECTED") && study.screening.TA.final && (
                            <button onClick={() => revertVote("TA")}>UNDO</button>
                        )}

                        {/* FULL TEXT EXCLUSION DROPDOWN */}
                        {taStatus === "Accepted" && (
                            <select 
                                value={study.fullTextExclusionStatus || ""} 
                                onChange={(e) => (handleFullTextExclusion(study.id, e.target.value))}
                            >
                                <option value="">Reason to exclude</option>
                                {Array.isArray(fullTextExclusionReasons) && (fullTextExclusionReasons.map((reason, reasonIndex) => (
                                    <option key={reasonIndex} value={reason}>
                                        {reason}
                                    </option>
                                )))}
                            </select>
                        )}
        
                        {/* NOTE */}
                        <button onClick={(e) => (handleAddNote(study.id))}>ADD NOTE</button>

                        {/* TAG */}
                        <select
                            value={study.tagStatus || ""}
                            onChange={(e) => (handleAssignTag(study.id, e.target.value))}
                        >
                            <option value="">Select tag</option>
                            {Array.isArray(studyTags) && (studyTags?.map((tag, tagIndex) => (
                                <option key={tagIndex} value={tag}>
                                    {tag}
                                </option>
                            )))}
                        </select>
                    </div>

                    {/* Notes & Tags */}
                    {study.fullTextExclusionStatus && (
                        <div>
                            <strong>Full Text Exclusion Reason: </strong>
                            {study.fullTextExclusionStatus}
                        </div>
                    )}

                    {Array.isArray(study.notes) && study.notes.length > 0 && (
                        <div>
                            <h3>Notes</h3>
                            <ul>
                                {study.notes.map((note) => (
                                    <li key={note.id}>
                                        <strong>{note.username}:</strong> {note.content}
                                        <button onClick={() => removeNote(note.id)}>x</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {Array.isArray(study.tags) && study.tags.length > 0 && (
                        <div>
                            <h4>Tags</h4>
                            <ul>
                                {study.tags.map((tag) => (
                                    <li key={tag.id}>
                                        {tag.name}
                                        <button onClick={() => removeTag(study.id, tag.id)}>x</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                </div>
            )})}
        </div>
    )
}