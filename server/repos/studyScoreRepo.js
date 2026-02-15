const { db } = require("../db");

module.exports = {
    upsertScore: db.prepare(`
        INSERT INTO study_scores (study_id, project_id, score, explanation)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(study_id) DO UPDATE SET
            score = excluded.score,
            explanation = excluded.explanation,
            updated_at = CURRENT_TIMESTAMP
    `),

    getScoresForProject: db.prepare(`
        SELECT * FROM study_scores
        WHERE project_id = ?
    `)
};