const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json())

app.get("/", (req, res) => {
    res.send("ack!")
})

app.get("/api/authentication", (req, res) => {
    const { username, password } = req.body;
})

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`)
});