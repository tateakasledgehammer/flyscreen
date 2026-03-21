const express = require("express");
const router = express.Router();
const { db, getScreeningsForProject } = require("../db.js");

const screeningRepo = require("../repos/screeningRepo");
const auditRepo = require("../repos/auditRepo");
const screeningStatsRepo = require("../repos/screeningStatsRepo.js");
const projectProgressRepo = require("../repos/projectProgressRepo.js");

const requireProjectAccess = require("../middleware/projectAuth.js");

/* middleware */
function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    next();
}

const studyProjectCheck = db.prepare(`
    SELECT project_id FROM studies WHERE id = ?    
`);

/* get them all */
router.get(
    "/projects/:projectId/screenings/summary", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
    try {
        const projectId = Number(req.params.projectId);
        const rows = getScreeningsForProject.all(projectId);
        const summary = {};

        for (const row of rows) {
            const { study_id, stage, vote, user_id, is_final } = row;

            // Study + Stage structure
            if (!summary[study_id]) {
                summary[study_id] = {
                    TA: { votes: [], myVote: null, final: null, status: "UNSCREENED" },
                    FULLTEXT: { votes: [], myVote: null, final: null, status: "UNSCREENED" }
                };
            }

            const bucket = summary[study_id][stage];

            if (is_final === 1) {
                bucket.final = { user_id, vote };
                continue;
            } 

            if (user_id === req.user.userid) {
                bucket.myVote = { user_id, vote }
            } else {
                bucket.votes.push({ user_id, vote });
            }
        }

        for (const studyId of Object.keys(summary)) {
            for (const stage of ["TA", "FULLTEXT"]) {
                const stageData = summary[studyId][stage];

                const final = rows.filter(
                    r => r.study_id === Number(studyId) &&
                    r.stage === stage &&
                    r.is_final === 1
                );

                if (final.length > 0) {
                    stageData.status = final[0].vote === "ACCEPT" ? "ACCEPTED" : "REJECTED";
                    continue;
                }

                const allVotes = [
                    ...stageData.votes,
                    ...(stageData.myVote ? [stageData.myVote] : [])
                ];

                const accepts = allVotes.filter(v => v.vote === "ACCEPT").length;
                const rejects = allVotes.filter(v => v.vote === "REJECT").length;
                
                let status = "UNSCREENED";
                if (allVotes.length === 1) status = "PENDING";
                if (accepts >= 2) status = "ACCEPTED";
                if (rejects >= 2) status = "REJECTED";
                if (accepts === 1 && rejects === 1) status = "CONFLICT";

                stageData.status = status;
            }
        }
        // console.log("SUMMARY BUILDER OUTPUT:", JSON.stringify(summary, null, 2));

        res.json(summary);

    } catch (err) {
        console.error("Error in /screenings/summary:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

/* voting */
router.post(
    "/projects/:projectId/screenings", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {      
    try {
        const { study_id, stage, vote, reason } = req.body;
        const userId = req.user.userid;
        const projectId = Number(req.params.projectId);

        // validate study belongs to project
        const row = studyProjectCheck.get(study_id);
        if (!row || row.project_id !== Number(req.params.projectId)) {
            return res.status(403).json({ error: "Study does not belong to this project" });
        }

        // general checks
        if (!study_id || !stage) {
            return res.status(400).json({ error: "Missing study_id or stage" });
        }
        if (!["TA", "FULLTEXT"].includes(stage)) {
            return res.status(400).json({ error: "Invalid stage" });
        }
        if (!["ACCEPT", "REJECT"].includes(vote)) {
            return res.status(400).json({ error: "Invalid vote" });
        }

        // the vote
        const processVote = db.transaction(() => {
            // Checking existing votes
            const existingVotes = screeningRepo.getVotesForStudyStage.all(study_id, stage, projectId);
            const oldVote = existingVotes.find(v => v.user_id === userId)?.vote ?? null;
            const hasUserVoted = oldVote !== null;

            const accepts = existingVotes.filter(v => v.vote === "ACCEPT").length;
            const rejects = existingVotes.filter(v => v.vote === "REJECT").length;
            
            // Finalisation rules
            if (accepts >= 2 || rejects >= 2) throw new Error("FINALISED");
            if (existingVotes.length >= 2 && !hasUserVoted) throw new Error("CLOSED");

            // The vote...
            screeningRepo.saveVote({
                user_id: userId,
                study_id,
                stage,
                vote,
                reason: reason ?? null,
                project_id: Number(req.params.projectId)
            });

            auditRepo.logVoteChange({
                user_id: userId,
                study_id,
                project_id: Number(req.params.projectId),
                stage,
                old_vote: oldVote,
                new_vote: vote,
                reason: reason ?? null
            })
        });

        try {
            processVote();
        } catch (err) {
            if (err.message === "FINALISED") {
                return res.status(409).json({ error: "Decision finalised" });
            }
            if (err.message === "CLOSED") {
                return res.status(409).json({ error: "Voting closed" });
            }
            throw err; // unexpected
        }

        res.json({ success: true, message: "Screening saved" });

    } catch (err) {
        console.error("SCREENING POST ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// conflict resolution
router.post(
    "/projects/:projectId/studies/:studyId/resolve", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
        const { decision, stage } = req.body;

        console.log("RESOLVE ROUTE:", {
            studyId: req.params.studyId,
            projectId: req.params.projectId,
            userId: req.user.userid,
            decision,
            stage
        });

        db.prepare(`
            DELETE FROM screenings
            WHERE study_id = ? AND stage = ? AND is_final = 1    
        `).run(req.params.studyId, stage);

        try {
            db.prepare(`
                INSERT INTO screenings (study_id, project_id, stage, vote, is_final, user_id)
                VALUES (?, ?, ?, ?, 1, ?)    
            `).run(
                req.params.studyId, 
                req.params.projectId, 
                stage, 
                decision,
                req.user.userid);
        } catch (err) {
            console.error("RESOLVE ERROR:", err);
            return res.status(500).json({ error: err.message });
        }

        res.json({ success: true })
    }
)

// revert vote
router.post(
    "/projects/:projectId/studies/:studyId/revert", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
        const { stage } = req.body;
        const studyId = req.params.studyId;
        const userId = req.user.userid;

        console.log("REVERT ROUTE:", {
            studyId,
            projectId: req.params.projectId,
            userId,
            stage
        });

        try {  
            db.prepare(`
                DELETE FROM screenings
                WHERE study_id = ? AND stage = ? AND user_id = ? AND is_final = 0
            `).run(studyId, stage, userId);
            
            db.prepare(`
                DELETE FROM screenings
                WHERE study_id = ? AND stage = ? AND is_final = 1
            `).run(studyId, stage);

            res.json({ success: true });
        } catch (err) {
            console.error("REVERT ERROR:", err);
            res.status(500).json({ error: err.message });
        }
    }
)

// screening stats
router.get(
    "/projects/:projectId/my-stats", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
        const projectId = Number(req.params.projectId);
        const userId = req.user.userid;

        const breakdown = screeningStatsRepo.getMyStats.all(projectId, userId);
        const totalStudies = screeningStatsRepo.getTotalStudies.all(projectId).total;
        const screened = screeningStatsRepo.getMyScreenedStudies.all(projectId, userId).screened;

        const stats = {
            totalStudies,
            screened,
            remaining: totalStudies - screened,
            TA: { ACCEPT: 0, REJECT: 0 },
            FULLTEXT: { ACCEPT: 0, REJECT: 0 },
        };

        for (const row of breakdown) {
            stats[row.stage][row.vote] = row.count
        }

        res.json(stats);
    }
);

router.get(
    "/projects/:projectId/progress", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
        const projectId = Number(req.params.projectId);
        
        // defaults
        const studies = db.prepare(`
            SELECT id FROM studies WHERE project_id = ?
        `).all(projectId);
        const total = studies.length;

        const perStudy = {};
        for (const s of studies) {
            perStudy[s.id] = { TA: [], FULLTEXT: [] };
        }

        const votes = projectProgressRepo.getVotes.all(projectId) || [];
        for (const v of votes) {
            if (!perStudy[v.study_id]) {
                perStudy[v.study_id] = { TA: [], FULLTEXT: [] };
            }
            perStudy[v.study_id][v.stage].push(v.vote);
        }

        // initialise
        let 
            taUnscreened = 0,
            taPending = 0, 
            taConflict = 0, 
            taAccepted = 0,
            taRejected = 0;
        let 
            ftUnscreened = 0,
            ftPending = 0, 
            ftConflict = 0, 
            ftAccepted = 0,
            ftRejected = 0;
        
        for (const studyId in perStudy) {
            const taVotes = perStudy[studyId].TA;
            const ftVotes = perStudy[studyId].FULLTEXT;

            // TA
            if (taVotes.length === 0) {
                taUnscreened++;
            } else if 
                (taVotes.includes("ACCEPT") && taVotes.includes("REJECT")) {
                    taConflict++;
            } else if
                (taVotes.every(v => v === "ACCEPT") && taVotes.length >= 2) {
                    taAccepted++;
            } else if
                (taVotes.every(v => v === "REJECT") && taVotes.length >= 2) {
                    taRejected++;
            } else {
                taPending++;
            }

            // FT
            if (ftVotes.length === 0) {
                ftUnscreened++;
            } else if (ftVotes.includes("ACCEPT") && ftVotes.includes("REJECT")) {
                ftConflict++;
            } else if (ftVotes.every(v => v === "ACCEPT") && ftVotes.length >= 2) {
                ftAccepted++;
            } else if (ftVotes.every(v => v === "REJECT") && ftVotes.length >= 2) {
                ftRejected++;
            } else {
                ftPending++;
            }
        }

        res.json({
            totalStudies: total,
            ta: {
                unscreened: taUnscreened,
                pending: taPending,
                accepted: taAccepted,
                conflict: taConflict,
                rejected: taRejected
            },
            ft: {
                unscreened: ftUnscreened,
                pending: ftPending,
                accepted: ftAccepted,
                conflict: ftConflict,
                rejected: ftRejected
            }
        });

    }
);

module.exports = router;