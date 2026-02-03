import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import dbInstance from "./db.js";
import {
    createLobbyInDB,
    joinLobbyInDB,
    leaveLobbyInDB
} from "./services/lobbyService.js";

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "https://textadventure-game.thorben-dev.org",
        methods: ["GET", "POST"],
        credentials: true
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

const maxPlayers = process.env.MAX_PLAYERS || 4;

// Socket.io Lobby-Logik
io.on("connection", (socket) => {
    console.log("Neuer Socket verbunden:", socket.id);

    socket.on("createLobby", async (data) => {
        try {
            console.log("Erstelle Lobby für:", data.player_name);

            const result = await createLobbyInDB(data.player_name, maxPlayers);

            socket.join(result.lobby.id);
            socket.emit("lobbyCreated", result);
            console.log("Lobby erstellt:", result.lobby.id, "Join-Code:", result.lobby.join_code);

        } catch (error) {
            console.error('Fehler beim Erstellen der Lobby:', error);
            socket.emit("error", { message: "Lobby konnte nicht erstellt werden 2" });
        }
    });

    socket.on("joinLobby", async (data) => {
        try {
            console.log("Spieler tritt Lobby bei:", data.player_name);

            const result = await joinLobbyInDB(data.player_name, data.input_join_code);

            socket.join(result.lobby.id);
            socket.emit("lobbyJoined", result);
            console.log("Lobby beigetreten:", result.lobby.id);

            // Benachrichtige andere Spieler in der Lobby
            socket.to(result.lobby.id).emit("playerJoined", {
                playerId: result.player.id,
                playerName: result.player.name
            });

        } catch (error) {
            console.error("Fehler beim Beitreten der Lobby:", error);
            socket.emit("error", {
                message: error.message || "Lobby konnte nicht beigetreten werden"
            });
        }
    });

    socket.on("leaveLobby", async (data) => {
        try {
            console.log("Spieler verlässt Lobby:", data.playerId);

            const result = await leaveLobbyInDB(data.lobbyId, data.playerId);

            socket.leave(data.lobbyId);
            socket.emit("lobbyLeft", result);

            // Benachrichtige andere Spieler
            socket.to(data.lobbyId).emit("playerLeft", { playerId: data.playerId });

        } catch (error) {
            console.error("Fehler beim Verlassen der Lobby:", error);
            socket.emit("error", {
                message: error.message || "Lobby konnte nicht verlassen werden"
            });
        }
    });

    socket.on("disconnect", async () => {
        console.log("Spieler getrennt:", socket.id);

        try {
            // Finde alle Lobbies, in denen der Spieler ist
            const [playerLobbies] = await dbInstance.query(
                "SELECT id, lobby_id FROM players WHERE name = ?",
                [socket.id]
            );

            // Entferne Spieler aus allen Lobbies
            for (const player of playerLobbies) {
                try {
                    await leaveLobbyInDB(player.lobby_id, player.id);

                    // Benachrichtige andere Spieler
                    socket.to(player.lobby_id).emit("playerLeft", {
                        playerId: player.id
                    });
                } catch (error) {
                    console.error(`Fehler beim Entfernen aus Lobby ${player.lobby_id}:`, error);
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