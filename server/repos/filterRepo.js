const { db } = require("../db");

module.exports = {
    createFilter: db.prepare(`
        INSERT INTO filter_terms (name, project_id) 
        VALUES (?, ?)
        ON CONFLICT(name, project_id) DO NOTHING
    `),

    getFilterByName: db.prepare(`
        SELECT * FROM filter_terms 
        WHERE name = ? AND project_id = ?
    `),

    getAllFilters: db.prepare(`
        SELECT * FROM filter_terms 
        WHERE project_id = ? 
        ORDER BY name ASC
    `),

    deleteFilter: db.prepare(`
        DELETE FROM filter_terms WHERE id = ? AND project_id = ?    
    `)
}
