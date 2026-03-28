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

router.get("/projects/:projectId/background", 
    requireAuth, 
    requireProjectAccess, 
    (req, res) => {
    const projectId = Number(req.params.projectId);
    const row = db.prepare(`SELECT * FROM project_background WHERE project_id = ?`).get(projectId);
    res.json(row || {});
});

router.post("/projects/:projectId/background", 
    requireAuth, 
    requireProjectAccess, 
    (req, res) => {
    const projectId = Number(req.params.projectId);
    const { title, context, study_type, question_type, research_area } = req.body;

    db.prepare(`
        INSERT INTO project_background (project_id, title, context, study_type, question_type, research_area)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(project_id) DO UPDATE SET
            title = excluded.title,
            context = excluded.context,
            study_type = excluded.study_type,
            question_type = excluded.question_type,
            research_area = excluded.research_area
    `).run(projectId, title, context, study_type, question_type, research_area);

    res.json({ success: true });
});

module.exports = router;