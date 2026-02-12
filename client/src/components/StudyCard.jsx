import { useEffect, useState } from "react";
import { getTAStatus, getFullTextStatus, canUserVoteTA, canUserVoteFT, formatAuthors } from "../utils/screeningTools";
import StudyInfo from "./StudyInfo";

export default function StudyCard(props) {
    const { 
        studies,
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
        fullTextExclusionReasons,
        setFullTextExclusionReasons,
        setExclusionCriteria,
        searchFilter,
        setSearchFilter,
        highlighted,
        setHighlighted,
        hideDetails,
        setHideDetails,
        refreshScreenings
    } = props;

    //console.log("Inclusion:", inclusionCriteria, "Exclusion: ", exclusionCriteria)
    //console.log(studies)

    async function submitVote(studyId, stage, vote) { 
        try {
            const res = await fetch("http://localhost:5005/api/screenings", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    study_id: studyId,
                    stage,
                    vote
                })
            });

            if (!res.ok) {
                const msg = await res.text();
                console.error("Vote failed", msg);
                return;
            }
              
            refreshScreenings();
        } catch (error) {
            console.error("Error submitting vote:", error)
        }
    }

    function handleToggleDetails(studyID) {
        setToggleDetails(prev => ({
            ...prev,
            [studyID]: !prev[studyID]
        }));
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
                const isExpanded = 
                    toggleDetails.hasOwnProperty(study.id)
                        ? toggleDetails[study.id] 
                        : hideDetails;
   
                console.log(
                    "FINAL TA",
                    study.id,
                    study.screening?.TA,
                    "canVote:",
                    canUserVoteTA(study.screening, user?.userid)
                );
                      
                const taStatus = getTAStatus(study.screening, user?.userid);
                const ftStatus = getFullTextStatus(study.screening, user?.userid);
                const canVoteTA = canUserVoteTA(study.screening, user?.userid);
                const canVoteFT = canUserVoteFT(study.screening, user?.userid);
                const myTAVote = study.screening?.TA?.myVote;
                const myFTVote = study.screening?.FULLTEXT?.myVote;

                //console.log("SCREENING STATE", study.id, study.screening);

                return (
                <div key={study.id ?? study._clientId} study={study} className="study-card">
                    {/* Study information */}

                    <StudyInfo
                        study={study}
                        studies={studies}
                        highlighted={highlighted}
                        highlightContent={highlightContent}
                        inclusionCriteria={inclusionCriteria}
                        exclusionCriteria={exclusionCriteria}
                        searchWords={searchWords}
                        isExpanded={isExpanded}
                        handleToggleDetails={handleToggleDetails}
                    />
                    
                    {/* Actions section */}
                    <div className="actions">
                        {/* TITLE ABSTRACT SCREENING BUTTONS */}
                        {(taStatus === "UNSCREENED" || taStatus === "PENDING" || taStatus === "CONFLICT") && (
                            <>
                                <button disabled={!canVoteTA} onClick={() => submitVote(study.id, "TA", "ACCEPT")}>ACCEPT</button>
                                <button disabled={!canVoteTA} onClick={() => submitVote(study.id, "TA", "REJECT")}>REJECT</button>
                                {!canVoteTA && (
                                    <p>
                                        {taStatus === "ACCEPTED" || taStatus === "REJECTED"
                                            ? "Decision finalised"
                                            : "Waiting for another reviewer"
                                        }
                                    </p>
                                )}
                            </>
                        )}

                        {/* FULL TEXT SCREENING BUTTONS */}
                        {((ftStatus === "UNSCREENED" || ftStatus === "PENDING" || ftStatus === "CONFLICT") && taStatus === "ACCEPTED") && (
                            <>
                                <button disabled={!canVoteFT} onClick={() => submitVote(study.id, "FULLTEXT", "ACCEPT")}>ACCEPT</button>
                                <button disabled={!canVoteFT} onClick={() => submitVote(study.id, "FULLTEXT", "REJECT")}>REJECT</button>
                                {!canVoteFT && (
                                    <p>
                                        {ftStatus === "ACCEPTED" || ftStatus === "REJECTED"
                                            ? "Decision finalised"
                                            : "Waiting for another reviewer"
                                        }
                                    </p>
                                )}
                            </>
                        )}

                        {/* <span className={`vote-badge ${
                            myTAVote === "ACCEPT" ? "accept" : "reject"
                        }`}
                        >
                            You: {myTAVote};
                        </span> */}

                        {/* FULL TEXT EXCLUSION DROPDOWN */}
                        {((study.fullTextStatus !== "Full Text Accepted" && study.status === "Accepted") && (
                            <select value={study.fullTextExclusionStatus || ""} onChange={(e) => (handleFullTextExclusion(study.id, e.target.value))}>
                                <option value="">Reason to exclude</option>
                                {Array.isArray(fullTextExclusionReasons) && (fullTextExclusionReasons.map((reason, reasonIndex) => (
                                    <option key={reasonIndex} value={reason}>
                                        {reason}
                                    </option>
                                )))}
                            </select>
                        ))}

                        {/* <span className={`vote-badge ${
                            myFTVote === "ACCEPT" ? "accept" : "reject"
                        }`}
                        >
                            You: {myFTVote};
                        </span> */}
                                              
                        {/* NOTE / TAG for all */}
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

                    {study.fullTextExclusionStatus && (
                        <>
                            <p><strong>Full Text Exclusion Reason: </strong>{study.fullTextExclusionStatus}</p>
                        </>
                    )}

                </div>
            )})}
        </div>
    )
}