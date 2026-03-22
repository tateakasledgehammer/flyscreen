const express = require("express");
const router = express.Router();

const noteRepo = require("../repos/noteRepo");
const requireProjectAccess = require("../middleware/projectAuth.js");

/* middleware */
function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    next();
}

router.post(
    "/projects/:projectId/notes", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
        const { study_id, content } = req.body;
        const projectId = Number(req.params.projectId);

        if (!study_id || !content?.trim()) {
            return res.status(400).json({ error: "study_id and content required" });
        }

        noteRepo.createNote.run(
            req.user.userid, 
            study_id, 
            projectId, 
            content.trim()
        );

        res.json({ success: true });
});

router.get(
    "/projects/:projectId/notes/:studyId", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
    const notes = noteRepo.getNotesForStudy.all(req.params.studyId, req.params.projectId);
    res.json(notes);
});

router.delete(
    "/projects/:projectId/notes/:id", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
        noteRepo.deleteNote.run(
            req.params.id, 
            req.user.userid,
            req.params.projectId
        );
        res.json({ success: true });
});

module.exports = router;