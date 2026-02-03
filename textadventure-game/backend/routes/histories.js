import dbInstance from "../db.js";
import express from "express";

const router = express.Router();

/**
 * GET /api/lobby/:lobbyId/histories
 */
router.get("/api/lobby/:lobbyId/histories", async (req, res) => {
    try {
        const lobbyId = parseInt(req.params.lobbyId);

        if (isNaN(lobbyId)) {
            return res.status(400).json({ error: "Ungültige Lobby-ID" });
        }

        const [rows] = await dbInstance.query(
            "SELECT * FROM histories WHERE lobby_id = ?",
            [lobbyId]
        );

        res.json(rows[0]);
    } catch (error) {
        console.error("Fehler beim Abrufen der Lobby-Histories:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});

export default router;