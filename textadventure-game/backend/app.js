import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import dbInstance from "./db.js";
import {
    createLobbyInDB,
    joinLobbyInDB,
    leaveLobbyInDB,
    setPlayerSkin,
    removePlayerSkin
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
app.use("/skins", express.static(path.join(__dirname, "dist", "assets", "skins")));

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

    socket.on("joinRoom", (data) => {
        console.log("Socket tritt Room bei:", data.lobbyId);
        socket.join(data.lobbyId);
    });

    socket.on("createLobby", async (data) => {
        try {
            console.log("Erstelle Lobby für:", data.player_name);

            const result = await createLobbyInDB(data.player_name, maxPlayers);

            // Socket tritt automatisch dem Room bei
            socket.join(result.lobby.id);
            socket.emit("lobbyCreated", result);
            console.log("Lobby erstellt:", result.lobby.id, "Join-Code:", result.lobby.join_code);
            console.log("Socket", socket.id, "ist jetzt im Room:", result.lobby.id);

        } catch (error) {
            console.error('Fehler beim Erstellen der Lobby:', error);
            socket.emit("error", { message: "Lobby konnte nicht erstellt werden 2" });
        }
    });

    socket.on("joinLobby", async (data) => {
        try {
            console.log("Spieler tritt Lobby bei:", data.player_name);

            const result = await joinLobbyInDB(data.player_name, data.input_join_code);

            console.log("Lobby" , result);
            console.log("Spieler:", result.player);

            socket.join(result.lobby.id);
            socket.emit("lobbyJoined", result);

            // Benachrichtige alle anderen Spieler in der Lobby über den neuen Spieler
            socket.to(result.lobby.id).emit("playerJoined", {
                playerCount: result.playerCount,
                newPlayer: result.player,
                players: result.players
            });

            console.log("Lobby beigetreten:", result.lobby.id);

        } catch (error) {
            console.error("Fehler beim Beitreten der Lobby:", error);
            socket.emit("error", {
                message: error.message || "Lobby konnte nicht beigetreten werden"
            });
        }
    });

    socket.on("leaveLobby", async (data) => {
        try {
            console.log("Spieler verlässt Lobby - Lobby ID:", data.lobbyId, "Player ID:", data.playerId);

            if (!data.playerId) {
                throw new Error("Player ID fehlt");
            }

            const result = await leaveLobbyInDB(data.lobbyId, data.playerId);

            socket.leave(data.lobbyId);
            socket.emit("playerLeft", result);

            // Benachrichtige alle anderen Spieler in der Lobby über den verringerten Spielercount
            socket.to(data.lobbyId).emit("playerLeft", {
                playerCount: result.lobby_players_count,
                playerId: data.playerId,
                players: result.players
            });

        } catch (error) {
            console.error("Fehler beim Verlassen der Lobby:", error);
            socket.emit("error", {
                message: error.message || "Lobby konnte nicht verlassen werden"
            });
        }
    });

    socket.on("selectSkin", async (data) => {
        try {
            console.log("Spieler wählt Skin - Lobby ID:", data.lobbyId, "Player ID:", data.playerId, "Skin ID:", data.skinId);

            if (!data.lobbyId || !data.playerId || !data.skinId) {
                throw new Error("Lobby ID, Player ID oder Skin ID fehlt");
            }

            const lobby = await setPlayerSkin(data.lobbyId, data.playerId, data.skinId);

            // Benachrichtige alle Spieler in der Lobby über die Skin-Auswahl
            io.to(data.lobbyId).emit("skinSelected", {
                playerId: data.playerId,
                skinId: data.skinId,
                players: lobby.players
            });

        } catch (error) {
            console.error("Fehler beim Auswählen des Skins:", error);
            socket.emit("error", {
                message: error.message || "Skin konnte nicht ausgewählt werden"
            });
        }
    });

    socket.on("removeSkin", async (data) => {
        try {
            console.log("Spieler entfernt Skin - Lobby ID:", data.lobbyId, "Player ID:", data.playerId);

            if (!data.lobbyId || !data.playerId) {
                throw new Error("Lobby ID oder Player ID fehlt");
            }

            const lobby = await removePlayerSkin(data.lobbyId, data.playerId);

            // Benachrichtige alle Spieler in der Lobby über die Skin-Entfernung
            io.to(data.lobbyId).emit("skinRemoved", {
                playerId: data.playerId,
                players: lobby.players
            });

        } catch (error) {
            console.error("Fehler beim Entfernen des Skins:", error);
            socket.emit("error", {
                message: error.message || "Skin konnte nicht entfernt werden"
            });
        }
    });

    socket.on("startGame", async (data) => {
        try {
            console.log("Spiel wird gestartet - Lobby ID:", data.lobbyId, "Story ID:", data.storyId);

            if (!data.lobbyId || !data.storyId) {
                throw new Error("Lobby ID oder Story ID fehlt");
            }

            // Lade Story-Details mit Start-Node
            const [storyRows] = await dbInstance.query(
                "SELECT * FROM stories WHERE id = ?",
                [data.storyId]
            );

            if (storyRows.length === 0) {
                throw new Error("Story nicht gefunden");
            }

            const story = storyRows[0];

            // Lade den ersten Story-Node
            const [nodeRows] = await dbInstance.query(
                "SELECT * FROM story_nodes WHERE id = ?",
                [story.start_story_node_id]
            );

            if (nodeRows.length === 0) {
                throw new Error("Start-Story-Node nicht gefunden");
            }

            const startNode = nodeRows[0];

            // Lade die Decisions für den Start-Node
            const [decisionRows] = await dbInstance.query(
                "SELECT * FROM decisions WHERE coming_from = ?",
                [story.start_story_node_id]
            );

            // Lade alle Spieler in der Lobby mit Skin-Informationen
            const [playersRows] = await dbInstance.query(
                `SELECT p.*, s.name as skin_name, s.resource_path as skin_image
                 FROM players p 
                 LEFT JOIN skins s ON p.skin_id = s.id 
                 WHERE p.lobby_id = ?`,
                [data.lobbyId]
            );

            // Benachrichtige alle Spieler in der Lobby über den Spielstart
            io.to(data.lobbyId).emit("gameStarted", {
                story: story,
                currentNode: startNode,
                decisions: decisionRows,
                players: playersRows
            });

            console.log("Spiel gestartet für Lobby:", data.lobbyId);

        } catch (error) {
            console.error("Fehler beim Starten des Spiels:", error);
            socket.emit("error", {
                message: error.message || "Spiel konnte nicht gestartet werden"
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
                    const result = await leaveLobbyInDB(player.lobby_id, player.id);

                    // Benachrichtige andere Spieler mit aktualisierter Spieleranzahl
                    socket.to(player.lobby_id).emit("playerLeft", {
                        playerCount: result.lobby_players_count,
                        playerId: player.id,
                        players: result.players
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