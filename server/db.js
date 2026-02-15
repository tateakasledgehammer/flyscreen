const path = require("path");
const Database = require("better-sqlite3");

const DB_PATH = path.resolve(__dirname, "flyscreen.db");
console.log("SQLite DB path:", DB_PATH);
const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("busy_timeout = 5000");
db.pragma("foreign_keys = ON");

// db.pragma enables WAL mode - which makes SQL make 3 files
// flyscreen.db - main database w/ users & passwords
// .db-wal (Write ahead log)
// .db-shm (Shared memory) - used by SQL internally

// Create tables
const initSchema = db.transaction(() => {

    // Users
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    `).run();

    // Projects
    db.prepare(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            created_by INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `).run();

    db.prepare(`
        CREATE TABLE IF NOT EXISTS project_users (
            project_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            role TEXT CHECK(role IN ('OWNER', 'REVIEWER')) NOT NULL DEFAULT 'REVIEWER',
            
            PRIMARY KEY (project_id, user_id),
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `).run();

    // Studies
    db.prepare(`
        CREATE TABLE IF NOT EXISTS studies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            
            title TEXT NOT NULL,
            abstract TEXT,
            authors TEXT,
            year INTEGER,
            type TEXT,
            
            journal TEXT,
            volume TEXT,
            issue TEXT,
            
            doi TEXT UNIQUE,
            link TEXT,

            keywords TEXT,
            language TEXT,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_duplicate INTEGER DEFAULT 0,

            project_id INTEGER NOT NULL,
            
            FOREIGN KEY (project_id) REFERENCES projects(id)
        )
    `).run();

    // Duplicates
    db.prepare(`
        CREATE TABLE IF NOT EXISTS duplicates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original_study_id INTEGER NOT NULL,
            duplicate_payload TEXT NOT NULL,
            detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            project_id INTEGER NOT NULL,
            
            FOREIGN KEY (original_study_id) REFERENCES studies(id) ON DELETE CASCADE,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        )
    `).run();

    // Screening decisions
    db.prepare(`
        CREATE TABLE IF NOT EXISTS screenings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            study_id INTEGER NOT NULL,
            
            stage TEXT CHECK(stage IN ('TA','FULLTEXT')) NOT NULL,
            vote TEXT CHECK(vote IN ('ACCEPT','REJECT')) NOT NULL,
            reason TEXT,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            project_id INTEGER NOT NULL,

            UNIQUE(user_id, study_id, stage),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        )
    `).run();

    // Notes
    db.prepare(`
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            study_id INTEGER NOT NULL,

            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            project_id INTEGER NOT NULL,

            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        )
    `).run();

    // Tags
    db.prepare(`
        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            project_id INTEGER NOT NULL,

            UNIQUE(name, project_id),
            FOREIGN KEY (project_id) REFERENCES projects(id)
        )
    `).run();
    
    db.prepare(`
        CREATE TABLE IF NOT EXISTS study_tags (
            study_id INTEGER NOT NULL,
            tag_id INTEGER NOT NULL,
            project_id INTEGER NOT NULL,

            PRIMARY KEY (study_id, tag_id),
            FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        )
    `).run();

});

initSchema();

// INDEXES
// Existing index
db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_studies_year ON studies(year)    
`).run();

// New recommended indexes
db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_screenings_study_stage 
    ON screenings(study_id, stage)    
`).run();

db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_study_tags_study 
    ON study_tags(study_id)    
`).run();

db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_study_tags_tag 
    ON study_tags(tag_id)    
`).run();

// BULK INSERT
const insertManyStudies = db.transaction((studies, projectId) => {
    const insert = db.prepare(`
        INSERT INTO studies (
            title, abstract, authors, year, type,
            journal, volume, issue, doi, link,
            keywords, language, project_id
        ) VALUES (
            @title, @abstract, @authors, @year, @type,
            @journal, @volume, @issue, @doi, @link,
            @keywords, @language, @project_id
        )
    `);

    const findByDOI = db.prepare(`SELECT id FROM studies WHERE doi = ?`);

    const logDuplicate = db.prepare(`
        INSERT INTO duplicates (original_study_id, duplicate_payload)
        VALUES (?, ?)
    `);

    const markDuplicate = db.prepare(`
        UPDATE studies SET is_duplicate = 1 WHERE id = ?    
    `);

    for (const study of studies) {
        study.project_id = projectId;

        try {
            insert.run(study);
        } catch (err) {
            if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
                const existing = findByDOI.get(study.doi);
                logDuplicate.run(existing.id, JSON.stringify(study));
                markDuplicate.run(existing.id);

                continue; // skip duplicate
            }
            throw err;
        }
    }
});

// SCREENING HELPERS

 const getScreeningsForProject = db.prepare(`
    SELECT s.study_id, s.stage, s.vote, s.user_id
    FROM screenings s
    JOIN studies st ON st.id = s.study_id
    WHERE st.project_id = ?    
`)

 const upsertScreening = db.prepare(`
    INSERT INTO screenings (user_id, study_id, project_id, stage, vote, reason, updated_at)
    VALUES (@user_id, @study_id, @project_id, @stage, @vote, @reason, CURRENT_TIMESTAMP)
    
    ON CONFLICT(user_id, study_id, stage)
    DO UPDATE SET
     vote = excluded.vote,
     reason = excluded.reason,
     updated_at = CURRENT_TIMESTAMP
 `);

// EXPORTING

module.exports = {
    db,
    upsertScreening,
    getScreeningsForProject,

    // studies
    createStudy: db.prepare(`
        INSERT INTO studies (
            title, 
            abstract, 
            authors, 
            year, 
            type,
            journal,
            volume,
            issue,
            doi,
            link,
            keywords,
            language,
            project_id
        )
        VALUES (
            @title, 
            @abstract, 
            @authors, 
            @year, 
            @type,
            @journal,
            @volume,
            @issue,
            @doi,
            @link,
            @keywords,
            @language,
            @project_id
        )    
    `),

    getAllStudies: db.prepare(`
        SELECT * FROM studies ORDER BY created_at DESC    
    `),

    getStudyById: db.prepare(`
        SELECT * FROM studies WHERE id = ?  
    `),

    deleteStudy: db.prepare(`
        DELETE FROM studies WHERE id = ?
    `),

    insertManyStudies
};
