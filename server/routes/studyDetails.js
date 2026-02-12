const express = require("express");
const router = express.Router();

const { db, getStudyById } = require("../db")
const tagRepo = require("../repos/tagRepo");
const noteRepo = require("../repos/noteRepo");
const screeningRepo = require("../repos/tagRepo");

/* middleware */
function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    next();
}

const getDuplicatesForStudy = db.prepare(`
    SELECT id, duplicate_payload, detected_at
    FROM duplicates
    WHERE original_study_id = ?
    ORDER BY detected_at DESC
`);

router.get("/studies/:id/detail"), requireAuth, (req, res) => {
    try {
        const studyId = Number(req.params.id);

        // Metadata
        const study = getStudyById.get(studyId);
        if (!study) return res.status(404).json({ error: "Study not found "});
    
        // Notes
        const notes = noteRepo.getNotesForStudy.all(studyId);
        
        // Tags
        const tags = tagRepo.getTagsForStudy.all(studyId);

        // Screening Info
        const allScreenings = screeningRepo.getAllScreenings.all();
        const summary = {
            TA: { votes: [], myVote: null, status: "UNSCREENED" },
            FULLTEXT: { votes: [], myVote: null, status: "UNSCREENED" }
        }

        for (const row of allScreenings) {
            if (row.study_id !== studyId) continue;

            summary[row.stage].votes.push({
                vote: row.vote,
                user_id: row.user_id
            });

            if (row.user_id === req.user.userid) {
                summary[row.stage].myVote = row.vote;
            }
        }

        for (const stage of ["TA", "FULLTEXT"]) {
            const votes = summary[stage].votes;
            const accepts = votes.filter(v => v.vote === "ACCEPT").length;
            const rejects = votes.filter(v => v.vote === "REJECT").length;
            
            let status = "UNSCREENED";
            if (votes.length === 1) status = "PENDING";
            if (accepts >= 2) status = "ACCEPTED";
            if (rejects >= 2) status = "REJECTED";
            if (accepts === 1 && rejects === 1) status = "CONFLICT";

            summary[stage].status = status;
        }

        // Duplicates
        const duplicates = getDuplicatesForStudy.all(studyId);

        res.json({
            study,
            notes,
            tags,
            screenings: summary,
            duplicates: {
                count: duplicates.length,
                entries: duplicates
            }
        });

    } catch (err) {
        console.error("Error in study detail endpoint", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = router;