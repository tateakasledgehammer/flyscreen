const { db } = require("../db");

module.exports = {
    getMyStats: db.prepare(`
        SELECT
            stage,
            vote,
            COUNT(*) AS count
        FROM screenings
        WHERE project_id = ? AND user_id = ?
        GROUP BY stage, vote    
    `),

    getTotalStudies: db.prepare(`
        SELECT COUNT(*) AS total
        FROM studies
        WHERE project_id = ?
    `),

    getMyScreenedStudies: db.prepare(`
        SELECT COUNT(DISTINCT study_id) AS screened
        FROM screenings
        WHERE project_id = ? AND user_id = ?
    `)
};