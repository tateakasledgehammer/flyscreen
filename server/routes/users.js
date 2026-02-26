const express = require("express");
const router = express.Router();
const { db } = require("../db.js");

const requireProjectAccess = require("../middleware/projectAuth.js");

/* middleware */
function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    next();
}

router.get(
    "/users/by-username/:username",
    requireAuth,
    (req, res) => {
    const { username } = req.params;

    try {
        const user = db.prepare(`
            SELECT id, username
            FROM users
            WHERE username = ?
        `).get(username);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

    } catch (err) {
        console.error("Lookup failed:", err);
        return res.status(500).json({ error: "Failed to look up user" });
    }
});

module.exports = router;