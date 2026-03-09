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

router.get("/projects/:projectId/reviewers", 
    requireAuth, 
    requireProjectAccess, 
    (req, res) => {
    const projectId = Number(req.params.projectId);
    const row = db.prepare(`SELECT * FROM reviewer_settings WHERE project_id = ?`).get(projectId);
    res.json(row || {});
});

router.post("/projects/:projectId/reviewers", 
    requireAuth, 
    requireProjectAccess, 
    (req, res) => {
    const projectId = Number(req.params.projectId);
    const { screening, fulltext, extraction } = req.body;

    db.prepare(`
        INSERT INTO reviewer_settings (project_id, screening, fulltext, extraction)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(project_id) DO UPDATE SET
            screening = excluded.screening,
            fulltext = excluded.fulltext,
            extraction = excluded.extraction
    `).run(projectId, screening, fulltext, extraction);

    res.json({ success: true });
});

module.exports = router;