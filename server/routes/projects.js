const express = require("express");
const router = express.Router();
const { db } = require("../db.js");
const requireProjectAccess = require("../middleware/projectAuth.js");
const scoringEngine = require("../utils/scoringEngine.js");
const studyScoreRepo = require("../repos/studyScoreRepo.js");

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

router.post(
    "/projects", 
    requireAuth, 
    (req, res) => {
        const { name, description } = req.body;

        const result = createProject.run(name, description, req.user.userid);
        addUserToProject.run(result.lastInsertRowid, req.user.userid, "OWNER");

        res.json({ success: true, projectId: result.lastInsertRowid });
});

router.get(
    "/projects", 
    requireAuth, 
    (req, res) => {
        try {
            const userid = req.user.userid;
            const projects = getProjectsForUser.all(req.user.userid);

            const getCollaborators = db.prepare(`
                SELECT u.id, u.username, pu.role
                FROM project_users pu
                JOIN users u ON u.id = pu.user_id
                WHERE pu.project_id = ?    
            `);

            const enrichedProjects = projects.map(p => ({
                ...p,
                collaborators: getCollaborators.all(p.id)
            }));

            res.json(enrichedProjects);

        } catch (err) {
            console.error("Error loading projects for user", req.user, err);
            res.status(500).json({ error: "Failed to load projects" })
        }
});

const getProjectById = db.prepare(`
   SELECT * FROM projects WHERE id = ? 
`);

router.get(
    "/projects/:projectId",
    requireAuth,
    requireProjectAccess,
    (req, res) => {
        const projectId = Number(req.params.projectId);
        const project = getProjectById.get(projectId);
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        res.json(project);
    }
)

router.post(
    "/projects/:projectId/criteria", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
        const projectId = Number(req.params.projectId);
        const { population, intervention, comparator, outcomes, study_design, exclusions } = req.body;

        criteriaRepo.upsertCriteria.run(
            projectId,
            population ?? null,
            intervention ?? null,
            comparator ?? null,
            outcomes ?? null,
            study_design ?? null,
            exclusions ?? null,
        );

        // recompute scores
        const studies = db.prepare(`
            SELECT * FROM studies WHERE project_id = ?
        `).all(projectId);

        for (const study of studies) {
            const { score, explanation } = scoringEngine.scoreStudy(study, {
                population,
                intervention,
                comparator,
                outcomes,
                study_design,
                exclusions
            });

            studyScoreRepo.upsertScore.run(study.id, projectId, score, explanation);
        }

        res.json({ success: true });
});

router.get(
    "/projects/:projectId/criteria", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
        const projectId = Number(req.params.projectId);
        const criteria = criteriaRepo.getCriteria.get(projectId);
        res.json(criteria || {});
    });

router.get(
    "/projects/:projectId/studies-with-scores", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
        const projectId = Number(req.params.projectId);
        const rows = db.prepare(`
            SELECT s.*, sc.score, sc.explanation
            FROM studies s
            LEFT JOIN study_scores sc ON sc.study_id = s.id
            WHERE s.project_id = ?
            ORDER BY sc.score DESC
        `).all(projectId);

        res.json(rows)
    }
)

// edits to the project details
router.patch(
    "/projects/:projectId",
    requireAuth,
    requireProjectAccess,
    (req, res) => {
        const { projectId } = req.params;
        const { name } = req.body;

        try {
            db.prepare("UPDATE projects SET name = ? WHERE id = ?")
                .run(name, projectId);

            res.json({ success: true });
        } catch (err) {
            console.error("Rename failed:", err);
            res.status(500).json({ error: "Failed to rename project" });
        }
    });

router.patch(
    "/projects/:projectId/archive",
    requireAuth,
    requireProjectAccess,
    (req, res) => {
        const { projectId } = req.params;

        try {
            db.prepare("UPDATE projects SET status = 'archived' WHERE id = ?")
                .run(projectId);

            res.json({ success: true });
        } catch (err) {
            console.error("Archive failed:", err);
            res.status(500).json({ error: "Failed to archive project" });
        }
    });

router.post(
    "/projects/:projectId/collaborators",
    requireAuth,
    requireProjectAccess,
    (req, res) => {
        const { projectId } = req.params;
        const { userId, role } = req.body;

        try {
            db.prepare(`
                INSERT OR IGNORE INTO project_users (project_id, user_id, role)
                VALUES (?, ?, ?)
            `).run(projectId, userId, role || "REVIEWER");

            res.json({ success: true });
        } catch (err) {
            console.error("Add reviewer failed:", err);
            res.status(500).json({ error: "Failed to archive project" });
        }
    });

router.delete(
    "/projects/:projectId/collaborators/:userId",
    requireAuth,
    requireProjectAccess,
    (req, res) => {
        const { projectId, userId } = req.params;

        try {
            db.prepare(`
                DELETE FROM project_users
                WHERE project_id = ? AND user_id = ?
            `).run(projectId, userId);

            res.json({ success: true });
        } catch (err) {
            console.error("Remove collaborator failed:", err);
            res.status(500).json({ error: "Failed to remove collaborator" });
        }
    }
)

router.delete(
    "/projects/:projectId",
    requireAuth,
    requireProjectAccess,
    (req, res) => {
        const { projectId } = req.params;

        try {
            db.prepare("DELETE FROM projects WHERE id = ?").run(projectId);
            res.json({ success: true });
        } catch (err) {
            console.error("Delete failed:", err);
            res.status(500).json({ error: "Failed to delete project" });
        }
    });

module.exports = router;