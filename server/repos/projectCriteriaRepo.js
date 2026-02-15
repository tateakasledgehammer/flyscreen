const { db } = require("../db");

module.exports = {
    upsertCriteria: db.prepare(`
        INSERT INTO project_criteria (
            project_id, 
            population, 
            intervention, 
            comparator, 
            outcomes, 
            study_design, 
            exclusions
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(project_id) DO UPDATE SET
            population = excluded.population,
            intervention = excluded.intervention,
            comparator = excluded.comparator,
            outcomes = excluded.outcomes,
            study_design = excluded.study_design,
            exclusions = excluded.exclusions
    `),

    getCriteria: db.prepare(`
        SELECT *
        FROM project_criteria
        WHERE project_id = ?    
    `)
};