const { db } = require("../db");
const { getTotalStudies } = require("./screeningStatsRepo");

module.exports = {
    getVotes: db.prepare(`
        SELECT study_id, stage, vote
        FROM screenings
        WHERE project_id = ?    
    `),

    getTotalStudies: db.prepare(`
        SELECT COUNT(*) AS total
        FROM studies
        WHERE project_id = ?    
    `)
};