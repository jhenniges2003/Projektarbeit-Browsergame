import dbInstance from "../db.js";"../db.js";
import express from "express";

const router = express.Router();

/**
 * GET /api/decisions
 */
router.get("/api/decisions", async (req, res) => {
    try {
        const [rows] = await dbInstance.query(
            "SELECT * FROM decisions"
        );

        const decisions = rows.map(decision => ({
            id: decision.id,
            content: decision.content,
            hope_value: decision.hope_value,
            coming_from: decision.coming_from,
            going_to: decision.going_to,
            created_at: decision.created_at,
            updated_at: decision.updated_at
        }));

        res.json(decisions);
    } catch (error) {
        console.error("Fehler beim Abrufen der Decisions:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});

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

        const decision = rows[0];

        res.json({
            id: decision.id,
            content: decision.content,
            hope_value: decision.hope_value,
            coming_from: decision.coming_from,
            going_to: decision.going_to,
            created_at: decision.created_at,
            updated_at: decision.updated_at
        });
    } catch (error) {
        console.error("Fehler beim Abrufen der Decision:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});

export default router;
