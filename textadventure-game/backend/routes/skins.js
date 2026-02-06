import dbInstance from "../db.js";
import express from "express";

const router = express.Router();

/**
 * GET /api/skins
 */
router.get("/api/skins", async (req, res) => {
    try {
        const [rows] = await dbInstance.query(
            "SELECT * FROM skins"
        );

        const skins = rows.map(skin => ({
            id: skin.id,
            name: skin.name,
            personality: skin.personality,
            description: skin.description,
            resource_path: skin.resource_path,
            created_at: skin.created_at,
            updated_at: skin.updated_at
        }));

        res.json(skins);
    } catch (error) {
        console.error("Fehler beim Abrufen der Skins:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});

/**
 * GET /api/skin/:id
 */
router.get("/api/skin/:id", async (req, res) => {
    try {
        const skinId = parseInt(req.params.id);

        if (isNaN(skinId)) {
            return res.status(400).json({ error: "Ungültige Skin-ID" });
        }

        const [rows] = await dbInstance.query(
            "SELECT * FROM skins WHERE id = ?",
            [skinId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Skin nicht gefunden" });
        }

        const skin = rows[0];

        res.json(skin);
    } catch (error) {
        console.error("Fehler beim Abrufen des Skins:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});

export default router;
