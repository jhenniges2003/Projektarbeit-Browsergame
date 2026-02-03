import dbInstance from "../db.js";
import express from "express";

const router = express.Router();


/**
 * GET /api/story_nodes/:id
 */
router.get("/api/story_nodes/:id", async (req, res) => {
    try {
        const nodeId = parseInt(req.params.id);

        if (isNaN(nodeId)) {
            return res.status(400).json({ error: "Ungültige Decision-ID" });
        }

        const [rows] = await dbInstance.query(
            "SELECT * FROM story_nodes WHERE id = ?",
            [nodeId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Decision nicht gefunden" });
        }

        const node = rows[0];

        res.json(node);
    } catch (error) {
        console.error("Fehler beim Abrufen der Decision:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});

export default router;