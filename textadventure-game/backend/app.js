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

const maxPlayers = process.env.MAX_PLAYERS;

// Socket.io Lobby-Logik mit Datenbank
io.on("connection", (socket) => {
    const domain = socket.handshake.headers.host;
    const protocol = socket.handshake.secure ? 'https' : 'http';
    const fullDomain = `${protocol}://${domain}`;

    socket.on("createLobby", async (data) => {
        try {
            const response = await fetch(`${fullDomain}/api/lobby`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    player_name: data.player_name,
                    max_players: maxPlayers
                })
            });

            if (!response.ok) {
                throw new Error('Fehler beim Erstellen der Lobby');
            }

            const lobby = await response.json();
            console.log('Lobby erstellt:', lobby);

            socket.join(lobby.id);
            socket.emit("Lobby created and joined");
            console.log("Lobby created and joined Console Log");
            return lobby;
        } catch (error) {
            console.error('Fehler:', error);
        }
    });

    socket.on("joinLobby", async (data) => {
        try {
            const response = await fetch(`${fullDomain}/api/lobby/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    player_name: data.player_name,
                    join_code: data.input_join_code,
                })
            });

            if (!response.ok) {
                throw new Error('Fehler beim Beitreten der Lobby');
            }

            const lobby = await response.json();

            console.log('Lobby:', lobby);

            socket.join(lobby.id);
            socket.emit("Lobby joined");
            console.log("Lobby joined Console Log");

            // Benachrichtige andere Spieler in der Lobby
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
