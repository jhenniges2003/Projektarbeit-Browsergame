import dbInstance from "../db.js";
import express from "express";

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

        const [rows] = await dbInstance.query(
            "SELECT * FROM lobbies WHERE id = ?",
            [lobbyId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Lobby nicht gefunden" });
        }

        const lobby = rows[0];

        res.json(lobby);
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
        const { player_name, max_players } = req.body;
        
        if (!player_name || !max_players) {
            return res.status(400).json({ error: "Fehlende Daten" });
        }

        const join_code = Math.random().toString(36).substring(2, 7).toUpperCase();

        const lobbyName = `Lobby von ${player_name}`;

        // 1. Lobby erstellen
        const [lobbyResult] = await dbInstance.query(
            `INSERT INTO lobbies (name, max_players, join_code)
             VALUES (?, ?, ?)`,
            [lobbyName, max_players, join_code]
        );

        const lobbyId = lobbyResult.insertId;

        // 2. Player erstellen
        const [playerResult] = await dbInstance.query(
            `INSERT INTO players (name, lobby_id, is_alive)
             VALUES (?, ?, TRUE)`,
            [player_name, lobbyId]
        );

        const playerId = playerResult.insertId;

        // 3. Vollständige Objekte laden
        const [lobbyRows] = await dbInstance.query(
            "SELECT * FROM lobbies WHERE id = ?",
            [lobbyId]
        );

        const [playerRows] = await dbInstance.query(
            "SELECT * FROM players WHERE id = ?",
            [playerId]
        );

        res.status(201).json({
            lobby: lobbyRows[0],
            player: playerRows[0]
        });

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
            `INSERT INTO players (name, lobby_id)
             VALUES (?, ?)`,
            [player_name, lobby.id || null]
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

/**
 * POST /api/lobby/leave/:lobbyId
*/
router.post("/api/lobby/leave/:lobbyId", async (req, res) => {
 try {

    const { lobbyId} = req.body;

            await dbInstance.query(
                "DELETE FROM players WHERE lobby_id = ?",
                [lobbyId]
            );
// TODO: app.js
            socket.leave(lobbyId);
            io.to(lobbyId).emit("playerLeft", { playerId: socket.id });

            // Prüfen, ob Lobby leer ist
            const [players] = await dbInstance.query(
                "SELECT COUNT(*) as count FROM players WHERE lobby_id = ?",
                [lobbyId]
            );

            if (players[0].count === 0) {
                await dbInstance.query(
                    "UPDATE lobbies SET is_active = FALSE WHERE id = ?",
                    [lobbyId]
                );
            }
        } catch (error) {
            console.error("Fehler beim Verlassen der Lobby:", error);
        }
         });

export default router;