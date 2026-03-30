const express = require("express");
const router = express.Router();

const requireProjectAccess = require("../middleware/projectAuth.js");
const filterRepo = require("../repos/filterRepo.js");

/* middleware */
function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    next();
}


router.get(
    "/projects/:projectId/filters", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
        const projectId = Number(req.params.projectId);
        const filters = filterRepo.getAllFilters.all(projectId);
        res.json(filters);
});

router.post(
    "/projects/:projectId/filters", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
        const projectId = Number(req.params.projectId);
        const { name } = req.body;

        if (!name.trim()) {
            return res.status(400).json({ error: "Filter name required" });
        }

        const trimmed = name.trim();

        const info = filterRepo.createFilter.run(trimmed, projectId);

        let filter;
        if (info.changes === 1) {
            filter = {
                id: info.lastInsertRowid,
                name: trimmed,
                project_id: projectId
            }
        } else {
            filter = filterRepo.getFilterByName.get(trimmed, projectId);
        }

        res.json(filter);
});

router.delete(
    "/projects/:projectId/filters/:filterId", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
        const projectId = Number(req.params.projectId);
        const filterId = Number(req.params.filterId);

        console.log("DELETE request:", { projectId, filterId });

        filterRepo.deleteFilter.run(filterId, projectId);
        res.json({ success: true });    
});

module.exports = router;