import express from "express";
import {
    createLobbyInDB,
    joinLobbyInDB,
    leaveLobbyInDB,
    getLobbyById
} from "../services/lobbyService.js";

const router = express.Router();

/**
 * GET /api/lobby/:id
 */
router.get("/api/lobby/:id", async (req, res) => {
    try {
        const lobbyId = parseInt(req.params.id);

        if (isNaN(lobbyId)) {
            return res.status(400).json({ error: "Ungültige Lobby-ID" });
        }

        const lobby = await getLobbyById(lobbyId);
        res.json(lobby);

    } catch (error) {
        if (error.message === "Lobby nicht gefunden") {
            return res.status(404).json({ error: error.message });
        }
        console.error("Fehler beim Abrufen der Lobby:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});

/**
 * POST /api/lobby
 */
router.post("/api/lobby", async (req, res) => {
    try {
        const { player_name, max_players } = req.body;

        if (!player_name || !max_players) {
            return res.status(400).json({ error: "Fehlende Daten" });
        }

        const result = await createLobbyInDB(player_name, max_players);

        res.status(201).json(result);

    } catch (error) {
        console.error("Lobby inkl. Player erstellen fehlgeschlagen:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});

/**
 * POST /api/lobby/join
 */
router.post("/api/lobby/join", async (req, res) => {
    try {
        const { player_name, join_code } = req.body;

        if (!player_name || !join_code) {
            return res.status(400).json({ error: "Fehlende Daten" });
        }

        const result = await joinLobbyInDB(player_name, join_code);

        console.log("Player joined:", result.player);

        res.status(201).json(result);

    } catch (error) {
        if (error.message === "Lobby nicht gefunden") {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === "Lobby ist voll") {
            return res.status(403).json({ error: error.message });
        }
        console.error("Lobby join fehlgeschlagen:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});

/**
 * POST /api/lobby/leave
 */
router.post("/api/lobby/leave", async (req, res) => {
    try {
        const { lobby_id, player_id } = req.body;

        if (!lobby_id || !player_id) {
            return res.status(400).json({ error: "Fehlende Daten" });
        }

        const result = await leaveLobbyInDB(lobby_id, player_id);

        res.status(200).json(result);

    } catch (error) {
        if (error.message === "Spieler nicht in dieser Lobby gefunden") {
            return res.status(404).json({ error: error.message });
        }
        console.error("Fehler beim Verlassen der Lobby:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});

export default router;