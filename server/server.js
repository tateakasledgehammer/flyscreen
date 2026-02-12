require("dotenv").config();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
// const bodyParser = require('body-parser');
// const crypto = require("crypto");

const screeningRoutes = require("./routes/screenings.js");
const notesRoutes = require("./routes/notes.js");
const tagRoutes = require("./routes/tags.js");
const duplicateRoutes = require("./routes/duplicates.js")
const studyDetailRoutes = require("./routes/studyDetails.js")

console.log("server.js loaded successfully");

const app = express();
const PORT = 5005;

const {
    db,
    createStudy,
    getAllStudies,
    getStudyById,
    deleteStudy,
    insertManyStudies,
} = require("./db");

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false, // change later - process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24
};

// middleware

app.use(cors({
    origin: process.env.CLIENT_ORIGIN
        ? process.env.CLIENT_ORIGIN.split(",")
        : "http://localhost:5173",
    credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

if (!process.env.JWTSECRET) {
    throw new Error("JWTSECRET not set in environment");
}

app.use((req, res, next) => {
    // decode cookie
    try {
        const token = req.cookies.flyscreenCookie;
        if (!token) {
            req.user = null;
        } else {
            const decoded = jwt.verify(token, process.env.JWTSECRET, { algorithms: ["HS256"] });
            req.user = decoded;
        }
    } catch {
        req.user = null;
    }
    next();
})

const requireAuth = (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    next();
};

app.use("/api", screeningRoutes);
app.use("/api", notesRoutes);
app.use("/api", tagRoutes);
app.use("/api", duplicateRoutes);
app.use("/api", studyDetailRoutes);

// ---- STUDIES ----

// get all studies
app.get("/api/studies", requireAuth, (req, res) => {
    try {
        const studies = getAllStudies.all();
        res.json(studies);
    } catch (err) {
        console.error("Error getting all studies", err);
        res.status(500).json({ error: "Failed to get all studies"});
    }
});

app.post("/api/studies/bulk", requireAuth, (req, res) => {      
    const studies = req.body.studies;

    if (!Array.isArray(studies) || studies.length === 0) {
        return res.status(400).json({ error: "Studies array required" });
    }

    const dbSafeStudy = study => ({
        title: study.title,
        abstract: study.abstract,
        authors: study.authors,
        year: study.year,
        type: study.type,
        journal: study.journal,
        volume: study.volume,
        issue: study.issue,
        doi: study.doi,
        link: study.link,
        keywords: study.keywords,
        language: study.language
      });

    try {
        const cleanStudies = studies.map(dbSafeStudy);
        insertManyStudies(cleanStudies, projectId);
        res.json({ success: true, message: `Inserted ${studies.length} studies.` });
    } catch (error) {
        console.error("Bulk insert error:", error);
        res.status(500).json({ error: "Failed to insert studies" })
    }
})

app.post("/api/studies", requireAuth, (req, res) => {
    const { 
        title, 
        abstract, 
        authors, 
        year, 
        type,
        doi,
        link,
        journal,
        volume,
        issue,
        keywords,
        language
    } = req.body;
    
    if (!title || typeof title !== "string") {
        return res.status(400).json({ error: "Title required" });
    }
    if (!year || typeof year !== "number") {
        return res.status(400).json({ error: "Year required" });
    }

    try {
        const result = createStudy.run({
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
        });

        const study = getStudyById.get(result.lastInsertRowid);
        res.json(study);
    } catch (err) {
        console.error("Error creating study", err);
        res.status(500).json({ error: "Failed to create study" });
    }
})

app.delete("/api/studies/:id", requireAuth, (req, res) => {
    try {
        deleteStudy.run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error("Error deleting study", err);
        res.status(500).json({ error: "Failed to delete" });
    }
});

// clear studies
app.delete('/api/studies', requireAuth, async (req, res) => {
    try {
        const stmt = db.prepare("DELETE FROM studies");
        stmt.run();
        res.status(200).json({ message: "All studies deleted" })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to delete studies" })
    }
});

///////////////////////

// ---- GENERAL & AUTH ----

app.get("/", (req, res) => {
    res.send("Welcome to the Flyscreen Academics server");
});

app.get("/api/auth/whoami", requireAuth, (req, res) => {
    res.json({
        isAuthenticated: true,
        user: { 
            id: req.user.userid, 
            username: req.user.username
        }
    });
});

app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("flyscreenCookie", {
        ...COOKIE_OPTIONS,
    }),
    res.json({ success: true, message: "Logged out." })
})

app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    let errors = [];

    if (typeof username !== "string" || typeof password !== "string") {
        return res.status(400).json({ success: false, errors: ["Invalid data request. Inputs are not strings"] })
    }

    if (!username.trim() || !password.trim()) {
        return res.json({ success: false, errors: ["Username or password not provided"] });
    }

    const userLoggingInStatement = db.prepare("SELECT * FROM users WHERE USERNAME = ?")
    const user = userLoggingInStatement.get(req.body.username)

    if (!user) {
        return res.json({ success: false, errors: ["Invalid username / password"] });
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
        return res.json({ success: false, errors: ["Invalid username / password"] })
    }

    const token = jwt.sign(
        {
            userid: user.id, 
            username: user.username
        }, 
        process.env.JWTSECRET,
        { expiresIn: "1d" }
    );
    
    res.cookie("flyscreenCookie", token, COOKIE_OPTIONS)
    // console.log("New cookie set for: ", user.username)

    res.json({ success: true, message: "Logged in" })
})

app.post("/api/auth/register", async (req, res) => {
    const { username, password } = req.body;
    let errors = [];

    if (typeof username !== "string" || typeof password !== "string") {
        errors.push("Invalid data request. Inputs are not strings")
    }

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername) errors.push("No username");
    if (trimmedUsername.length < 4) errors.push("Username must be longer than 4 characters");
    if (trimmedUsername.length > 20) errors.push("Username must be less than 21 characters");

    if (!trimmedPassword) errors.push("No password");
    if (trimmedPassword.length < 6) errors.push("Password must be longer than 6 characters");
    if (trimmedPassword.length > 32) errors.push("Password must be less than 33 characters");

    const usernameStatement = db.prepare("SELECT * FROM users WHERE username = ?");
    const usernameCheck = usernameStatement.get(trimmedUsername);
    if (usernameCheck) errors.push("Username has been taken")

    if (errors.length > 0) {
        return res.json({ success: false, errors });
    }

    // saving new user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(trimmedPassword, salt)

    const insertStatement = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)")

    try {
        const result = insertStatement.run(trimmedUsername, hashedPassword);
        const lookupStatement = db.prepare("SELECT * FROM users WHERE id = ?");
        const selectedUser = lookupStatement.get(result.lastInsertRowid)

        // sign cookie
        const tokenValue = jwt.sign(
            {
                userid: selectedUser.id, 
                username: selectedUser.username
            },
            process.env.JWTSECRET,
            { expiresIn: "1d"}
        );
        
        res.cookie("flyscreenCookie", tokenValue, COOKIE_OPTIONS)
        // console.log("New cookie set for new user: ", selectedUser.username)

        res.json({ success: true, message: "Thank you for joining" });
    } catch (err) {
        console.error("Error saving user: ", err);
        return res.json({ success: false, errors: ["Could not save user"] })
    }
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
});
  
app.listen(PORT, () => {
    // console.log(`Server running at http://localhost:${PORT}`);
});