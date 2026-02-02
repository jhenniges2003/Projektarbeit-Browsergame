import db from "../db";
import expressApp from "../app";

/**
 * GET /api/players
 */
expressApp.app.get("/api/players", async (req, res) => {
    try {
        const [rows] = await db.dbInstance.query(
            "SELECT * FROM players"
        );

        const players = rows.map(player => ({
            id: player.id,
            name: player.name,
            is_alive: player.is_alive,
            lobby_id: player.lobby_id,
            skin_id: player.skin_id,
            created_at: player.created_at
        }));

        res.json(players);
    } catch (error) {
        console.error("Fehler beim Abrufen der Players:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});

/**
 * GET /api/player/:id
 */
expressApp.app.get("/api/player/:id", async (req, res) => {
    try {
        const playerId = parseInt(req.params.id);

        if (isNaN(playerId)) {
            return res.status(400).json({ error: "Ungültige Player-ID" });
        }

        const [rows] = await db.dbInstance.query(
            "SELECT * FROM players WHERE id = ?",
            [playerId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Player nicht gefunden" });
        }

        const player = rows[0];

        res.json({
            id: player.id,
            name: player.name,
            is_alive: player.is_alive,
            lobby_id: player.lobby_id,
            skin_id: player.skin_id,
            created_at: player.created_at
        });
    } catch (error) {
        console.error("Fehler beim Abrufen des Players:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});

/**
 * GET /api/lobby/:lobbyId/players
 */
expressApp.app.get("/api/lobby/:lobbyId/players", async (req, res) => {
    try {
        const lobbyId = parseInt(req.params.lobbyId);

        if (isNaN(lobbyId)) {
            return res.status(400).json({ error: "Ungültige Lobby-ID" });
        }

        const [rows] = await db.dbInstance.query(
            "SELECT * FROM players WHERE lobby_id = ?",
            [lobbyId]
        );

        const players = rows.map(player => ({
            id: player.id,
            name: player.name,
            is_alive: player.is_alive,
            lobby_id: player.lobby_id,
            skin_id: player.skin_id,
            created_at: player.created_at
        }));

        res.json(players);
    } catch (error) {
        console.error("Fehler beim Abrufen der Lobby-Players:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});
