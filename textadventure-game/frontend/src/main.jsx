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
    const [socket] = useState(() => io("http://localhost:3000"));

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

    const loadLobbyInfo = async (code) => {
        try {
            const res = await fetch(`/api/lobbies/${code}`);
            if (res.ok) {
                const lobbyData = await res.json();
                setCurrentLobby(lobbyData);
            }
        } catch (error) {
            console.error("Failed to load lobby info:", error);
        }
    };

    useEffect(() => {
        loadStories();

        socket.on("lobbyCreated", (data) => {
            console.log("Lobby erstellt:", data);
            setJoinCode(data.joinCode);
            loadLobbyInfo(data.joinCode);
        });

        socket.on("lobbyJoined", (data) => {
            console.log("Lobby beigetreten:", data);
            setCurrentLobby(data.lobby);
            if (data.lobby.join_code) {
                setJoinCode(data.lobby.join_code);
            }
        });

        socket.on("playerJoined", (data) => {
            console.log("Spieler beigetreten:", data);
            setLobbyPlayers(prev => [...prev, data.playerId]);
            if (joinCode) {
                loadLobbyInfo(joinCode);
            }
        });

        socket.on("playerLeft", (data) => {
            console.log("Spieler verlassen:", data);
            setLobbyPlayers(prev => prev.filter(id => id !== data.playerId));
            if (joinCode) {
                loadLobbyInfo(joinCode);
            }
        });

        socket.on("error", (message) => {
            alert(message);
        });

        return () => {
            socket.off("lobbyCreated");
            socket.off("lobbyJoined");
            socket.off("playerJoined");
            socket.off("playerLeft");
            socket.off("error");
        };
    }, [socket, joinCode]);

    const createLobby = () => {
        socket.emit("createLobby", { player_name: "Meine Lobby" });
    };

    const joinLobby = () => {
        socket.emit("joinLobby", inputJoinCode);
    };

    const leaveLobby = () => {
        if (currentLobby) {
            socket.emit("leaveLobby", currentLobby.id);
            setCurrentLobby(null);
            setJoinCode("");
            setLobbyPlayers([]);
            setInputJoinCode("");
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
                        <button onClick={createLobby("test")}>Lobby erstellen</button>

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
