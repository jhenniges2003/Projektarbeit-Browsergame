import dbInstance from "../db.js";
import express from "express";

const router = express.Router();

/**
 * GET /api/lobbies
 */
router.get("/api/lobbies", async (req, res) => {
    try {
        const [rows] = await dbInstance.query(
            "SELECT * FROM lobbies"
        );

        const lobbies = rows.map(lobby => ({
            id: lobby.id,
            name: lobby.name,
            total_hope: lobby.total_hope,
            join_code: lobby.join_code,
            max_players: lobby.max_players,
            is_active: lobby.is_active,
            created_at: lobby.created_at
        }));

        res.json(lobbies);
    } catch (error) {
        console.error("Fehler beim Abrufen der Lobbies:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});

/**
 * GET /api/lobby/:id
 */
router.get("/api/lobby/:id", async (req, res) => {
    try {
        const lobbyId = parseInt(req.params.id);

        if (isNaN(lobbyId)) {
            return res.status(400).json({ error: "Ungültige Lobby-ID" });
        }

        const [rows] = await dbInstance.query(
            "SELECT * FROM lobbies WHERE id = ?",
            [lobbyId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Lobby nicht gefunden" });
        }

        const lobby = rows[0];

        res.json({
            id: lobby.id,
            name: lobby.name,
            total_hope: lobby.total_hope,
            join_code: lobby.join_code,
            max_players: lobby.max_players,
            is_active: lobby.is_active,
            created_at: lobby.created_at
        });
    } catch (error) {
        console.error("Fehler beim Abrufen der Lobby:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});

export default router;