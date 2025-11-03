require("dotenv").config();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const mysql = require('mysql2')
const path = require("path");
const db = require("better-sqlite3")(path.join(__dirname, "flyscreen.db"));
db.pragma("journal_mode = WAL");

console.log("server.js loaded successfully")

// database set up
const createTables = db.transaction(() => {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
        )
    `).run()
});
createTables();

// the rest of the server

const app = express();
const PORT = 5005;

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24
};

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser())

app.use((req, res, next) => {
    // decode cookie
    try {
        const decoded = jwt.verify(req.cookies.flyscreenCookie, process.env.JWTSECRET);
        req.user = decoded;
    } catch {
        req.user = null;
    }
    next()
})

app.get("/", (req, res) => {
    res.send("Welcome to the Flyscreen Academics server");
});

app.get("/api/whoami", (req, res) => {
    if (!req.user) {
        return res.json({ isAuthenticated: false });
    }
    res.json({
        isAuthenticated: true,
        user: { 
            id: req.user.userid, 
            username: req.user.username
        }
    });
});

app.post("/api/logout", (req, res) => {
    res.clearCookie("flyscreenCookie", {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        path: "/"
    }),
    res.json({ success: true, message: "Logged out." })
})

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    let errors = [];

    if (typeof username !== "string" || typeof password !== "string") {
        errors.push("Invalid data request. Inputs are not strings")
    }

    if (!username.trim() || !password.trim()) {
        return res.json({ success: false, errors: ["Username or password not provided"] });
    }

    const userLoggingInStatement = db.prepare("SELECT * FROM users WHERE USERNAME = ?")
    const user = userLoggingInStatement.get(req.body.username)

    if (!user) {
        return res.json({ success: false, errors: ["Invalid username / password"] });
    }

    const validPassword = bcrypt.compareSync(password, user.password)
    if (!validPassword) {
        return res.json({ success: false, errors: ["Invalid username / password"] })
    }

    const token = jwt.sign(
        {
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, 
            userid: user.id, 
            username: user.username
        }, 
    process.env.JWTSECRET
    );
    
    res.cookie("flyscreenCookie", token, COOKIE_OPTIONS)
    console.log("New cookie se for: ", user.username)

    res.json({ success: true, message: "Logged in" })
})

app.post("/authentication", (req, res) => {
    const { username, password } = req.body;
    let errors = [];

    if (typeof username !== "string" || typeof password !== "string") {
        errors.push("Invalid data request. Inputs are not strings")
    }

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername) errors.push("No username");
    if (trimmedUsername.length < 4) errors.push("Username must be longer than 4 characters");
    if (trimmedUsername.length > 10) errors.push("Username must be less than 11 characters");

    if (!trimmedPassword) errors.push("No password");
    if (trimmedPassword.length < 6) errors.push("Password must be longer than 6 characters");
    if (trimmedPassword.length > 10) errors.push("Password must be less than 11 characters");

    const usernameStatement = db.prepare("SELECT * FROM users WHERE username = ?");
    const usernameCheck = usernameStatement.get(trimmedUsername);
    if (usernameCheck) errors.push("Username has been taken")

    if (errors.length > 0) {
        return res.json({ success: false, errors });
    }

    // saving new user
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(trimmedPassword, salt)

    const insertStatement = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)")

    try {
        const result = insertStatement.run(trimmedUsername, hashedPassword);
        const lookupStatement = db.prepare("SELECT * FROM users WHERE id = ?");
        const selectedUser = lookupStatement.get(result.lastInsertRowid)

        // sign cookie
        const tokenValue = jwt.sign(
            {
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, 
                userid: selectedUser.id, 
                username: selectedUser.username
            },
            process.env.JWTSECRET
        );
        
        res.cookie("flyscreenCookie", tokenValue, COOKIE_OPTIONS)
        console.log("New cookie set for new user: ", selectedUser.username)

        res.json({ success: true, message: "Thank you for joining" });
    } catch (err) {
        console.error("Error saving user: ", err);
        return res.json({ success: false, errors: ["Could not save user"] })
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});