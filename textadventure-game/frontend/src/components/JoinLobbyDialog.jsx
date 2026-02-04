import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

export default function JoinLobbyDialog({open, close, playerName, failedJoin = false}){
    const navigate = useNavigate();
    const [lobbyCode, setLobbyCode] = useState("");
    const inputRef = useRef(null);
    const [socket] = useState(() => io("https://textadventure-game.thorben-dev.org", {
        transports: ['websocket', 'polling'],
        upgrade: true,
        reconnection: true,
        reconnectionDelay: 1000
    }));

    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        if (open) {
            setLobbyCode("");
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [socket, open]);

    if (!open) return null;

    const handleBackdropMouseDown = (event) => {
        if (event.target === event.currentTarget) close?.();
    };

    const handleJoin = () => {
        if (isJoining || !lobbyCode.trim()) {
            failedJoin = true;
        } // Verhindere Mehrfachanfragen
        console.log("Joining lobby...");
        setIsJoining(true);

        failedJoin = false;

        socket.emit("joinLobby", { player_name: playerName, input_join_code: lobbyCode });
        socket.on("lobbyJoined", (data) => {
            console.log("✅ Lobby beigetreten:", data);
            navigate("/lobby", { state: { playerName, result: data} });
        });


        close?.()
    }

    return (
        <div
            onMouseDown={handleBackdropMouseDown}
            style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
            zIndex: 1050,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            }}
        >
            <div
            onMouseDown={(e) => e.stopPropagation()}
            className="bg-white shadow"
            style={{
                width: 400,
                borderRadius: 8,
                border: "2px solid #999",
                padding: 24,
            }}
            >
                <div className="mb-3">
                    <input
                    ref={inputRef}
                    className="form-control"
                    placeholder="Lobbycode"
                    value={lobbyCode}
                    onChange={(e) => setLobbyCode(e.target.value)}
                    style={{
                        height: 45,
                        fontSize: 23,
                        border: "2px solid #999",
                        borderRadius: 8,
                    }}
                    />
                </div>

                <button
                    type="button"
                    className="btn btn-outline-primary w-100"
                    onClick={handleJoin}
                    style={{
                    height: 45,
                    fontSize: 23,
                    letterSpacing: 1,
                    borderWidth: 2,
                    }}
                >
                    LOBBY BEITRETEN
                </button>
            </div>
        </div>
    );
}