require("dotenv").config()
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
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

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser())

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

    // saving new user
    const salt = bcrypt.genSaltSync(10)
    req.body.password = bcrypt.hashSync(req.body.password, salt)

    const ourStatement = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)")
    const result = ourStatement.run(req.body.username, req.body.password);

    const lookupStatement = db.prepare("SELECT * FROM users WHERE ROWID = ?");
    const selectedUser = lookupStatement.get(result.lastInsertRowid)

    // cookies
    const tokenValue = jwt.sign({exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, userid: selectedUser.id, username: selectedUser.username}, process.env.JWTSECRET);
    
    res.cookie("flyscreenCookie", tokenValue, {
        httpOnly: true, // can't access cookies in browser
        secure: false, // change back to true later
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24
    })

    res.json({
        success: true,
        message: "Thank you for joining"
    })
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
