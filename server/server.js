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

// database set up
const createTables = db.transaction(() => {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username STRING NOT NULL UNIQUE,
        password STRING NOT NULL
        )
    `).run()
});
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

app.use(function (req, res, next) {
    res.locals.errors = [];

    // decode cookie
    try {
        const decoded = jwt.verify(req.cookies.flyscreenCookie, process.env.JWTSECRET);
        req.user = decoded;
    } catch(err) {
        req.user = false;
    }
    res.locals.user = req.user
    console.log(req.user)
    next()
})

app.get("/", (req, res) => {
    res.send("Welcome to the node server");
});

app.get("/whoami", (req, res) => {
    if (!req.user) {
        return res.json({ isAuthenticated: false });
    }
    res.json({
        isAuthenticated: true,
        user: { id: req.user.userid, username: req.user.username}
    });
});

app.get("/logout", (req, res) => {
    res.clearCookie("flyscreenCookie", {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
    });
    res.json({ success: true, message: "Logged out." })
})

app.post("/login", (req, res) => {
    console.log("POST /login hit with body:", req.body);

    const { username, password } = req.body;
    let errors = [];

    if (typeof username !== "string" || typeof password !== "string") {
        errors.push("Invalid data request. Inputs are not strings")
    }

    if (req.body.username.trim() == "") errors = ["No username provided"]
    if (req.body.password == "") errors = ["No password provided"]

    if (errors.length) {
        return res.json({
            success: false,
            errors: errors
        })
    }

    const userLoggingInStatement = db.prepare("SELECT * FROM users WHERE USERNAME = ?")
    const userLoggingIn = userLoggingInStatement.get(req.body.username)

    if (!userLoggingIn) {
        errors = ["Invalid username / password"]
        return res.json({
            success: false,
            errors: errors
        })
    }

    const passwordMatch = bcrypt.compareSync(req.body.password, userLoggingIn.password)
    if (!passwordMatch) {
        errors = ["Invalid username / password"]
        return res.json({
            success: false,
            errors: errors
        })
    }

    if (passwordMatch) {
        const tokenValue = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, 
            userid: userLoggingIn.id, 
            username: userLoggingIn.username
        }, process.env.JWTSECRET);
        
        res.cookie("flyscreenCookie", tokenValue, {
            httpOnly: true, // can't access cookies in browser
            secure: false, // change back to true later
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24
        })

        console.log("New cookie set: ", tokenValue)

        res.json({
            success: true,
            message: "Logged in"
        })
    }
})

app.get("/create-project", (req, res) => {
    res.json({ success: true })
})

app.post("/create-project", (req, res) => {
    const { projectTitle } = req.body;

    if (!projectTitle) {
        return res.status(400).json({ error: "Title is required" });
    }

    console.log("New project: ", projectTitle)

    res.json({
        success: true,
        project: {projectTitle}
    })
})

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
    
    const usernameStatement = db.prepare("SELECT * FROM users WHERE username = ?");
    const usernameCheck = usernameStatement.get(req.body.username);

    if (usernameCheck) errors.push("Username has been taken")

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

    const existingUsername = db.prepare("SELECT * FROM users WHERE username = ?").get(trimmedUsername);
    if (existingUsername) {
        return res.json({ success: false, errors: ["Username already exists"] });
    }

    // saving new user
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(req.body.password, salt)

    const userStatement = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)")

    try {
        const result = userStatement.run(trimmedUsername, hashedPassword);
        console.log("User saved: ", result)

        const lookupStatement = db.prepare("SELECT * FROM users WHERE ROWID = ?");
        const selectedUser = lookupStatement.get(result.lastInsertRowid)

        // cookies
        const tokenValue = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, 
            userid: selectedUser.id, 
            username: selectedUser.username
        }, process.env.JWTSECRET);
        
        res.cookie("flyscreenCookie", tokenValue, {
            httpOnly: true, // can't access cookies in browser
            secure: false, // change back to true later
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24
        })

        console.log("New cookie set: ", tokenValue)

        res.json({
            success: true,
            message: "Thank you for joining"
        })
    } catch (err) {
        console.error("Error saving user: ", err);
        return res.json({ success: false, errors: ["Could not save user"] })
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
