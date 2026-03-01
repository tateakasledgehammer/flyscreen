const express = require("express");
const router = express.Router();

const requireProjectAccess = require("../middleware/projectAuth.js");

/* middleware */
function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    next();
}

router.get("/projects/:projectId/criteria", requireAuth, requireProjectAccess, (req, res) => {
    const projectId = Number(req.params.projectId);

    const sections = db.prepare(`
        SELECT * FROM criteria_sections WHERE project_id = ?
    `).all(projectId);

    const items = db.prepare(`
        SELECT * FROM criteria_items WHERE section_id IN (
            SELECT id FROM criteria_sections WHERE project_id = ?
        )
    `).all(projectId);

    const fulltext = db.prepare(`
        SELECT reason FROM fulltext_exclusion_reasons WHERE project_id = ?
    `).all(projectId);

    const inclusion = [];
    const exclusion = [];

    for (const sec of sections) {
        const secItems = items.filter(i => i.section_id === sec.id).map(i => i.text);
        const obj = { category: sec.name, criteria: secItems };

        if (sec.type === "inclusion") inclusion.push(obj);
        else exclusion.push(obj);
    }

    res.json({
        inclusionCriteria: inclusion,
        exclusionCriteria: exclusion,
        fullTextExclusionReasons: fulltext.map(f => f.reason)
    });
});

router.post("/projects/:projectId/criteria", requireAuth, requireProjectAccess, (req, res) => {
    const projectId = Number(req.params.projectId);
    const { inclusionCriteria, exclusionCriteria, fullTextExclusionReasons } = req.body;

    const deleteSections = db.prepare(`DELETE FROM criteria_sections WHERE project_id = ?`);
    const deleteFulltext = db.prepare(`DELETE FROM fulltext_exclusion_reasons WHERE project_id = ?`);
    const insertSection = db.prepare(`
        INSERT INTO criteria_sections (project_id, type, name)
        VALUES (?, ?, ?)
    `);
    const insertItem = db.prepare(`
        INSERT INTO criteria_items (section_id, text)
        VALUES (?, ?)
    `);
    const insertFulltext = db.prepare(`
        INSERT INTO fulltext_exclusion_reasons (project_id, reason)
        VALUES (?, ?)
    `);

    const tx = db.transaction(() => {
        deleteSections.run(projectId);
        deleteFulltext.run(projectId);

        for (const sec of inclusionCriteria) {
            const result = insertSection.run(projectId, "inclusion", sec.category);
            sec.criteria.forEach(c => insertItem.run(result.lastInsertRowid, c));
        }

        for (const sec of exclusionCriteria) {
            const result = insertSection.run(projectId, "exclusion", sec.category);
            sec.criteria.forEach(c => insertItem.run(result.lastInsertRowid, c));
        }

        fullTextExclusionReasons.forEach(reason => {
            insertFulltext.run(projectId, reason);
        });
    });

    tx();

    res.json({ success: true });
});

module.exports = router;