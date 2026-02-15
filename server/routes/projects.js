const express = require("express");
const router = express.Router();
const { db } = require("../db.js");

/* middleware */
function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    next();
}

const createProject = db.prepare(`
    INSERT INTO projects (name, description, created_by)
    VALUES (?, ?, ?)    
`);

const addUserToProject = db.prepare(`
    INSERT OR IGNORE INTO project_users (project_id, user_id, role)
    VALUES (?, ?, ?)    
`);

const getProjectsForUser = db.prepare(`
    SELECT p.*
    FROM projects p
    JOIN project_users pu ON pu.project_id = p.id
    WHERE pu.user_id = ?
    ORDER BY p.created_at DESC
`);

router.post("/projects", requireAuth, (req, res) => {
    const { name, description } = req.body;

    const result = createProject.run(name, description, req.user.userid);
    addUserToProject.run(result.lastInsertRowid, req.user.userid, "OWNER");

    res.json({ success: true, projectId: result.lastInsertRowid });
});

router.get("/projects", requireAuth, (req, res) => {
    const projects = getProjectsForUser.all(req.user.userid);
    res.json(projects);
});

module.exports = router;