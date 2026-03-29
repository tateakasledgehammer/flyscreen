const express = require("express");
const router = express.Router();
const { db } = require("../db.js");
const requireProjectAccess = require("../middleware/projectAuth.js");

const studyScoreRepo = require("../repos/studyScoreRepo.js");
const criteriaRepo = require("../repos/criteriaRepo.js")

const scoringEngine = require("../utils/scoringEngine.js");
const aiScoringEngine = require("../utils/aiScoringEngine.js");
const usingAIScoring = true;

function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i+= size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

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

router.get(
    "/projects/:projectId/setup", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
        const projectId = Number(req.params.projectId);

        const projectRow = db.prepare(`
            SELECT * FROM projects WHERE id = ?
        `).get(projectId) || {};

        const tags = db.prepare(`
            SELECT * FROM tags WHERE project_id = ?    
        `).all(projectId);

        const collaborators = db.prepare(`
            SELECT u.id, u.username, pu.role
            FROM project_users pu
            JOIN users u ON u.id = pu.user_id
            WHERE pu.project_id = ?    
        `).all(projectId);
    
        const sections = criteriaRepo.getSections.all(projectId);
        const fulltext = criteriaRepo.getFullText.all(projectId).map(r => r.reason);
    
        const inclusion = [];
        const exclusion = [];
    
        for (const sec of sections) {
            const items = criteriaRepo.getItemsForSection.all(sec.id).map(i => i.text);
            const obj = { category: sec.name, criteria: items };
            if (sec.type === "inclusion") inclusion.push(obj);
            else exclusion.push(obj);
        }

        const background = db.prepare(`
            SELECT * FROM project_background WHERE project_id = ?                
        `).get(projectId) || {};

        const reviewerSettings = db.prepare(`
            SELECT * FROM reviewer_settings WHERE project_id = ?                
        `).get(projectId) || {
            screening: 2,
            fulltext: 2,
            extraction: 2
        };

        res.json({
            id: projectRow.id,
            name: projectRow.name,
            description: projectRow.description,

            title: background.title,
            context: background.context,
            study_type: background.study_type,
            question_type: background.question_type,
            research_area: background.research_area,

            reviewerSettings,
            collaborators,
            tags,
            inclusionCriteria: inclusion,
            exclusionCriteria: exclusion,
            fullTextExclusionReasons: fulltext
        });
    }
)

router.post(
    "/projects/:projectId/setup", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
        const projectId = Number(req.params.projectId);
        const {
            tags,
            inclusionCriteria,
            exclusionCriteria,
            fullTextExclusionReasons,
            background,
            reviewerSettings
        } = req.body;

        try {
            const tx = db.transaction(() => {
                // tags
                if (Array.isArray(tags)) {
                    db.prepare(`DELETE FROM tags WHERE project_id = ?`).run(projectId);
                    const insertTag = db.prepare(`
                        INSERT INTO tags (name, project_id)
                        VALUES (?, ?)
                    `);

                    tags.forEach(t => {
                        if (t?.name?.trim()) {
                            insertTag.run(t.name.trim(), projectId);
                        }
                    })
                }

                // criteria
                criteriaRepo.clearItems.run(projectId);
                criteriaRepo.clearSections.run(projectId);
                criteriaRepo.clearFullText.run(projectId);

                const insertSection = criteriaRepo.insertSection;
                const insertItem = criteriaRepo.insertItem;

                if (Array.isArray(inclusionCriteria)) {
                    inclusionCriteria.forEach(sec => {
                        const result = insertSection.run(projectId, "inclusion", sec.category);
                        sec.criteria.forEach(c => insertItem.run(result.lastInsertRowid, c));
                    })
                }
                if (Array.isArray(exclusionCriteria)) {
                    exclusionCriteria.forEach(sec => {
                        const result = insertSection.run(projectId, "exclusion", sec.category);
                        sec.criteria.forEach(c => insertItem.run(result.lastInsertRowid, c));
                    })
                }
                if (Array.isArray(fullTextExclusionReasons)) {
                    fullTextExclusionReasons.forEach(reason => {
                        criteriaRepo.insertFullText.run(projectId, reason);
                    })
                }

                // background
                if (background) {
                    db.prepare(`
                        INSERT INTO project_background (project_id, title, context, study_type, question_type, research_area)    
                        VALUES (?, ?, ?, ?, ?, ?)
                        ON CONFLICT(project_id) DO UPDATE SET
                            title = excluded.title,
                            context = excluded.context,
                            study_type = excluded.study_type,
                            question_type = excluded.question_type,
                            research_area = excluded.research_area
                    `).run(
                        projectId,
                        background.title || "",
                        background.context || "",
                        background.study_type || "",
                        background.question_type || "",
                        background.research_area || ""
                    )
                }

                // reviewer settings
                if (reviewerSettings) {
                    db.prepare(`
                        INSERT INTO reviewer_settings (project_id, screening, fulltext, extraction)    
                        VALUES (?, ?, ?, ?)
                        ON CONFLICT(project_id) DO UPDATE SET
                            screening = excluded.screening,
                            fulltext = excluded.fulltext,
                            extraction = excluded.extraction
                    `).run(
                        projectId,
                        reviewerSettings.screening ?? 2,
                        reviewerSettings.fulltext ?? 2,
                        reviewerSettings.extraction ?? 2
                    );
                }
            });

            tx();

            res.json({ success: true });

        } catch (err) {
            console.error("Unified setup save failed:", err);
            res.status(500).json({ error: "Failed to save setup" });
        }
    }
)

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

function normaliseScreening(votes) {
    const result = {
        TA: { ACCEPT: [], REJECT: [] },
        FULLTEXT: { ACCEPT: [], REJECT: [] }
    };

    votes.forEach(v => {
        if (!v.stage || !v.vote) return;
        if (!result[v.stage]) return;

        result[v.stage][v.vote] = [
            ...(result[v.stage][v.vote] || []),
            v.user_id
        ];
    });

    return result;
}

router.get(
    "/projects/:projectId/studies-with-scores", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
        const projectId = Number(req.params.projectId);
        let rows = db.prepare(`
            SELECT 
                s.*, 
                sc.score, 
                sc.explanation,
                json_group_array(
                    json_object(
                        'user_id', scr.user_id,
                        'stage', scr.stage,
                        'vote', scr.vote
                    )
                ) AS screening
            FROM studies s
            LEFT JOIN study_scores sc ON sc.study_id = s.id
            LEFT JOIN screenings scr ON scr.study_id = s.id
            WHERE s.project_id = ?
            GROUP BY s.id
            ORDER BY sc.score DESC
        `).all(projectId);

        rows = rows.map(r => {
            const raw = JSON.parse(r.screening || "[]");
            return {
                ...r,
                screening: normaliseScreening(raw)
            };
        });

        res.json(rows)
    }
)

router.post(
    "/projects/:projectId/rescore",
    requireAuth,
    requireProjectAccess,
    async (req, res) => {
        const projectId = Number(req.params.projectId);

        const studies = db.prepare(`
            SELECT * FROM studies WHERE project_id = ?    
        `).all(projectId);

        const sections = criteriaRepo.getSections.all(projectId);
        const fulltext = criteriaRepo.getFullText.all(projectId).map(r=>r.reason);

        const inclusion = [];
        const exclusion = [];

        for (const sec of sections) {
            const items = criteriaRepo.getItemsForSection.all(sec.id).map(i => i.text);
            const obj = { category: sec.name, criteria: items };

            if (sec.type === "inclusion") inclusion.push(obj);
            else exclusion.push(obj);
        }

        const criteria = {
            inclusionCriteria: inclusion,
            exclusionCriteria: exclusion,
            fullTextExclusionReasons: fulltext
        };

        const project_background = db.prepare(`
            SELECT title, study_type, context FROM project_background WHERE project_id = ?
        `).get(projectId);

        const getStudyByIdStmt = db.prepare(`
            SELECT * FROM studies WHERE id = ?
        `);

        const studyIds = studies.map(s => s.id);
        const batches = chunk(studyIds, 10);

        for (const batch of batches) {
            const batchStudies = batch.map(id => getStudyByIdStmt.get(id))

            let results = null;

            if (usingAIScoring) {
                try {
                    results = await aiScoringEngine.scoreStudiesAI(
                        batchStudies, 
                        criteria, 
                        project_background);
                } catch (err) {
                    console.error("AI scoring failed:", err);
                }
            } 
            
            if (!results) {
                results = batchStudies.map(s => {
                    const r = scoringEngine.scoreStudy(s, criteria);
                    return {
                        id: s.id,
                        score: r.score,
                        explanation: r.explanation
                    }
                });
            }

            for (const result of results) {
                studyScoreRepo.upsertScore.run(
                    result.id,
                    projectId,
                    result.score, 
                    result.explanation
                );
            }
        }

        res.json({ success: true });
    }
);

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