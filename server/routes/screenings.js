const express = require("express");
const { upsertScreening } = require("../db.js");

const router = express.Router();

router.post("/screenings", (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
      
    const { study_id, stage, vote, reason } = req.body;

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