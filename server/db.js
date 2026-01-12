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
            journal TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Screening decisions
    db.prepare(`
        CREATE TABLE IF NOT EXISTS screenings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            study_id INTEGER NOT NULL,
            status TEXT CHECK(status IN ('unscreened','included','excluded')) NOT NULL DEFAULT 'unscreened',
            reason TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
            UNIQUE(user_id, study_id)
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

module.exports = db;

