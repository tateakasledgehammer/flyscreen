const express = require("express");
const router = express.Router();
const { db, upsertScreening, getScreeningsForStudies } = require("../db.js");

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

            if (!summary[study_id]) {
                summary[study_id] = {
                    TA: { votes: [], myVote: null, status: "UNSCREENED" },
                    FULLTEXT: { votes: [], myVote: null, status: "UNSCREENED" }
                };
            }
            if (
                summary[study_id][stage] &&
                summary[study_id][stage][vote] &&
                Array.isArray(summary[study_id][stage][vote])
            ) {
                summary[study_id][stage][vote].push(user_id);
            }

            if (user_id === req.user.userid) {
                summary[study_id][stage].myVote = vote;
            }
        }

        for (const studyId of Object.keys(summary)) {
            for (const stage of ["TA", "FULLTEXT"]) {
                const votes = summary[studyId][stage].votes;

                const accepts = votes.filter(v => v.vote === "ACCEPT").length;
                const rejects = votes.filter(v => v.vote === "REJECT").length;
                
                let status = "UNSCREENED";
                if (votes.length === 1) status = "PENDING";
                if (accepts >= 2) status = "ACCEPTED";
                if (rejects >= 2) status = "REJECTED";
                if (accepts === 1 && rejects === 1) status = "CONFLICT";

                summary[studyId][stage].status = status;
            }
        }

        res.json(summary);
    } catch (err) {
        console.error("Error in /screenings/summary:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

/* voting */
router.post("/screenings", (req, res) => {      
    try {
        console.log("VOTE BODY:", req.body);
        console.log("USER:", req.user);

        const { study_id, stage, vote, reason } = req.body;

        /* general checking */
        if (!study_id || !stage) {
            return res.status(400).json({ error: "Missing study_id or stage" });
        }

        if (!["TA", "FULLTEXT"].includes(stage)) {
            return res.status(400).json({ error: "Invalid stage" });
        }

        if (!["ACCEPT", "REJECT"].includes(vote)) {
            return res.status(400).json({ error: "Invalid vote" });
        }
        
        /* checking votes */
        const existingVotes = db.prepare(`
            SELECT user_id, vote 
            FROM screenings
            WHERE study_id = ? AND stage = ?
        `).all(study_id, stage);

        const hasUserVoted = existingVotes.some(
            v => v.user_id === req.user.userid
        );
        
        const accepts = existingVotes.filter(v => v.vote === "ACCEPT").length;
        const rejects = existingVotes.filter(v => v.vote === "REJECT").length;
        
        if (accepts >= 2 || rejects >= 2) {
            return res.status(409).json({ error: "Decision finalised" });
        }
        if (existingVotes.length >= 2 && !hasUserVoted) {
            return res.status(409).json({ error: "Voting closed" });
        }

        upsertScreening.run({
            user_id: req.user.userid,
            study_id,
            stage,
            vote,
            reason: reason ?? null
        });

        res.json({ success: true, message: "Screening saved" });
    } catch (err) {
        console.error("SCREENING POST ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;