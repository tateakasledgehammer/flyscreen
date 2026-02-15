const express = require("express");
const router = express.Router();
const { db } = require("../db");
const requireProjectAccess = require("../middleware/projectAuth.js");

/* middleware */
function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    next();
}

const getDuplicates = db.prepare(`
    SELECT
        d.id,
        d.original_study_id,
        s.title AS original_title,
        d.duplicate_payload,
        d.detected_at
    FROM duplicates d
    JOIN studies s ON s.id = d.original_study_id
    ORDER BY d.detected_at DESC    
`);

const getDuplicateSummary = db.prepare(`
    SELECT
        original_study_id,
        COUNT(*) AS duplicate_count
    FROM duplicates
    GROUP BY original_study_id
    ORDER BY duplicate_count DESC
`);

router.get(
    "/projects/:projectId/duplicates", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
    try {
        const rows = getDuplicates.all();
        res.json(rows);
    } catch (err) {
        console.error("Error fetching duplicates", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get(
    "/projects/:projectId/duplicates/summary", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
    try {
        const rows = getDuplicateSummary.all();
        res.json(rows);
    } catch (err) {
        console.error("Error fetching duplicate summary", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;