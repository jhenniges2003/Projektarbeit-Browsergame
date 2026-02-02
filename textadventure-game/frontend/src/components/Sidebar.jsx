import PlayerList from "./LobbyPlayerList";

export default function Sidebar({
    width = 320,
    lobbyCode,
    players = [],
    onLeave,
    leaveLabel = "VERLASSEN"
}) {
    return (
        <aside
            className="bg-white border rounded shadow-sm p-3 d-flex flex-column"
            style={{ width, minWidth: width }}
        >
            {/* Optional lobby code field for reusability */}
            {lobbyCode ? (
                <div className="mb-3">
                    <div className="text-muted" style={{ fontSize: 12 }}>
                        Lobby Code
                    </div>
                    <div className="border rounded px-3 py-2 fw-semibold" 
                         style={{ letterSpacing: 1 }}
                    >
                        {lobbyCode}
                    </div>
                </div>
            ) : null}

            {/*player list*/}
            <div className="flex-grow-1 overflow-auto">
                <PlayerList players={players}/>
            </div>

            {/*leave button*/}
            <button type="button"
                    className="btn btn-outline-danger mt-3"
                    onClick={onLeave}
            >
                {leaveLabel}
            </button>
        </aside>
    );
}