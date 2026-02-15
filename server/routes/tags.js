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
    const { name } = req.body;
    if (!name.trim()) return res.status(400).json({ error: "Tag name required" });

    tagRepo.createTag.run(name.trim());
    res.json({ success: true });
});

router.post(
    "/projects/:projectId/tags/attach", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
    const { study_id, tag } = req.body;

    if (!study_id || !tag?.trim()) {
        return res.status(400).json({ error: "study_id and tag required" });
    }

    tagRepo.createTag.run(tag.trim());
    const tagRow = tagRepo.getTagByName.get(tag.trim());

    tagRepo.attachTag.run(study_id, tagRow.id);

    res.json({ success: true });
});

router.get(
    "/projects/:projectId/tags/:studyId", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
    const tags = tagRepo.getTagsForStudy.all(req.params.studyId);
    res.json(tags);
});

router.get(
    "/projects/:projectId/tags", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
    const tags = tagRepo.getAllTags.all();
    res.json(tags);
});

module.exports = router;