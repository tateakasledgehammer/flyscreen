require("dotenv").config();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
// const bodyParser = require('body-parser');
// const crypto = require("crypto");

const requireProjectAccess = require("./middleware/projectAuth.js");
const criteriaRepo = require("./repos/criteriaRepo.js");

const scoringEngine = require("./utils/scoringEngine.js");
const aiScoringEngine = require("./utils/aiScoringEngine.js");
const aiScorePendingStudies = require("./utils/aiScorePendingStudies.js");

function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i+= size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

const userRoutes = require("./routes/users.js");
const projectRoutes = require("./routes/projects.js");

const tagRoutes = require("./routes/tags.js");
const filterRoutes = require("./routes/filters.js");
const criteriaRoutes = require("./routes/criteria.js");
const backgroundRoutes = require("./routes/background.js");
const reviewerRoutes = require("./routes/reviewers.js");

const screeningRoutes = require("./routes/screenings.js");
const notesRoutes = require("./routes/notes.js");
const duplicateRoutes = require("./routes/duplicates.js");
const studyDetailRoutes = require("./routes/studyDetails.js");
const uploadRoutes = require("./routes/uploads.js");

console.log("server.js loaded successfully");

const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 10,
    message: { success: false, errors: ["Too many login attempts. Try again in 10 minutes."] }
})

const app = express();
const PORT = 5005;

const {
    db,
    createStudy,
    getAllStudies,
    getStudyById,
    deleteStudy,
    insertManyStudies,
    insertEmailList
} = require("./db");
const studyScoreRepo = require("./repos/studyScoreRepo.js");

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true, // changed from false - process.env.NODE_ENV === "production",
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
    const token = req.cookies.flyscreenCookie;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const isInvalidated = db.prepare("SELECT 1 FROM invalidated_tokens WHERE token = ?").get(token);
    if (isInvalidated) return res.status(401).json({ error: "Session expired. Token invalidated" });

    try {
        const decoded = jwt.verify(token, process.env.JWTSECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
};

app.use("/api", screeningRoutes);
app.use("/api", notesRoutes);
app.use("/api", tagRoutes);
app.use("/api", filterRoutes);
app.use("/api", duplicateRoutes);
app.use("/api", studyDetailRoutes);
app.use("/api", projectRoutes);
app.use("/api", userRoutes);
app.use("/api", uploadRoutes);
app.use("/api", criteriaRoutes);
app.use("/api", backgroundRoutes);
app.use("/api", reviewerRoutes);

// denylist cleanup set
db.prepare("DELETE FROM invalidated_tokens WHERE expires_at < ?")
.run(Math.floor(Date.now() / 1000));

// Then every hour
setInterval(() => {
    db.prepare("DELETE FROM invalidated_tokens WHERE expires_at < ?")
    .run(Math.floor(Date.now() / 1000));
}, 60 * 60 * 1000); // hourly

// ---- STUDIES ----

// get all studies
app.get(
    "/api/projects/:projectId/studies", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
    try {
        const studies = db.prepare(`
            SELECT s.*, ss.score, ss.score_status, ss.explanation
            FROM studies s
            LEFT JOIN study_scores ss ON ss.study_id = s.id
            WHERE s.project_id = ?    
        `).all(projectId);

        res.json(studies);
    } catch (err) {
        console.error("Error getting all studies", err);
        res.status(500).json({ error: "Failed to get all studies"});
    }
});

app.post(
    "/api/projects/:projectId/studies/bulk", 
    requireAuth, 
    requireProjectAccess, 
    async (req, res) => {      
        console.log("/studies/bulk hit for project", req.params.projectId);

        const studies = req.body.studies;
        const projectId = Number(req.params.projectId);

        if (!Array.isArray(studies) || studies.length === 0) {
            return res.status(400).json({ error: "Studies array required" });
        }

        const dbSafeStudy = study => ({
            title: study.title,
            abstract: study.abstract,
            authors: Array.isArray(study.authors) ? study.authors.join("; ") : study.authors,
            year: Number(study.year),
            type: study.type,
            journal: study.journal,
            volume: study.volume,
            issue: study.issue,
            doi: study.doi,
            link: study.link,
            keywords: Array.isArray(study.keywords) ? study.keywords.join("; ") : study.keywords,
            language: study.language
        });

        try {
            const uploadResult = db.prepare(`
                INSERT INTO uploads (project_id, file_name)
                VALUES (?, ?)                
            `).run(projectId, req.body.fileName || "Unknown File");

            const uploadId = uploadResult.lastInsertRowid;

            const cleanStudies = studies.map(s => ({
                ...dbSafeStudy(s),
                project_id: projectId,
                upload_id: uploadId
            }));

            const insertTx = db.transaction((cleanStudies) => {
                const ids = insertManyStudies(cleanStudies);

                for (const id of ids) {
                    studyScoreRepo.upsertScore.run(
                        id,
                        projectId,
                        null,
                        null,
                        "pending"
                    );
                }

                return ids;
            });

            const insertedIds = insertTx(cleanStudies);
            console.log("Inserted study IDs:", insertedIds);

            aiScorePendingStudies(projectId);

            res.json({ 
                success: true, 
                message: `Inserted ${cleanStudies.length} studies.`,
                insertedCount: insertedIds.length
            });
            
        } catch (error) {
            console.error("Bulk insert error:", error);
            res.status(500).json({ error: "Failed to insert studies" })
        }
})

app.post(
    "/api/projects/:projectId/studies", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
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

// delete study
app.delete(
    "/api/projects/:projectId/studies/:id", 
    requireAuth, 
    requireProjectAccess,
    (req, res) => {
    try {
        deleteStudy.run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error("Error deleting study", err);
        res.status(500).json({ error: "Failed to delete" });
    }
});

// clear studies
app.delete(
    '/api/projects/:projectId/studies', 
    requireAuth, 
    requireProjectAccess,
    async (req, res) => {
    try {
        const stmt = db.prepare("DELETE FROM studies");
        stmt.run();
        res.status(200).json({ message: "All studies deleted" })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to delete studies" })
    }
});

// clear projects
app.delete(
    '/api/projects/:id', (req, res) => {
        const projectId = Number(req.params.id);

        try {
            const deleteProjectTx = db.transaction(() => {
                db.prepare("DELETE FROM screenings WHERE project_id = ?").run(projectId);
                db.prepare("DELETE FROM notes WHERE project_id = ?").run(projectId);
                db.prepare("DELETE FROM tags WHERE project_id = ?").run(projectId);
                db.prepare("DELETE FROM filter_terms WHERE project_id = ?").run(projectId);
                db.prepare("DELETE FROM study_tags WHERE project_id = ?").run(projectId);

                const sectionIds = db.prepare(`
                    SELECT id FROM criteria_sections WHERE project_id = ?
                `).all(projectId);

                sectionIds.forEach(sec => {
                    db.prepare("DELETE FROM criteria_items WHERE section_id = ?").run(sec.id);
                });

                db.prepare("DELETE FROM criteria_sections WHERE project_id = ?").run(projectId);
                db.prepare("DELETE FROM fulltext_exclusion_reasons WHERE project_id = ?").run(projectId);
                db.prepare("DELETE FROM project_background WHERE project_id = ?").run(projectId);
                db.prepare("DELETE FROM reviewer_settings WHERE project_id = ?").run(projectId);
                db.prepare("DELETE FROM study_scores WHERE id = ?").run(projectId);
                db.prepare("DELETE FROM duplicates WHERE id = ?").run(projectId);
                db.prepare("DELETE FROM uploads WHERE id = ?").run(projectId);
                db.prepare("DELETE FROM studies WHERE id = ?").run(projectId);
                db.prepare("DELETE FROM projects WHERE id = ?").run(projectId);
            });

            deleteProjectTx();

            res.json({ success: true, message: "Project deleted" });

        } catch (err) {
            console.error("Delete project failed:", err);
            res.status(500).json({ error: "Failed to delete project" });
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
            username: req.user.username,
            email: req.user.email,
            created_at: req.user.created_at
        }
    });
});

app.patch("/api/auth/update-profile", requireAuth, async (req, res) => {
    const { email } = req.body;
    const userId = req.user.userId;

    const cleanEmail = email ? email.trim().toLowerCase() : null;
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.json({ success: false, errors: ["Invalid email address"] });
    }

    try {
        db.prepare("UPDATE users SET email = ? WHERE id = ?").run(cleanEmail, userId);
        res.json({ success: true, message: "Profile updated" });
    } catch (err) {
        if (err.message.includes("UNIQUE")) {
            return res.json({ success: false, errors: ["Email already in use!"] });
        }
        res.status(500).json({ success: false, errors: ["Could not update profile"] });
    }
});

app.path("/api/auth/change-password", requireAuth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userid;

    if (!currentPassword || !newPassword) {
        return res.json({ success: false, errors: ["Both fields required"] });
    }
    if (newPassword.length < 6 || newPassword.length > 32) {
        return res.json({ success: false, errors: ["Password must be 6-32 characters"] });
    }

    const userRecord = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    const valid = await bcrypt.compare(currentPassword, userRecord.password);
    if (!valid) {
        return res.json({ success: false, errors: ["Current password is incorrect"] });
    }

    const hashed = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashed, userId);
    res.json({ success: true, message: "Password updated" });
});

app.post("/api/auth/subscribe", (req, res) => {
    const { email, organisation, source } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    try {
        insertEmailList.run({
            email,
            organisation: organisation || null,
            source: source || "landing"
        });
        res.json({ success: true });
    } catch (err) {
        if (err.message.includes("UNIQUE")) {
            return res.json({ success: true, message: "Already subscribed" });
        }
        res.status(500).json({ success: false });
    }
});

app.post("/api/auth/logout", (req, res) => {
    const token = req.cookies.flyscreenCookie;

    if (token) {
        const decoded = jwt.decode(token);
        if (decoded) {
            db.prepare("INSERT OR IGNORE INTO invalidated_tokens VALUES (?, ?)")
                .run(token, decoded.exp);    
        }
    }

    res.clearCookie("flyscreenCookie", { ...COOKIE_OPTIONS });
    res.json({ success: true, message: "Logged out." });
})

app.post("/api/auth/login", loginLimiter, async (req, res) => {
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
        errors.push("Invalid data request. Inputs are not strings");
        return;
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

    const email = req.body.email ? req.body.email.trim().toLowerCase() : null;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("Invalid email address");
    }

    if (errors.length > 0) {
        return res.json({ success: false, errors });
    }

    // saving new user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(trimmedPassword, salt)

    const insertStatement = db.prepare("INSERT INTO users (username, password, email) VALUES (?, ?, ?)")

    try {
        const result = insertStatement.run(trimmedUsername, hashedPassword, email);
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

// ERROR 
app.use((err, req, res, next) => {
    console.error("SERVER ERROR: ", err);

    if (res.headersSent) return next(err);

    res.status(500).json({ 
        success: false,
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
});

app.listen(PORT, () => {
    // console.log(`Server running at http://localhost:${PORT}`);
});