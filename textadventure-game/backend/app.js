import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import dbInstance from "./db.js";

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});

const PORT = 3000;

const __dirname = path.resolve();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "dist")));
app.use("/assets", express.static(path.join(__dirname, "dist", "assets")));

// Routes einbinden
import decisionsRouter from "./routes/decisions.js";
import historiesRouter from "./routes/histories.js";
import lobbiesRouter from "./routes/lobbies.js";
import playersRouter from "./routes/players.js";
import skinsRouter from "./routes/skins.js";
import storiesRouter from "./routes/stories.js";
import storyNodesRouter from "./routes/storyNodes.js";

app.use(decisionsRouter);
app.use(historiesRouter);
app.use(lobbiesRouter);
app.use(playersRouter);
app.use(skinsRouter);
app.use(storiesRouter);
app.use(storyNodesRouter);

// Socket.io Lobby-Logik mit Datenbank
io.on("connection", (socket) => {
    const maxPlayers = process.env.MAX_PLAYERS;
    console.log("Maximale Player", maxPlayers);
    console.log("Spieler verbunden:", socket.id);


    socket.on("createLobby", async (lobbyData) => {
        const joinCode = Math.random().toString(36).substring(2, 7).toUpperCase();

        console.log("joinCode", joinCode);

        try {
            // In Datenbank speichern
            await dbInstance.query(
                "INSERT INTO lobbies (join_code, max_players, is_active) VALUES (?, ?, ?)",
                [joinCode, maxPlayers, true]
            );

            const lobbyId = await dbInstance.query(
                "SELECT id FROM lobbies WHERE join_code = ? AND is_active = TRUE",
                [joinCode]
            )

            //TODO: wahrscheinlich name zu etwas anderes mappen

            await dbInstance.query(
                "INSERT INTO players (lobby_id, name) VALUES (?, ?)",
                [lobbyId, socket.id]
            );

            socket.join(lobbyId);
            socket.emit("lobbyCreated", { lobbyId, joinCode });
        } catch (error) {
            console.error("Fehler beim Erstellen der Lobby:", error);
            socket.emit("error", "Lobby konnte nicht erstellt werden");
        }
    });

    socket.on("joinLobby", async (joinCode) => {
        try {
            // Lobby aus Datenbank laden
            const [lobbies] = await dbInstance.query(
                "SELECT * FROM lobbies WHERE join_code = ? AND is_active = TRUE",
                [joinCode]
            );

            if (lobbies.length === 0) {
                socket.emit("error", "Lobby nicht gefunden");
                return;
            }

            const lobby = lobbies[0];

            // Spieler zur Lobby hinzufügen
            await dbInstance.query(
                "INSERT INTO players (lobby_id, name) VALUES (?, ?)",
                [lobby.id, socket.id]
            );

            socket.join(lobby.id);
            socket.emit("lobbyJoined", { lobbyId: lobby.id, lobby });
            io.to(lobby.id).emit("playerJoined", { playerId: socket.id });
        } catch (error) {
            console.error("Fehler beim Beitreten der Lobby:", error);
            socket.emit("error", "Lobby konnte nicht beigetreten werden");
        }
    });

    socket.on("leaveLobby", async (lobbyId) => {
        try {
            await dbInstance.query(
                "DELETE FROM players WHERE lobby_id = ? AND id = ?",
                [lobbyId, socket.id]
            );

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

    socket.on("disconnect", async () => {
        console.log("Spieler getrennt:", socket.id);

        try {
            const [playerLobbies] = await dbInstance.query(
                "SELECT lobby_id FROM players WHERE name = ?",
                [socket.id]
            );

            for (const { lobby_id } of playerLobbies) {
                await dbInstance.query(
                    "DELETE FROM players WHERE lobby_id = ? AND name = ?",
                    [lobby_id, socket.id]
                );

                io.to(lobby_id).emit("playerLeft", { playerId: socket.id });

                const [players] = await dbInstance.query(
                    "SELECT COUNT(*) as count FROM players WHERE lobby_id = ?",
                    [lobby_id]
                );

                if (players[0].count === 0) {
                    await dbInstance.query(
                        "UPDATE lobbies SET is_active = FALSE WHERE id = ?",
                        [lobby_id]
                    );
                }
            }
        } catch (error) {
            console.error("Fehler beim Disconnect:", error);
        }
    });
});


app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

httpServer.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
