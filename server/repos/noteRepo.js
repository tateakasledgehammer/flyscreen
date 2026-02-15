const { db } = require("../db");

module.exports = {
    createNote: db.prepare(`
        INSERT INTO notes (user_id, study_id, project_id, content)
        VALUES (?, ?, ?, ?)    
    `),

    getNotesForStudy: db.prepare(`
        SELECT n.*, u.username
        FROM notes n
        JOIN users u ON n.user_id = u.id
        WHERE n.study_id = ? AND n.project_id = ?
        ORDER BY created_at DESC    
    `),

    deleteNote: db.prepare(`
        DELETE FROM notes WHERE id = ? AND user_id = ?  AND project_id = ?   
    `)
};