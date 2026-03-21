import { useState, useEffect } from "react";
import Alert from "../components/Alert";
import JoinLobbyDialog from "../components/JoinLobbyDialog";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import colors from "../styles/colors";

export default function Menu() {
    const navigate = useNavigate();

    const [isCreating, setIsCreating] = useState(false);

    const [name, setName] = useState("")
    const [nameTouched, setNameTouched] = useState(false)

    const [notificationOpen, setNotificationOpen] = useState(false)
    const [notifMessage, setNotifMessage] = useState("")

    const [joinOpen, setJoinOpen] = useState(false)
    const [failedJoin, setFailedJoin] = useState(false);

    const nameMissing = nameTouched && !name.trim()

    // const [socket] = useState(() => io("http://localhost:3000", {
    const [socket] = useState(() => io("https://textadventure-game.thorben-dev.org", {
        transports: ['websocket', 'polling'],
        upgrade: true,
        reconnection: true,
        reconnectionDelay: 1000
    }));

    const showError = (message) => {
        setNotifMessage(message)
        setNotificationOpen(true)
    }

    const requireNameOrNotify = () => {
        setNameTouched(true);
        if (!name.trim()) {
            showError("Bitte gib zuerst deinen Namen ein.");
            return false;
        }
        return true;
    };

    const handleJoinLobby = () => {
        if (!requireNameOrNotify()) return;
        setJoinOpen(true)
    };

    const handleCreateLobby = () => {
        if (!requireNameOrNotify()) return;
        if (isCreating) return;

        console.log("Creating lobby...");
        setIsCreating(true);

        // Warte bis Socket verbunden ist
        if (!socket.connected) {
            socket.connect();
            socket.once('connect', () => {
                console.log("Socket verbunden:", socket.id);
                socket.emit("createLobby", { player_name: name.trim() });
            });
        } else {
            console.log("Socket bereits verbunden:", socket.id);
            socket.emit("createLobby", { player_name: name.trim() });
        }

        // Warte auf Antwort vom Server
        socket.once("lobbyCreated", (result) => {
            console.log("Lobby erstellt:", result);
            navigate("/lobby", { state: { playerName: name.trim(), result: result } });
        });

        socket.once("error", (error) => {
            console.error("Fehler:", error);
            setIsCreating(false);
            showError(error.message || "Lobby konnte nicht erstellt werden");
        });
    };

    useEffect(() => {
        if (failedJoin) {
            showError("Lobby konnte nicht betreten werden. Bitte überprüfe den Code und versuche es erneut.");
        }

        socket.on('connect', () => {
            console.log('Socket verbunden:', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('Socket getrennt');
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
        };
    }, [socket, failedJoin]);


    return (
        <>
            <div
                className="min-vh-100 d-flex align-items-center justify-content-center"
                style={{ background: "linear-gradient(180deg, #4A741B 0%, #2B430F 100%)" }}
            >
                <div className="text-center">
                    <div className="mb-5" style={{ fontSize: 60, fontWeight: 600, color: "white" }}>
                        The Written Path
                    </div>

                    <div className="card shadow-sm mx-auto" style={{ width: 360 }}>
                    <div className="card-body">
                        <div className="mb-3">
                        <input
                            className={`form-control ${nameMissing ? "is-invalid" : ""}`}
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={() => setNameTouched(true)}
                        />
                        {nameMissing ? (
                            <div className="invalid-feedback">Name ist erforderlich.</div>
                        ) : (
                            <div className="form-text">&nbsp;</div>
                        )}
                        </div>

                        <div className="d-grid gap-2">
                        <button type="button" className="btn btn-outline-primary" onClick={handleJoinLobby} style={{color: colors.primary, borderColor: colors.primary}}>
                            LOBBY BEITRETEN
                        </button>

                        <JoinLobbyDialog open={joinOpen} close={() => setJoinOpen(false)} playerName={name.trim()} failedJoin={failedJoin} />

                        <button type="button" className="btn btn-outline-primary" onClick={handleCreateLobby} style={{color: colors.primary, borderColor: colors.primary}}>
                            LOBBY ERSTELLEN
                        </button>
                        </div>
                    </div>
                </div>
                
            </div>  
            </div>

            <Alert
                open={notificationOpen}
                onClose={() => setNotificationOpen(false)}
                title="Meldung"
                message={notifMessage}
                severity="danger"

            />
        </>
    )
}