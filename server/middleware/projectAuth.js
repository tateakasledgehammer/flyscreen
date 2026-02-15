const { db } = require("../db");

const userInProject = db.prepare(`
    SELECT role FROM project_users
    WHERE project_id = ? AND user_id = ?
`);

module.exports = function requireProjectAccess(req, res, next) {
    const projectId = Number(req.params.projectId || req.body.projectId);

    if (!projectId) return res.status(400).json({ error: "projectId required" });

    const row = userInProject.get(projectId, req.user.userid);
    if (!row) return res.status(403).json({ error: "No access to this project" });

    req.projectRole = row.role;
    next();
};