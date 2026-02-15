const { db, upsertScreening } = require("../db");

module.exports = {
    createTag: db.prepare(`
        INSERT INTO tags (name, project_id) 
        VALUES (?, ?)
        ON CONFLICT(name, project_id) DO NOTHING
    `),

    getTagByName: db.prepare(`
        SELECT * FROM tags WHERE name = ? AND project_id = ?
    `),

    attachTag: db.prepare(`
        INSERT OR IGNORE INTO study_tags (study_id, tag_id, project_id)
        VALUES (?, ?, ?)    
    `),

    getTagsForStudy: db.prepare(`
        SELECT t.*
        FROM tags t
        JOIN study_tags st ON st.tag_id = t.id
        JOIN studies s ON s.id = st.study_id
        WHERE st.study_id = ? AND st.project_id = ?  
    `),
    
    getAllTags: db.prepare(`
        SELECT * FROM tags WHERE project_id = ? ORDER BY name ASC
    `),
}
