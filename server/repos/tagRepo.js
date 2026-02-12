const { db, upsertScreening } = require("../db");

module.exports = {
    createTag: db.prepare(`
        INSERT INTO tags (name) VALUES (?)
        ON CONFLICT(name) DO NOTHING
    `),

    getTagByName: db.prepare(`
        SELECT * FROM tags WHERE name = ?
    `),

    attachTag: db.prepare(`
        INSERT OR IGNORE INTO study_tags (study_id, tag_id)
        VALUES (?, ?)    
    `),

    getTagsForStudy: db.prepare(`
        SELECT t.*
        FROM tags t
        JOIN study_tags st ON st.tag_id = t.id
        WHERE st.study_id = ?    
    `),
    
    getAllTags: db.prepare(`
        SELECT * FROM tags ORDER BY name ASC
    `),
}
