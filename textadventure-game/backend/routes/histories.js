import db from "../db";
import expressApp from "../app";

/**
 * GET /api/histories
 */
expressApp.app.get("/api/histories", async (req, res) => {
    try {
        const [rows] = await db.dbInstance.query(
            "SELECT * FROM histories"
        );

        const histories = rows.map(history => ({
            id: history.id,
            lobby_id: history.lobby_id,
            created_at: history.created_at
        }));

        res.json(histories);
    } catch (error) {
        console.error("Fehler beim Abrufen der Histories:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});

/**
 * GET /api/history/:id
 */
expressApp.app.get("/api/history/:id", async (req, res) => {
    try {
        const historyId = parseInt(req.params.id);

        if (isNaN(historyId)) {
            return res.status(400).json({ error: "Ungültige History-ID" });
        }

        const [rows] = await db.dbInstance.query(
            "SELECT * FROM histories WHERE id = ?",
            [historyId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "History nicht gefunden" });
        }

        const history = rows[0];

        res.json({
            id: history.id,
            lobby_id: history.lobby_id,
            created_at: history.created_at
        });
    } catch (error) {
        console.error("Fehler beim Abrufen der History:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});

/**
 * GET /api/lobby/:lobbyId/histories
 */
expressApp.app.get("/api/lobby/:lobbyId/histories", async (req, res) => {
    try {
        const lobbyId = parseInt(req.params.lobbyId);

        if (isNaN(lobbyId)) {
            return res.status(400).json({ error: "Ungültige Lobby-ID" });
        }

        const [rows] = await db.dbInstance.query(
            "SELECT * FROM histories WHERE lobby_id = ?",
            [lobbyId]
        );

        const histories = rows.map(history => ({
            id: history.id,
            lobby_id: history.lobby_id,
            created_at: history.created_at
        }));

        res.json(histories);
    } catch (error) {
        console.error("Fehler beim Abrufen der Lobby-Histories:", error);
        res.status(500).json({ error: "Serverfehler" });
    }
});
