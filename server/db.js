const path = require("path");
const Database = require("better-sqlite3");

const DB_PATH = path.resolve(__dirname, "flyscreen.db");

console.log("SQLite DB path:", DB_PATH);

const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
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
            
            doi TEXT,
            link TEXT,

            keywords TEXT,
            language TEXT,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
            
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
            
            UNIQUE(user_id, study_id, stage)
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
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE
        )
    `).run();
});

initSchema();

db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_studies_year ON studies(year)    
`).run();


const insertManyStudies = db.transaction((studies) => {
    const insert = db.prepare(`
        INSERT INTO studies (
            title, abstract, authors, year, type,
            journal, volume, issue, doi, link,
            keywords, language
        ) VALUES (
            @title, @abstract, @authors, @year, @type,
            @journal, @volume, @issue, @doi, @link,
            @keywords, @language
        )
    `);

    for (const study of studies) {
        insert.run(study);
    }
});
 
 const getScreeningsForStudies = db.prepare(`
     SELECT * FROM screenings
 `);

 export const upsertScreening = db.prepare(`
    INSERT INTO screenings (user_id, study_id, stage, vote, reason, updated_at)
    VALUES (@user_id, @study_id, @stage, @vote, @reason, CURRENT_TIMESTAMP)
    
    ON CONFLICT(user_id, study_id, stage)
    DO UPDATE SET
     vote = excluded.vote,
     reason = excluded.reason,
     updated_at = CURRENT_TIMESTAMP
 `);

module.exports = {
    db,
    upsertScreening,
    getScreeningsForStudies,

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
            language
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
            @language
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
