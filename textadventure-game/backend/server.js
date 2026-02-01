import express from "express";
import mysql from "mysql2/promise";
import path from "path";

const app = express();
const PORT = 3000;

const db = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

app.get("/api/stories", async (req, res) => {
    try{
        const [rows] = await db.query("SELECT * FROM stories");

        console.log("dies ist output" , rows);

        const stories = rows.map(story => ({
            id: story.id,
            title: story.title,
            description: story.description,
            lobby_id: story.lobby_id,
            start_scene_id: story.start_scene_id,
        }));
        res.json(stories);
    }catch (error){
        console.error("Fehler beim Abrufen der Stories:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
})

// API-Routen zuerst
app.get("/api/story/:id", async (req, res) => {
    try {
        const storyId = parseInt(req.params.id);

        if (isNaN(storyId)) {
            return res.status(400).json({ error: "Ungültige Story-ID" });
        }

        const [rows] = await db.query(
            "SELECT * FROM stories WHERE id = ?",
            [storyId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Story nicht gefunden" });
        }

        const story = rows[0];
        res.json({
            id: story.id,
            title: story.title,
            description: story.description,
            lobby_id: story.lobby_id,
            start_scene_id: story.start_scene_id,
        });
    } catch (error) {
        console.error("Fehler beim Abrufen der Story:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});


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
