import express from "express";
import db from "../db.js"

const router = express.Router();

const upsertScreening = db.prepare(`
    INSERT INTO screenings (user_id, study_id, stage, vote, reason, updated_at)
    VALUES (@user_id, @study_id, @stage, @vote, @reason, CURRENT_TIMESTAMP)
    
    ON CONFLICT(user_id, study_id, stage)
    DO UPDATE SET
     vote = excluded.vote,
     reason = excluded.reason,
     updated_at = CURRENT_TIMESTAMP
 `);

 router.post("/screenings", (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    const { study_id, stage, vote, reason } = req.body;

    if (!study_id || !stage) {
        return res.status(400).json({ error: "Missing study_id or stage" });
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

export default router