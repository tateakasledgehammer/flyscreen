const { db } = require("../db");

module.exports = {
    upsertScore: db.prepare(`
        INSERT INTO study_scores (study_id, project_id, score, explanation, score_status)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(study_id) DO UPDATE SET
            score = excluded.score,
            explanation = excluded.explanation,
            score_status = excluded.score_status,
            updated_at = CURRENT_TIMESTAMP
    `),

    getScoresForProject: db.prepare(`
        SELECT * FROM study_scores
        WHERE project_id = ?
    `)
};