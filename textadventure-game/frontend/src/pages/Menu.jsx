import { useState } from "react";
import Alert from "../components/Alert";
import JoinLobbyDialog from "../components/JoinLobbyDialog";
import { useNavigate } from "react-router-dom";

export default function Menu() {
    const navigate = useNavigate();

    const [name, setName] = useState("")
    const [nameTouched, setNameTouched] = useState(false)

    const [notificationOpen, setNotificationOpen] = useState(false)
    const [notifMessage, setNotifMessage] = useState("")

    const [joinOpen, setJoinOpen] = useState(false)

    const nameMissing = nameTouched && !name.trim()

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
        navigate("/lobby", { state: {playerName: name.trim() } });
        // TODO: Lobby erstellen 
    };

    return (
        <>
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="text-center">
                    <div className="mb-5" style={{ fontSize: 60, fontWeight: 600 }}>
                        Spieltitel
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
                        <button type="button" className="btn btn-outline-primary" onClick={handleJoinLobby}>
                            LOBBY BEITRETEN
                        </button>

                        <JoinLobbyDialog open={joinOpen} close={() => setJoinOpen(false)} playerName={name.trim()}/>

                        <button type="button" className="btn btn-outline-primary" onClick={handleCreateLobby}>
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