const express = require("express");
const router = express.Router();
const { db } = require("../db.js");

const requireProjectAccess = require("../middleware/projectAuth.js");

/* middleware */
function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    next();
}

router.get(
    "/projects/:projectId/uploads", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
    const projectId = Number(req.params.projectId);

    try {
        const uploads = db.prepare(`
            SELECT
                u.id AS upload_id,
                u.file_name,
                u.created_at,
                COUNT(s.id) AS study_count
            FROM uploads u
            LEFT JOIN studies s ON s.upload_id = u.id
            WHERE u.project_id = ?
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `).all(projectId);

        res.json(uploads);

    } catch (err) {
        console.error("Failed to fetch uploads:", err);
        res.status(500).json({ error: "Failed to fetch uploads" });
    }
});

router.delete(
    "/projects/:projectId/uploads/:uploadId", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
    const projectId = Number(req.params.projectId);
    const uploadId = Number(req.params.uploadId);

    try {
        db.prepare(`
            DELETE FROM studies
            WHERE project_id = ? AND upload_id = ?
        `).run(projectId, uploadId);
        
        db.prepare(`
            DELETE FROM uploads
            WHERE id = ? AND project_id = ?
        `).run(uploadId, projectId);

        res.json({ success: true });

    } catch (err) {
        console.error("Failed to delete uploads:", err);
        res.status(500).json({ error: "Failed to delete uploads" });
    }
});

module.exports = router;