const { db } = require("../db");

module.exports = {
    createNote: db.prepare(`
        INSERT INTO notes (user_id, study_id, content)
        VALUES (?, ?, ?)    
    `),

    getNotesForStudy: db.prepare(`
        SELECT n.*, u.username
        FROM notes n
        JOIN users u ON n.user_id = u.id
        WHERE study_id = ?
        ORDER BY created_at DESC    
    `),

    deleteNote: db.prepare(`
        DELETE FROM notes WHERE id = ? AND user_id = ?    
    `)
};