const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5005;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to the node server");
});

app.post("/authentication", (req, res) => {
    console.log("POST /authentication hit with body:", req.body);

    res.json({
        success: true,
        message: "Route works!"
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
