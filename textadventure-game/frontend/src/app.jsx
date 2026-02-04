import Router from "./Routes";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";


export default function App() {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joinCode, setJoinCode] = useState("");
    const [inputJoinCode, setInputJoinCode] = useState("");
    const [currentLobby, setCurrentLobby] = useState(null);
    const [lobbyPlayers, setLobbyPlayers] = useState([]);
    const [isJoining, setIsJoining] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [socket] = useState(() => io("http://localhost:3000"));
    /* const [socket] = useState(() => io("https://textadventure-game.thorben-dev.org", {
        transports: ['websocket', 'polling'],
        upgrade: true,
        reconnection: true,
        reconnectionDelay: 1000
    })); */

    const loadStories = async () => {
        try {
            const res = await fetch(`/api/stories`);
            setStories(await res.json());
        } catch (error) {
            console.error("Failed to load stories:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (window.bootstrap) {
            const tooltipTriggerList = document.querySelectorAll(
                '[data-bs-toggle="tooltip"]'
            );

            tooltipTriggerList.forEach((element) => {
                if (!element._tooltip) {
                    element._tooltip = new window.bootstrap.Tooltip(element);
                }
            });
        }
        loadStories();

        // Connection-Status überwachen
        socket.on("connect", () => {
            console.log("✅ Socket verbunden:", socket.id);
        });

        socket.on("disconnect", () => {
            console.log("❌ Socket getrennt");
        });

        socket.on("connect_error", (error) => {
            console.error("❌ Verbindungsfehler:", error.message);
        });

        socket.on("lobbyCreated", (data) => {
            console.log("✅ Lobby erstellt:", data);
            setJoinCode(data.lobby.join_code);
            setCurrentLobby(data);
            setLobbyPlayers(1); // Host ist der erste Spieler
            setIsCreating(false);
            setErrorMessage("");
        });

        socket.on("lobbyJoined", (data) => {
            console.log("✅ Lobby beigetreten:", data);
            setJoinCode(data.lobby.join_code);
            setCurrentLobby(data);
            setLobbyPlayers(data.playerCount);
            setIsJoining(false);
            setErrorMessage("");
        });

        socket.on("playerJoined", (data) => {
            console.log("✅ Neuer Spieler beigetreten:", data);
            setLobbyPlayers(data.playerCount);
        });

        socket.on("playerLeft", (data) => {
            console.log("👋 Spieler verlassen:", data);
            if (data.playerCount !== undefined) {
                // Ein anderer Spieler hat die Lobby verlassen
                setLobbyPlayers(data.playerCount);
            } else {
                // Wir selbst haben die Lobby verlassen
                setCurrentLobby(null);
            }
        });

        socket.on("error", (data) => {
            console.error("❌ Socket Error:", data);
            setErrorMessage(data.message || "Ein Fehler ist aufgetreten");
            setIsJoining(false);
            setIsCreating(false);
        });

        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("connect_error");
            socket.off("lobbyCreated");
            socket.off("lobbyJoined");
            socket.off("playerJoined");
            socket.off("playerLeft");
            socket.off("error");
        };
    }, [socket]);

     const createLobby = () => {
        if (isCreating) return; // Verhindere Mehrfachanfragen
        console.log("Creating lobby...");
        setIsCreating(true);
        setErrorMessage("");
        socket.emit("createLobby", { player_name: "Meine Lobby" });
    };

    const joinLobby = () => {
        if (isJoining || !inputJoinCode.trim()) return; // Verhindere Mehrfachanfragen
        console.log("Joining lobby...");
        setIsJoining(true);
        setErrorMessage("");
        socket.emit("joinLobby", { player_name: "Spieler Name", input_join_code: inputJoinCode });
    };

    const leaveLobby = () => {
        if (currentLobby) {
            console.log("Lobby ID:", currentLobby.lobby.id);
            console.log("Player Object:", currentLobby.player);
            console.log("Player ID:", currentLobby.player?.id);

            if (!currentLobby.player?.id) {
                console.error("❌ Player ID ist undefined! currentLobby:", currentLobby);
                setErrorMessage("Fehler: Spieler-ID nicht gefunden");
                return;
            }

            socket.emit("leaveLobby", {
                lobbyId: currentLobby.lobby.id,
                playerId: currentLobby.player.id
            });
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (import.meta.env.VITE_ENABLE_GAME === "true") { 
        return <Router /> 
    }

    return <h2>Das Spiel ist vorübergehend nicht aktiv</h2>;
}