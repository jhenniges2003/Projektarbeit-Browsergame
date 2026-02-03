import dbInstance from "../db.js";"../db.js";
import express from "express";

const router = express.Router();

/**
 * GET /api/stories
 */
router.get("/api/stories", async (req, res) => {
    try {
        const [rows] = await dbInstance.query(
            "SELECT * FROM stories"
        );

        const stories = rows.map(story => ({
            id: story.id,
            title: story.title,
            description: story.description,
            lobby_id: story.lobby_id,
            start_story_node_id: story.start_story_node_id,
            created_at: story.created_at,
            updated_at: story.updated_at
        }));

        console.log('test');

        console.log(stories);

        res.json(stories);
    } catch (error) {
        console.error("Fehler beim Abrufen der Stories:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});

/**
 * GET /api/story/:id
 */
router.get("/api/story/:id", async (req, res) => {
    try {
        const storyId = parseInt(req.params.id);

        if (isNaN(storyId)) {
            return res.status(400).json({ error: "Ungültige Story-ID" });
        }

        const [rows] = await dbInstance.query(
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
            start_story_node_id: story.start_story_node_id,
            created_at: story.created_at,
            updated_at: story.updated_at
        });
    } catch (error) {
        console.error("Fehler beim Abrufen der Story:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});

export default router;