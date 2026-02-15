const { db } = require("../db");

db.prepare(`
    CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        study_id INTEGER NOT NULL,
        project_id INTEGER NOT NULL,
        stage TEXT NOT NULL,
        old_vote TEXT,
        new_vote TEXT,
        reason TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )    
`).run();

const insertAudit = db.prepare(`
    INSERT INTO audit_log (user_id, study_id, project_id, stage, old_vote, new_vote, reason)
    VALUES (@user_id, @study_id, @project_id, @stage, @old_vote, @new_vote, @reason)
`);

module.exports = {
    logVoteChange({ user_id, study_id, project_id, stage, old_vote, new_vote, reason }) {
        insertAudit.run({ user_id, study_id, project_id, stage, old_vote, new_vote, reason });
    }
};