import PlayerList from "./LobbyPlayerList";
import colors from "../styles/colors";

export default function Sidebar({
    width = 320,
    lobbyCode,
    players = [],
    onLeave,
    leaveLabel = "VERLASSEN",
    variant = "white",
    tooltipText = null,
    tooltipPlacement = "top"
}) {
    const isOpaque = variant === "opaque";
    const hasTooltip = typeof tooltipText === "string" && tooltipText.trim().length > 0;

    return (
        <aside
            className="border rounded shadow-sm p-3 d-flex flex-column"
            style={{
                width,
                minWidth: width,
                backgroundColor: isOpaque
                    ? "rgba(255, 255, 255, 0.10)"
                    : "#ffffff",
                color: isOpaque ? "#f1f1f1" : "#000",
                backdropFilter: isOpaque ? "blur(2px)" : "none",
            }}
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
                    style={{
                        backgroundColor: colors.danger,
                        color: "white"
                    }}
                    {...(hasTooltip
                        ? {
                            "data-bs-toggle": "tooltip",
                            "data-bs-placement": tooltipPlacement,
                            title: tooltipText,
                        }
                        : {}
                    )}
            >
                {leaveLabel}
            </button>
        </aside>
    );
}