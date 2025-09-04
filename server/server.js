const express = require("express");
const cors = require("cors");
const { Database } = require("sqlite");
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
        return res.json({
            success: false,
            errors: ["Invalid data request"]
        })
    }

    const trimmedUsername = username.trim();
    if (!trimmedUsername) { errors.push("No username") }
    if (trimmedUsername.length < 6) { errors.push("Username must be longer than 6 characters") }
    if (trimmedUsername.length > 10) { errors.push("Username must be less than 11 characters") }
       
    if (!password) { errors.push("No password") }
    if (password.length < 6) { errors.push("Password must be longer than 6 characters") }
    if (password.length > 10) { errors.push("Password must be less than 11 characters") }

    if (errors.length > 0) {
        return res.json({
            success: false,
            errors: errors
        })
    }
    return res.json({
        success: true,
        message: "Thank you for joining"
    })
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
