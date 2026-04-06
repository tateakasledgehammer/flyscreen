const criteriaRepo = require("../repos/criteriaRepo");
const aiScoringEngine = require("./aiScoringEngine");
const scoringEngine = require("./scoringEngine");
const { db } = require("../db");

function loadCriteria(projectId) {
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

    return {
        inclusionCriteria: inclusion,
        exclusionCriteria: exclusion,
        fullTextExclusionReasons: fulltext
    };
}

function loadBackground(projectId) {
    const project_background = db.prepare(`
        SELECT title, study_type, context 
        FROM project_background 
        WHERE project_id = ?
    `).get(projectId);

    return project_background;
}

async function aiScorePendingStudies(projectId) {
    console.log("Scoring worker started for project", projectId);

    const pending = db.prepare(`
        SELECT s.*, ss.project_id
        FROM studies s
        JOIN study_scores ss ON ss.study_id = s.id
        WHERE ss.project_id = ? AND ss.score_status = 'pending'
        LIMIT 10
    `).all(projectId);

    if (pending.length === 0) return;

    const ids = pending.map(s => s.id);

    const markScoring = db.prepare(`
        UPDATE study_scores SET score_status = 'scoring'
        WHERE study_id = ?
    `)
    ids.forEach(id => markScoring.run(id));

    const criteria = loadCriteria(projectId);
    const background = loadBackground(projectId);

    let results;
    try {
        const project = db.prepare(`
            SELECT scoring_mode FROM projects WHERE id = ?  
        `).get(projectId);

        const usingAI = project.scoring_mode === "ai";

        if (usingAI) {
            results = await aiScoringEngine.scoreStudiesAI(
                pending,
                criteria,
                background
            );
        } else {
            results = pending.map(s => {
                const r = scoringEngine.scoreStudy(s, criteria);
                console.log("Pending studies:", pending.length);
                return {
                    id: s.id,
                    score: r.score,
                    explanation: r.explanation
                }
            }); 
        }
    } catch (err) {
        console.error("Scoring failed:", err);
        ids.forEach(id => {
            db.prepare(`
                UPDATE study_scores SET score_status = 'error'
                WHERE study_id = ?
            `).run(id);
        });
        return;
    }

    const update = db.prepare(`
        UPDATE study_scores
        SET score = ?, explanation = ?, score_status = 'done'
        WHERE study_id = ?
    `);

    results.forEach(r => {
        update.run(r.score, r.explanation, r.id);
        console.log("Scored study:", r.id);
    });

    setTimeout(() => aiScorePendingStudies(projectId), 200);
}

module.exports = aiScorePendingStudies;