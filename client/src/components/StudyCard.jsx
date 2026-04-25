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
        stage,
        studies,
        toggleDetails, 
        setToggleDetails, 
        studyTags, 
        user, 
        fullTextExclusionReasons,
        searchFilter,
        refreshScreenings,        
        projectId,
        highlightContent,
        getScoreColour,
        inclusionTerms,
        exclusionTerms
    } = props;

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

                async function handleFullTextExclusion(studyId, reason) {
                    await fetch(`/api/projects/${projectId}/screenings`, {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ 
                            study_id: studyId,
                            stage: "FULLTEXT",
                            vote: "REJECT",
                            reason
                         })
                    });
            
                    refreshScreenings();
                }
                
                async function revertVote(studyId, stage) {
                    await fetch(`/api/projects/${projectId}/studies/${studyId}/revert`, {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ stage })
                    });
            
                    refreshScreenings();
                }

                async function resolveTA(studyId, decision) {
                    await fetch(`/api/projects/${projectId}/studies/${study.id}/resolve`, {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ decision, stage: "TA" })
                    });
            
                    refreshScreenings();
                }
                async function resolveFT(studyId, decision) {
                    await fetch(`/api/projects/${projectId}/studies/${study.id}/resolve`, {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ decision, stage: "FULLTEXT" })
                    });
            
                    refreshScreenings();
                }

                const isExpanded = 
                    toggleDetails.hasOwnProperty(study.id)
                        ? toggleDetails[study.id] 
                        : false;

                const canVote = stage === "TA"
                    ? canUserVoteTA(study.screening)
                    : canUserVoteFT(study.screening);

                const status = stage === "TA"
                    ? getTAStatus(study.screening)
                    : getFTStatus(study.screening);
                
                const scoreColour = getScoreColour(study.score ?? 0)

                return (
                <div key={study.id} className="study-card">
                    {/* Score Badge */}
                    {(study.score_status === "pending" || study.score_status === "scoring") && (
                        <div className={`score-badge score-grey`}>LOADING...</div>
                    )}
                    {(study.score_status === "done" && study.explanation !== "") && (
                        <div className={`score-badge ${scoreColour}`}>
                            {study.score?.toFixed(2) ?? "N/A"}
                            <span className="tooltip">{study.explanation}</span>
                        </div>
                    )}
                    {(study.score_status === "done" && study.explanation === "") && (
                        <div className={`score-badge ${scoreColour}`}>
                            {study.score?.toFixed(2) ?? "N/A"}
                        <span className="tooltip">N/A - no criteria set or no matches</span>
                    </div>
                    )}

                    {/* Study information */}
                    <StudyInfo
                        study={study}
                        highlightContent={highlightContent}
                        isExpanded={isExpanded}
                        handleToggleDetails={handleToggleDetails}
                        searchFilter={searchFilter}
                        inclusionTerms={inclusionTerms}
                        exclusionTerms={exclusionTerms}
                    />
                    
                    <div className="actions">
                        {/* Actions section */}
                        {/* TA */}
                        {stage === "TA" && (
                            <>
                            {(status === "UNSCREENED" || status === "PENDING") && (
                                <>
                                    <button disabled={!canVote} onClick={() => submitVote(study.id, "TA", "ACCEPT")}>ACCEPT</button>
                                    <button disabled={!canVote} onClick={() => submitVote(study.id, "TA", "REJECT")}>REJECT</button>
                                </>
                            )}

                            {(status === "CONFLICT") && (
                                <>
                                <button onClick={() => resolveTA(study.id, "ACCEPT")}>Resolve as ACCEPT</button>
                                <button onClick={() => resolveTA(study.id, "REJECT")}>Resolve as REJECT</button>
                                </>
                            )}

                            {study.screening.TA.myVote && (
                                <button onClick={() => revertVote(study.id, "TA")}>UNDO VOTE</button>
                            )}
                            </>
                        )}      

                        {/* FULL TEXT */}
                        {stage === "FULLTEXT" && study.screening.FULLTEXT.final && (
                            <div>
                                <h4>Final Decision</h4>
                                <p className={"final-decision-badge " + (study.screening.FULLTEXT.final.vote === "ACCEPT" ? "accept" : "reject")}>
                                    {study.screening.FULLTEXT.final.vote === "ACCEPT"
                                        ? "ACCEPTED"
                                        : `REJECTED (${study.screening.FULLTEXT.final.reason})`}
                                </p>
                            </div>
                        )}

                        {stage === "FULLTEXT" && !study.screening.FULLTEXT.final && (
                            <>
                            {/* VOTE BREAKDOWN */}
                            {(() => {
                                const allVotes = [
                                    ...study.screening.FULLTEXT.votes,
                                    ...(study.screening.FULLTEXT.myVote ? [study.screening.FULLTEXT.myVote] : [])
                                ];

                                if (allVotes.length > 1) {
                                    return (
                                        <div>
                                            <h4>Votes</h4>
                                            <ul>
                                                {allVotes.map((v, index) => (
                                                    <li key={index}>
                                                        Reviewer {v.user_id}: {v.vote} {v.reason}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )
                                }
                            })()}

                            {(status === "UNSCREENED" || status === "PENDING") && (
                                <>
                                    <button disabled={!canVote} onClick={() => submitVote(study.id, "FULLTEXT", "ACCEPT")}>ACCEPT</button>
                                    
                                    <select 
                                        disabled={!canVote}
                                        value={study.screening.FULLTEXT.myVote?.vote || ""}
                                        onChange={(e) => handleFullTextExclusion(study.id, e.target.value)}
                                    >
                                        <option value="">Reject (select reason)</option>
                                        {(Array.isArray(fullTextExclusionReasons)) && fullTextExclusionReasons.map((reason, index) => (
                                            <option key={index} value={reason}>
                                                {reason}
                                            </option>
                                        ))}
                                    </select>
                                </>
                            )}

                            {(status === "CONFLICT") && (() => {
                                const allVotes = [
                                    ...study.screening.FULLTEXT.votes,
                                    ...(study.screening.FULLTEXT.myVote ? [study.screening.FULLTEXT.myVote] : [])
                                ];

                                const accepts = allVotes.filter(v => v.vote === "ACCEPT");
                                const rejects = allVotes.filter(v => v.vote !== "ACCEPT");
                                
                                const rejectReasons = rejects.map(v => v.reason ?? v.vote);
                                const uniqueRejectReasons = [...new Set(rejectReasons)];

                                return (
                                    <>
                                    <p><strong>Conflict detected:</strong></p>

                                    {accepts.length === 1 && rejects.length === 1 && (
                                        <>
                                            <button onClick={() => resolveFT(study.id, "ACCEPT")}>
                                                Confirm ACCEPT
                                            </button>
                                            <button onClick={() => resolveFT(study.id, rejectReasons[0])}>
                                                Confirm REJECT ({rejectReasons[0]})
                                            </button>
                                        </>
                                    )}

                                    {accepts.length === 0 && uniqueRejectReasons.length === 2 && (
                                        <>
                                        <select
                                            onChange={(e) => resolveFT(study.id, e.target.value)}
                                            defaultValue=""
                                        >
                                            <option value=" disabled">Select correct reason...</option>
                                            {uniqueRejectReasons.map((reason, index) => (
                                                <option key={index} value={reason}>
                                                    {reason}
                                                </option>
                                            ))}
                                        </select>
                                        </>
                                    )}
                                    </>
                                )
                            })()}

                            {study.screening.FULLTEXT.myVote && (
                                <button onClick={() => revertVote(study.id, "FULLTEXT")}>UNDO</button>
                            )}
                            </>
                        )}

                        {stage === "FULLTEXT" && study.screening.FULLTEXT.final && (
                            <>
                            {/* VOTE BREAKDOWN */}
                            {(() => {
                                const allVotes = [
                                    ...study.screening.FULLTEXT.votes,
                                    ...(study.screening.FULLTEXT.myVote ? [study.screening.FULLTEXT.myVote] : [])
                                ];

                                if (allVotes.length > 0) {
                                    return (
                                        <div>
                                            <h4>Final Votes</h4>
                                            <ul>
                                                {allVotes.map((v, index) => (
                                                    <li key={index}>
                                                        Reviewer {v.user_id}: {v.vote} {v.reason}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )
                                }
                            })()}

                            {study.screening.FULLTEXT.myVote && (
                                <button onClick={() => revertVote(study.id, "FULLTEXT")}>UNDO</button>
                            )}
                            </>
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

                    <div className="actions">
                    {Array.isArray(study.notes) && study.notes.length > 0 && (
                        <div>
                            <h4>Notes</h4>
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

                </div>
            )})}
        </div>
    )
}