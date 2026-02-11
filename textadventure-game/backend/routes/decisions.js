import dbInstance from "../db.js";
import express from "express";

const router = express.Router();

/**
 * GET /api/decision/:id
 */
router.get("/api/decision/:id", async (req, res) => {
    try {
        const decisionId = parseInt(req.params.id);

        if (isNaN(decisionId)) {
            return res.status(400).json({ error: "Ungültige Decision-ID" });
        }

        const [rows] = await dbInstance.query(
            "SELECT * FROM decisions WHERE id = ?",
            [decisionId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Decision nicht gefunden" });
        }

        //  Komplettes Objekt zurückgeben
        res.json(rows[0]);

    } catch (error) {
        console.error("Fehler beim Abrufen der Decision:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});

/**
 * GET /api/decisions/node/:nodeId
 * Gibt alle Decisions für einen bestimmten Story-Node zurück
 */
router.get("/api/decisions/node/:nodeId", async (req, res) => {
    try {
        const nodeId = parseInt(req.params.nodeId);

        if (isNaN(nodeId)) {
            return res.status(400).json({ error: "Ungültige Node-ID" });
        }

        const [rows] = await dbInstance.query(
            "SELECT * FROM decisions WHERE coming_from = ?",
            [nodeId]
        );

        res.json(rows);

    } catch (error) {
        console.error("Fehler beim Abrufen der Decisions:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});


export default router;
