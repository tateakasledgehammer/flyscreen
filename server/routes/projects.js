const express = require("express");
const router = express.Router();
const { db } = require("../db.js");
const criteriaRepo = require("../repos/projectCriteriaRepo.js")
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
    requireProjectAccess,
    (req, res) => {
        const { name, description } = req.body;

        const result = createProject.run(name, description, req.user.userid);
        addUserToProject.run(result.lastInsertRowid, req.user.userid, "OWNER");

        res.json({ success: true, projectId: result.lastInsertRowid });
});

router.get(
    "/projects", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
        const projects = getProjectsForUser.all(req.user.userid);
        res.json(projects);
});

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

module.exports = router;