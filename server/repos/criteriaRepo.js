const { db } = require("../db");

module.exports = {
    clearSections: db.prepare(`
        DELETE FROM criteria_sections WHERE project_id = ?    
    `),
    
    clearItems: db.prepare(`
        DELETE FROM criteria_items 
        WHERE section_id IN (
            SELECT id FROM criteria_sections WHERE project_id = ?
        )   
    `),

    clearFullText: db.prepare(`
        DELETE FROM fulltext_exclusion_reasons WHERE project_id = ?    
    `),

    insertSection: db.prepare(`
        INSERT INTO criteria_sections (project_id, type, name)
        VALUES (?, ?, ?)
    `),

    insertItem: db.prepare(`
        INSERT INTO criteria_items (section_id, text)
        VALUES (?, ?)
    `),

    insertFullText: db.prepare(`
        INSERT INTO fulltext_exclusion_reasons (project_id, reason)
        VALUES (?, ?)
    `),

    getSections: db.prepare(`
        SELECT * FROM criteria_sections
        WHERE project_id = ?
        ORDER BY id ASC
    `),

    getItemsForSection: db.prepare(`
        SELECT * FROM criteria_items
        WHERE section_id = ?
        ORDER BY id ASC
    `),

    getFullText: db.prepare(`
        SELECT reason FROM fulltext_exclusion_reasons
        WHERE project_id = ?
        ORDER BY id ASC
    `)
}