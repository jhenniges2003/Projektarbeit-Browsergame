import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { io } from "socket.io-client";

function App() {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joinCode, setJoinCode] = useState("");
    const [inputJoinCode, setInputJoinCode] = useState("");
    const [currentLobby, setCurrentLobby] = useState(null);
    const [lobbyPlayers, setLobbyPlayers] = useState([]);
    // const [socket] = useState(() => io("http://localhost:3000"));
    const [socket] = useState(() => io("https://textadventure-game.thorben-dev.org", {
        transports: ['websocket', 'polling'],
        upgrade: true,
        reconnection: true,
        reconnectionDelay: 1000
    }));

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
        });

        socket.on("playerLeft", (data) => {
            console.log("👋 Spieler verlassen:", data);
            setCurrentLobby(null);
        });

        socket.on("error", (message) => {
            console.error("❌ Socket Error:", message);
            alert(message);
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
        console.log("Creating lobby...");
        socket.emit("createLobby", { player_name: "Meine Lobby" });
    };

    const joinLobby = () => {
        socket.emit("joinLobby", { player_name: "Spieler Name", input_join_code: inputJoinCode });
    };

    const leaveLobby = () => {
        if (currentLobby) {
            console.log("Lobby ID", currentLobby.lobby.id);
            console.log("Player ID", currentLobby.player.id);
            console.log("Join Code", currentLobby.lobby.join_code);

            socket.emit("leaveLobby", { lobbyId: currentLobby.lobby.id, playerId: currentLobby.player.id });
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (import.meta.env.VITE_ENABLE_GAME === "true") {
        return (
            <div>
                <h2>Lobby</h2>

                {!currentLobby ? (
                    <>
                        <button onClick={createLobby}>Lobby erstellen</button>

                        <div>
                            <h3>Lobby beitreten</h3>
                            <input
                                type="text"
                                placeholder="Join-Code eingeben"
                                value={inputJoinCode}
                                onChange={(e) => setInputJoinCode(e.target.value)}
                            />
                            <button onClick={joinLobby}>Beitreten</button>
                        </div>
                    </>
                ) : (
                    <div>
                        <h3>Aktuelle Lobby: {currentLobby.name}</h3>
                        <p><strong>Join-Code:</strong> {joinCode}</p>
                        <p><strong>Spieleranzahl:</strong> {currentLobby.player_count || lobbyPlayers.length}</p>
                        <button onClick={leaveLobby}>Lobby verlassen</button>
                    </div>
                )}

                <h2>Stories</h2>
                {stories.map((story) => (
                    <div key={story.id}>
                        <h2>{story.title}</h2>
                        <p>{story.description}</p>
                    </div>
                ))}
            </div>
        );
    }

    return <h2>Das Spiel ist vorübergehend nicht aktiv</h2>;
}

createRoot(document.getElementById("root")).render(<App />);
