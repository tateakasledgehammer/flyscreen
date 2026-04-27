const express = require("express");
const router = express.Router();
const { db, getScreeningsForProject } = require("../db.js");

const screeningRepo = require("../repos/screeningRepo");
const auditRepo = require("../repos/auditRepo");
const screeningStatsRepo = require("../repos/screeningStatsRepo");
const projectProgressRepo = require("../repos/projectProgressRepo");

const requireProjectAccess = require("../middleware/projectAuth");
const noteRepo = require("../repos/noteRepo");
const tagRepo = require("../repos/tagRepo");

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

        const allStudies = db.prepare(`
            SELECT id FROM studies WHERE project_id = ?
        `).all(projectId);

        const summary = {};

        for (const s of allStudies) {
            summary[s.id] = {
                TA: { votes: [], myVote: null, final: null, status: "UNSCREENED" },
                FULLTEXT: { votes: [], myVote: null, final: null, status: "UNSCREENED" },
                notes: noteRepo.getNotesForStudy.all(s.id, projectId),
                tags: tagRepo.getTagsForStudy.all(s.id, projectId)
            };
        }

        const rows = getScreeningsForProject.all(projectId);

        for (const row of rows) {
            const { study_id, stage, vote, reason, user_id, is_final } = row;
            const bucket = summary[study_id][stage];

            if (is_final === 1) {
                bucket.final = { user_id, vote, reason };
                continue;
            } 

            if (user_id === req.user.userid) {
                bucket.myVote = { user_id, vote, reason }
            } else {
                bucket.votes.push({ user_id, vote, reason });
            }
        }

        for (const studyId of Object.keys(summary)) {
            for (const stage of ["TA", "FULLTEXT"]) {
                const stageData = summary[studyId][stage];

                if (stageData.final) {
                    stageData.status = stageData.final.vote === "ACCEPT"
                        ? "ACCEPTED"
                        : "REJECTED";
                    continue;
                }

                const allVotes = [
                    ...stageData.votes,
                    ...(stageData.myVote ? [stageData.myVote] : [])
                ];

                const accepts = allVotes.filter(v => v.vote === "ACCEPT").length;
                const rejects = allVotes.filter(v => v.vote !== "ACCEPT").length;
                
                if (allVotes.length === 0) {
                    stageData.status = "UNSCREENED";
                    continue;
                }

                if (allVotes.length === 1) {
                    stageData.status = "PENDING";
                    continue;
                }

                if (accepts >= 2) {
                    stageData.status = "ACCEPTED";
                    stageData.final = {
                        user_id: null,
                        vote: "ACCEPT",
                        reason: null
                    };
                    continue;
                }

                if (rejects >= 2) {
                    const reasons = allVotes.map(v => v.reason ?? v.vote);
                    const uniqueReasons = [...new Set(reasons)];

                    if (uniqueReasons.length === 1) {
                        stageData.status = "REJECTED";
                        stageData.final = {
                            user_id: null,
                            vote: "REJECT",
                            reason: uniqueReasons[0]
                        };
                        continue;
                    } else {
                        stageData.status = "CONFLICT"
                        continue;
                    }
                }

                else if (accepts === 1 && rejects === 1) {
                    stageData.status = "CONFLICT";
                    continue;
                }
            }
        }

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
            if (stage === "FULLTEXT") {
                const vote = decision === "ACCEPT" ? "ACCEPT" : "REJECT";
                const reason = decision === "ACCEPT" ? null : decision;

                db.prepare(`
                    INSERT INTO screenings (study_id, project_id, stage, vote, reason, is_final, user_id)
                    VALUES (?, ?, ?, ?, ?, 1, ?)    
                `).run(
                    req.params.studyId, 
                    req.params.projectId, 
                    stage, 
                    vote,
                    reason,
                    req.user.userid
                );
            }

            if (stage === "TA") {
                db.prepare(`
                    INSERT INTO screenings (study_id, project_id, stage, vote, is_final, user_id)
                    VALUES (?, ?, ?, ?, 1, ?)    
                `).run(
                    req.params.studyId, 
                    req.params.projectId, 
                    stage, 
                    decision,
                    req.user.userid
                );
            }

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
            perStudy[v.study_id][v.stage].push(v);
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
            let taStatus;
            const taFinal = taVotes.find(v => v.is_final === 1);

            if (taFinal) {
                if (taFinal.vote === "ACCEPT") { 
                    taStatus = "ACCEPTED"; 
                    taAccepted++; 
                } else {
                    taStatus = "REJECTED"; 
                    taRejected++;
                }
            } else {
                const taVals = taVotes.map(v => v.vote);
                if (taVals.length === 0) {
                    taStatus = "UNSCREENED";
                    taUnscreened++;
                } else if 
                    (taVals.includes("ACCEPT") && taVals.includes("REJECT")) {
                        taStatus = "CONFLICT";
                        taConflict++;
                } else if
                    (taVals.every(v => v === "ACCEPT") && taVals.length >= 2) {
                        taStatus = "ACCEPTED";
                        taAccepted++;
                } else if
                    (taVals.every(v => v === "REJECT") && taVals.length >= 2) {
                        taStatus = "REJECTED";
                        taRejected++;
                } else {
                    taStatus = "PENDING"
                    taPending++;
                }
            }

            if (taStatus === "ACCEPTED") {
                // FT
                const ftFinal = ftVotes.find(v => v.is_final === 1);

                if (ftFinal) {
                    if (ftFinal.vote === "ACCEPT") {
                        ftAccepted++;
                    } else {
                        ftRejected++;
                    }
                } else {
                    const ftVals = ftVotes.map(v => v.vote);
                    if (ftVals.length === 0) {
                        ftUnscreened++;
                    } else if (ftVals.includes("ACCEPT") && ftVals.includes("REJECT")) {
                        ftConflict++;
                    } else if (ftVals.every(v => v === "ACCEPT") && ftVals.length >= 2) {
                        ftAccepted++;
                    } else if (ftVals.every(v => v === "REJECT") && ftVals.length >= 2) {
                        ftRejected++;
                    } else {
                        ftPending++;
                    }
                }
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