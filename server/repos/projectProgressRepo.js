const { db } = require("../db");

module.exports = {
    getVotes: db.prepare(`
        SELECT s.study_id, s.stage, s.vote
        FROM screenings s
        JOIN studies st ON st.id = s.study_id
        WHERE st.project_id = ?    
    `),

    getTotalStudies: db.prepare(`
        SELECT COUNT(*) AS total
        FROM studies
        WHERE project_id = ?    
    `)
};