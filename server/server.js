const express = require("express");
const cors = require("cors");
const db = require("better-sqlite3")("flyscreen.db");
db.pragma("journal_mode = WAL");

// database set up
const createTables = db.transaction(() => {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username STRING NOT NULL UNIQUE,
        password STRING NOT NULL
        )
    `).run()
})

createTables();

// the rest of the server

const app = express();
const PORT = 5005;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to the node server");
});

app.post("/authentication", (req, res) => {
    console.log("POST /authentication hit with body:", req.body);

    const { username, password } = req.body;
    let errors = [];

    if (typeof username !== "string" || typeof password !== "string") {
        errors.push("Invalid data request. Inputs are not strings")
    }

    const trimmedUsername = username.trim();
    if (!trimmedUsername) { errors.push("No username") }
    if (trimmedUsername.length < 4) { errors.push("Username must be longer than 4 characters") }
    if (trimmedUsername.length > 10) { errors.push("Username must be less than 11 characters") }
    
    const trimmedPassword = password.trim()
    if (!trimmedPassword) { errors.push("No password") }
    if (trimmedPassword.length < 6) { errors.push("Password must be longer than 6 characters") }
    if (trimmedPassword.length > 10) { errors.push("Password must be less than 11 characters") }

    if (errors.length > 0) {
        return res.json({
            success: false,
            errors: errors
        })
    } 

    const ourStatement = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)")
    ourStatement.run(req.body.username, req.body.password);

    res.json({
        success: true,
        message: "Thank you for joining"
    })
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
