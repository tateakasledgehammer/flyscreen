const express = require("express");
const router = express.Router();

const tagRepo = require("../repos/tagRepo");
const requireProjectAccess = require("../middleware/projectAuth.js");

/* middleware */
function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    next();
}

router.post(
    "/projects/:projectId/tags", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
    const projectId = Number(req.params.projectId);
    const { name } = req.body;

    if (!name.trim()) {
        return res.status(400).json({ error: "Tag name required" });
    }

    tagRepo.createTag.run(name.trim());
    res.json({ success: true });
});

router.post(
    "/projects/:projectId/tags/attach", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
    const projectId = Number(req.params.projectId);
    const { study_id, tag } = req.body;

    if (!study_id || !tag?.trim()) {
        return res.status(400).json({ error: "study_id and tag required" });
    }

    tagRepo.createTag.run(tag.trim(), projectId);

    const tagRow = tagRepo.getTagByName.get(tag.trim(), projectId);
    tagRepo.attachTag.run(study_id, tagRow.id, projectId);

    res.json({ success: true });
});

router.get(
    "/projects/:projectId/tags/:studyId", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
    const projectId = Number(req.params.projectId);
    const studyId = Number(req.params.studyId);

    const tags = tagRepo.getTagsForStudy.all(studyId, projectId);
    res.json(tags);
});

router.get(
    "/projects/:projectId/tags", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
    const projectId = Number(req.params.projectId);
    const tags = tagRepo.getAllTags.all(projectId);
    res.json(tags);
});

module.exports = router;