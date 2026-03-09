const express = require("express");
const router = express.Router();

const requireProjectAccess = require("../middleware/projectAuth.js");
const { db } = require("../db");
const criteriaRepo = require("../repos/criteriaRepo.js");

/* middleware */
function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    next();
}

router.get("/projects/:projectId/criteria", requireAuth, requireProjectAccess, (req, res) => {
    const projectId = Number(req.params.projectId);

    const sections = criteriaRepo.getSections.all(projectId);
    const fulltext = criteriaRepo.getFullText.all(projectId);

    const inclusion = [];
    const exclusion = [];

    for (const sec of sections) {
        const items = criteriaRepo.getItemsForSection.all(sec.id).map(i => i.text);
        const obj = { category: sec.name, criteria: items };

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

    const tx = db.transaction(() => {
        criteriaRepo.clearItems.run(projectId);
        criteriaRepo.clearSections.run(projectId);
        criteriaRepo.clearFullText.run(projectId);

        for (const sec of inclusionCriteria) {
            const result = criteriaRepo.insertSection.run(projectId, "inclusion", sec.category);
            sec.criteria.forEach(c => criteriaRepo.insertItem.run(result.lastInsertRowid, c));
        }

        for (const sec of exclusionCriteria) {
            const result = criteriaRepo.insertSection.run(projectId, "exclusion", sec.category);
            sec.criteria.forEach(c => criteriaRepo.insertItem.run(result.lastInsertRowid, c));
        }

        fullTextExclusionReasons.forEach(reason => {
            criteriaRepo.insertFullText.run(projectId, reason);
        });
    });

    tx();

    res.json({ success: true });
});

module.exports = router;