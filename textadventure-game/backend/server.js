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

app.get("/api/scenes/:id", async (req, res) => {
    const sceneId = req.params.id;

    const [[scene]] = await db.query(
        "SELECT * FROM scenes WHERE id = ?",
        [sceneId]
    );

    const [choices] = await db.query(
        "SELECT text, next_scene_id FROM choices WHERE scene_id = ?",
        [sceneId]
    );

    res.json({
        id: scene.id,
        text: scene.text,
        choices: choices.map(c => ({
            text: c.text,
            next: c.next_scene_id
        }))
    });
});

// React ausliefern
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
