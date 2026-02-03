import express from "express";
import path from "path";
import "./routes/decisions.js"
import "./routes/histories.js"
import "./routes/lobbies.js"
import "./routes/players.js"
import "./routes/skins.js"
import "./routes/stories.js"
import "./routes/storyNodes.js"

const app = express();
const PORT = 3000;

// Static Files (muss VOR der Catch-All-Route stehen!)
const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "dist")));
app.use("/assets", express.static(path.join(__dirname, "dist", "assets")));

app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
