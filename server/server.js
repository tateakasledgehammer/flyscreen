const express = require("express");
const cors = require("cors");

const PORT = 5000;
const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
app.use(express.json())

app.get("/", (req, res) => {
    res.json({ message: "Backend is running!" })
})

app.post("/api/authentication", (req, res) => {
    const { username, password } = req.body;

    let errors = [];

    if (typeof req.body.username !== "string") req.body.username = ""
    if (typeof req.body.password !== "string") req.body.password = ""

    req.body.username = req.body.username.trim()

    if (!req.body.username) errors.push("You must provide a username")
    if (req.body.username && req.body.username.length < 6) errors.push("Username must be more than 6 characters")
    if (req.body.username && req.body.username.length > 10) errors.push("Username must not be more than 10 characters")
    if (req.body.username && !req.body.username.match(/^[a-zA-Z0-9]+$/)) errors.push("Username can only contain letters & numbers")

    if (errors.length > 0) { return res.json({ success: false, errors }) }

    console.log("Registered user: ", req.body.username, password)
    return res.json({ success: true, message: "Thank you for signing in" })
}
)

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
});