const express = require("express");
const { upsertScreening } = require("../db.js");

const router = express.Router();

router.post("/screenings", (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
      
    const { study_id, stage, vote, reason } = req.body;

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

    if (!study_id || !stage) {
        return res.status(400).json({ error: "Missing study_id or stage" });
    }

    if (!["ACCEPT", "REJECT"].includes(vote)) {
        return res.status(400).json({ error: "Invalid vote" });
    }

    if (!["TA", "FULLTEXT"].includes(stage)) {
        return res.status(400).json({ error: "Invalid stage" });
    }

    upsertScreening.run({
        user_id: req.user.userid,
        study_id,
        stage,
        vote,
        reason: reason ?? null
    });

    res.json({ success: true });
});

module.exports = router;