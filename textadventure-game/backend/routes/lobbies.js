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


/**
 * POST /api/lobby
 */
router.post("/api/lobby", async (req, res) => {
    try {
        const { name, max_players } = req.body;
        
        if (!name || !max_players) {
            return res.status(400).json({ error: "Fehlende Daten" });
        }
        
        const join_code = Math.floor(10000 + Math.random() * 90000);


        const [result] = await dbInstance.query(
            `INSERT INTO lobbies (name, max_players, join_code)
            VALUES (?, ?, ?)`,
            [name, max_players, join_code]
        );

        const [rows] = await dbInstance.query(
            "SELECT * FROM lobbies WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error("Lobby erstellen fehlgeschlagen:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});

/**
 * POST /api/lobby/join
*/
router.post("/api/lobby/join", async (req, res) => {
    try {
        const { player_name, join_code, skin_id } = req.body;
        
        if (!player_name || !join_code) {
            return res.status(400).json({ error: "Fehlende Daten" });
        }
        
        const [lobbyRows] = await dbInstance.query(
            "SELECT * FROM lobbies WHERE join_code = ? AND is_active = TRUE",
            [join_code]
        );
        
        if (lobbyRows.length === 0) {
            return res.status(404).json({ error: "Lobby nicht gefunden" });
        }

        const lobby = lobbyRows[0];

        const [countRows] = await dbInstance.query(
            "SELECT COUNT(*) AS count FROM players WHERE lobby_id = ?",
            [lobby.id]
        );

        if (countRows[0].count >= lobby.max_players) {
            return res.status(403).json({ error: "Lobby voll" });
        }
        
        const [result] = await dbInstance.query(
            `INSERT INTO players (name, lobby_id, skin_id)
             VALUES (?, ?, ?)`,
            [player_name, lobby.id, skin_id || null]
        );

        const [playerRows] = await dbInstance.query(
            "SELECT * FROM players WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json({
            lobby,
            player: playerRows[0]
        });
    } catch (error) {
        console.error("Lobby join fehlgeschlagen:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});

export default router;