const express = require("express");
const router = express.Router();
const { db, upsertScreening, getScreeningsForStudies } = require("../db.js");

const screeningRepo = require("../repos/screeningRepo");
const auditRepo = require("../repos/auditRepo");

/* middleware */
function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    next();
}

/* get them all */
router.get("/screenings/summary", requireAuth, (req, res) => {
    try {
        const rows = getScreeningsForStudies.all();
        const summary = {};

        for (const row of rows) {
            const { study_id, stage, vote, user_id } = row;

            // Study + Stage structure
            if (!summary[study_id]) {
                summary[study_id] = {
                    TA: { votes: [], myVote: null, status: "UNSCREENED" },
                    FULLTEXT: { votes: [], myVote: null, status: "UNSCREENED" }
                };
            }

            // Push vote at the stage
            summary[study_id][stage].votes.push({ vote, user_id });

            // Track vote
            if (user_id === req.user.userid) {
                summary[study_id][stage].myVote = vote;
            }
        }

        for (const studyId of Object.keys(summary)) {
            for (const stage of ["TA", "FULLTEXT"]) {
                const stageData = summary[studyId][stage];
                const votes = stageData.votes;

                const accepts = votes.filter(v => v.vote === "ACCEPT").length;
                const rejects = votes.filter(v => v.vote === "REJECT").length;
                
                let status = "UNSCREENED";
                if (votes.length === 1) status = "PENDING";
                if (accepts >= 2) status = "ACCEPTED";
                if (rejects >= 2) status = "REJECTED";
                if (accepts === 1 && rejects === 1) status = "CONFLICT";

                stageData.status = status;
            }
        }

        res.json(summary);

    } catch (err) {
        console.error("Error in /screenings/summary:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

/* voting */
router.post("/screenings", requireAuth, (req, res) => {      
    try {
        const { study_id, stage, vote, reason } = req.body;
        const userId = req.user.userid;

        // general checks
        if (!study_id || !stage) {
            return res.status(400).json({ error: "Missing study_id or stage" });
        }
        if (!["TA", "FULLTEXT"].includes(stage)) {
            return res.status(400).json({ error: "Invalid stage" });
        }
        if (!["ACCEPT", "REJECT"].includes(vote)) {
            return res.status(400).json({ error: "Invalid vote" });
        }

        // the vote
        const processVote = db.transaction(() => {
            // Checking existing votes
            const existingVotes = screeningRepo.getVotesForStudyStage.all(study_id, stage);
            const oldVote = existingVotes.find(v => v.user_id === userId)?.vote ?? null;
            const hasUserVoted = oldVote !== null;

            const accepts = existingVotes.filter(v => v.vote === "ACCEPT").length;
            const rejects = existingVotes.filter(v => v.vote === "REJECT").length;
            
            // Finalisation rules
            if (accepts >= 2 || rejects >= 2) throw new Error("FINALISED");
            if (existingVotes.length >= 2 && !hasUserVoted) throw new Error("CLOSED");

            // The vote...
            screeningRepo.saveVote({
                user_id: userId,
                study_id,
                stage,
                vote,
                reason: reason ?? null
            });

            auditRepo.logVoteChange({
                user_id: userId,
                study_id,
                stage,
                old_vote: oldVote,
                new_vote: vote,
                reason: reason ?? null
            })
        });

        try {
            processVote();
        } catch (err) {
            if (err.message === "FINALISED") {
                return res.status(409).json({ error: "Decision finalised" });
            }
            if (err.message === "CLOSED") {
                return res.status(409).json({ error: "Voting closed" });
            }
            throw err; // unexpected
        }

        res.json({ success: true, message: "Screening saved" });

    } catch (err) {
        console.error("SCREENING POST ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;