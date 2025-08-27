const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Backend is running!")
})

app.get("/api/authentication", (req, res) => {
    const { username, password } = req.body;
    res.send("Thank you");
})

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`)
});