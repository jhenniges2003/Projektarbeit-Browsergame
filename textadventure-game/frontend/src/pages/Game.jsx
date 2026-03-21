import { useMemo, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import Sidebar from "../components/Sidebar";
import GameTimer from "../components/GameTimer";
import GameDice from "../components/GameDice";
import GameButtonGrid from "../components/GameButtonGrid";

export default function Game() {
    const navigate = useNavigate();
    const location = useLocation();

    // Lade Daten aus Location State
    const story = location.state?.story;
    const lobbyId = location.state?.lobbyId;
    const [currentNode, setCurrentNode] = useState(location.state?.currentNode);
    const [decisions, setDecisions] = useState(location.state?.decisions || []);
    const currentPlayerId = location.state?.currentPlayerId; // ID des aktuellen Spielers

    // useRef für decisions, um Stale Closure in Socket-Listenern zu vermeiden
    const decisionsRef = useRef(decisions);
    useEffect(() => {
        decisionsRef.current = decisions;
    }, [decisions]);

    const players = useMemo(() => {
        const fromState = location.state?.players;

        if (Array.isArray(fromState) && fromState.length) {
            console.log("🎮 Spieler geladen:", fromState);
            console.log("🎨 Skin-Daten:", fromState.map(p => ({ id: p.id, name: p.name, skin_image: p.skin_image })));
            return fromState;
        }

        return [
            { name: "Benutzer 1", characterName: "Magier", image: "https://placecats.com/300/300" },
            { name: "Benutzer 2", characterName: "Kämpfer", image: "https://placecats.com/301/300" },
            { name: "Benutzer 3", characterName: "Heiler", image: "https://placecats.com/302/300" },
            { name: "Benutzer 4", characterName: "Dieb", image: "https://placecats.com/303/300" },
        ];
    }, [location.state]);

    const playerCount = players.length;

    // Socket-Verbindung
    // const [socket] = useState(() => io("http://localhost:3000", {
    const [socket] = useState(() => io("https://textadventure-game.thorben-dev.org", {
        transports: ['websocket', 'polling'],
        upgrade: true,
        reconnection: true,
        reconnectionDelay: 1000
    }));

    const [storyText, setStoryText] = useState(currentNode?.content || "");

    const [votes, setVotes] = useState({}); // playerId -> decisionIndex
    const [votedPlayerIds, setVotedPlayerIds] = useState([]); // Array der Spieler-IDs, die bereits abgestimmt haben
    const [hasVoted, setHasVoted] = useState(false); // Hat der aktuelle Spieler schon abgestimmt?
    const [roundLocked, setRoundLocked] = useState(false);

    const [showDice, setShowDice] = useState(false);
    const [timerKey, setTimerKey] = useState(0);

    const everyoneVoted = votedPlayerIds.length >= playerCount;

    // Aktualisiere Story-Text wenn sich der Node ändert
    useEffect(() => {
        if (currentNode) {
            console.log("📖 Story-Node aktualisiert:", currentNode);
            console.log("📝 Neuer Titel:", currentNode.title);
            console.log("📄 Neuer Content:", currentNode.content);
            setStoryText(currentNode.content);
        }
    }, [currentNode]);

    // Socket dem Lobby-Room beitreten
    useEffect(() => {
        if (lobbyId && socket.connected) {
            socket.emit("joinRoom", { lobbyId });
        } else if (lobbyId) {
            socket.once("connect", () => {
                socket.emit("joinRoom", { lobbyId });
            });
        }

        // Socket-Listener für Voting-Updates
        socket.on("voteUpdate", (data) => {
            console.log("📊 Vote-Update empfangen:", data);
            setVotes(data.votes);
            setVotedPlayerIds(data.votedPlayerIds);
        });

        socket.on("votingComplete", async (data) => {
            console.log("✅ Abstimmung abgeschlossen:", data);
            setRoundLocked(true);

            // Verwende decisionsRef.current für aktuellen Wert
            const currentDecisions = decisionsRef.current;

            // Zeige die gewählte Decision
            if (currentDecisions[data.winnerIndex]) {
                const selectedDecision = currentDecisions[data.winnerIndex];
                setStoryText(`Entscheidung: ${selectedDecision.content}`);

                setTimeout(async () => {
                    // Lade den nächsten Node
                    await loadNextNode(selectedDecision.id);
                    resetForNextScene();
                }, 2000);
            }
        });

        socket.on("error", (data) => {
            console.error("❌ Socket Error:", data);
            alert(data.message || "Ein Fehler ist aufgetreten");
            socket.disconnect();
            navigate("/menu");
        });

        return () => {
            socket.off("voteUpdate");
            socket.off("votingComplete");
            socket.off("error");
            socket.disconnect();
        };
    }, [socket, lobbyId]); // decisions entfernt aus Dependencies!

    const voteAvatars = useMemo(() => {
        console.log("🗳️ Berechne voteAvatars mit votes:", votes);
        console.log("👥 Verfügbare Spieler:", players.map(p => ({ id: p.id, skin_image: p.skin_image })));

        const buckets = Array(decisions.length).fill(null).map(() => []);
        Object.entries(votes).forEach(([playerId, decisionIndex]) => {
            const player = players.find(p => p.id === Number(playerId));
            console.log(`🔍 Suche Spieler mit ID ${playerId}:`, player);
            const image = player?.skin_image;
            console.log(`🖼️ Skin-Image für Spieler ${playerId}:`, image);
            if (image && buckets[decisionIndex]) {
                buckets[decisionIndex].push(image);
            }
        });
        console.log("📦 Finale voteAvatars buckets:", buckets);
        return buckets;
    }, [votes, players, decisions]);

    const computeWinnerIndex = (voteObject) => {
        const counts = Array(decisions.length).fill(0);
        Object.values(voteObject).forEach((index) => {
            if (index >= 0 && index < decisions.length) counts[index] += 1;
        });

        let winner = 0;
        for (let i = 1; i < decisions.length; i++) {
            if (counts[i] > counts[winner]) winner = i;
        }
        return winner;
    };

    const loadNextNode = async (decisionId) => {
        try {
            console.log("🔄 Lade nächsten Node für Decision ID:", decisionId);

            // Lade Decision um going_to zu bekommen
            const decisionResponse = await fetch(`/api/decision/${decisionId}`);
            const decision = await decisionResponse.json();

            console.log("📋 Decision geladen:", decision);

            if (!decision.going_to) {
                console.warn("Keine going_to Node gefunden, Spiel könnte zu Ende sein");
                setStoryText("Das Spiel ist zu Ende.");
                return;
            }

            console.log("➡️ Nächster Node ID:", decision.going_to);

            // Lade den nächsten Story-Node
            const nodeResponse = await fetch(`/api/story_nodes/${decision.going_to}`);
            const nextNode = await nodeResponse.json();

            console.log("✅ Nächster Story-Node geladen:", nextNode);

            // Lade die Decisions für den nächsten Node
            const decisionsResponse = await fetch(`/api/decisions/node/${decision.going_to}`);
            const nextDecisions = await decisionsResponse.json();

            console.log("🎲 Decisions für nächsten Node geladen:", nextDecisions);

            // Nächste Array Leer?
            if (nextDecisions.length < 1) {
                console.error("Es konnten keine Decisions geladen werden.");
                setStoryText("Fehler: Es konnten keine Entscheidungen für den nächsten Schritt geladen werden.");

                setTimeout(function(){
                    socket.emit("error", { lobbyId, message: "Es konnten keine Entscheidungen für den nächsten Schritt geladen werden. Das Spiel kann nicht fortgesetzt werden." });
                    console.log("🔌 Socket-Connection wird getrennt.");
                }, 5000);

                return;
            } else {
                setCurrentNode(nextNode);
                setDecisions(nextDecisions);
            }

        } catch (error) {
            console.error("Fehler beim Laden des nächsten Nodes:", error);
        }
    };

    const resetForNextScene = () => {
        setVotes({});
        setVotedPlayerIds([]);
        setHasVoted(false);
        setRoundLocked(false);
        setShowDice(false);
        setTimerKey((key) => key + 1);

        // Sende Reset-Event an Server
        if (lobbyId) {
            socket.emit("resetVoting", { lobbyId });
        }
    }

    const finishRoundWithWinner = (winnerIndex) => {
        setRoundLocked(true);

        if (decisions[winnerIndex]) {
            const selectedDecision = decisions[winnerIndex];

            // Zeige zunächst die gewählte Entscheidung
            setStoryText(`Entscheidung: ${selectedDecision.content}`);

            setTimeout(async () => {
                // Lade den nächsten Node basierend auf der gewählten Decision
                await loadNextNode(selectedDecision.id);
                resetForNextScene();
            }, 2000);
        }
    };

    const handleLocalVote = (_, optionIndex) => {
        if (roundLocked || showDice || hasVoted) return;

        console.log(`Spieler ${currentPlayerId} stimmt für Option ${optionIndex}`);

        // Markiere als abgestimmt
        setHasVoted(true);

        // Sende Vote an Server
        socket.emit("playerVote", {
            lobbyId: lobbyId,
            playerId: currentPlayerId,
            decisionIndex: optionIndex,
            playerCount: playerCount
        });
    };

    const handleTimerFinish = () => {
        if (roundLocked) return;
        if (everyoneVoted) return;
        setShowDice(true);
    }

    const handleDiceFinish = (result) => {
        const winnerIndex = Math.max(1, Math.min(decisions.length, result)) - 1;
        finishRoundWithWinner(winnerIndex);
    }

    return (
        <div className="container-fluid bg-light py-3"
             style={{ 
                minHeight: "100vh", 
                backgroundImage: `url(${new URL("../assets/images/background.png", import.meta.url).href})`
            }}
        >
            <div className="d-flex gap-3"
                 style={{
                    height: "calc(100vh - 2rem)",
                    maxWidth: 1400,
                    margin: "0 auto",
                 }}
            >
                <Sidebar
                    lobbyCode={null}
                    players={players}
                    onLeave={() => navigate("/")}
                    variant="opaque"
                    tooltipText="Nach dem Verlassen ist die Rückkehr in diese Lobby nicht mehr möglich."
                    tooltipPlacement="top"
                />

                <main className="border rounded shadow-sm p-3 d-flex flex-column flex-grow-1"
                      style={{
                        background: "rgba(255, 255, 255, 0.10)",
                        backdropFilter: "blur(2px)",
                      }}
                >
                    <section className="border rounded p-3 mb-3" 
                             style={{ 
                                flex: 1, 
                                overflow: "auto",
                                background: "rgba(30, 30, 30, 0.75)",
                                color: "#f1f1f1",
                                backdropFilter: "blur(6px)",
                            }} 
                    >
                        <div className="fw-semibold mb-2">{currentNode?.title || "Story"}</div>
                        <div style={{ whiteSpace: "pre-wrap" }}>{storyText}</div>
                    </section>

                    <section className="border rounded p-3 mb-3"
                             style={{
                                background: "rgba(30, 30, 30, 0.75)",
                                color: "#f1f1f1",
                                backdropFilter: "blur(6px)",
                             }}         
                    >
                        {!everyoneVoted && !showDice ? (
                            <>
                            <div className="fw-semibold mb-3">Zeit zum Abstimmen</div>
                            <GameTimer 
                                key={timerKey}
                                seconds={20}
                                onFinish={handleTimerFinish}
                            />
                            </>
                        ) : (
                            <>
                                <div style={{color: "white"}}>
                                    {roundLocked ? "Entscheidung wird angewendet..." : ""}
                                </div>
                            </>
                        )}
                    </section>

                    {showDice && !roundLocked && (
                        <section className="border rounded p-3 mb-3 d-flex align-items-center justify-content-between"
                                 style={{
                                    background: "rgba(30, 30, 30, 0.75)",
                                    color: "#f1f1f1",
                                    backdropFilter: "blur(6px)",
                                }}
                        >
                            <div>
                                <div className="small" style={{color: "white"}}>Timer abgelaufen - Euer Schicksal entscheidet.</div>
                            </div>

                            <GameDice max={decisions.length} onFinish={handleDiceFinish} />
                        </section>
                    )}

                    <section className="border rounded p-3"
                             style={{
                                background: "rgba(30, 30, 30, 0.75)",
                                color: "#f1f1f1",
                                backdropFilter: "blur(6px)",
                             }}
                    >
                        <GameButtonGrid 
                            options={decisions.map(d => d.content)}
                            onSelect={handleLocalVote}
                            voteAvatars={voteAvatars}
                            disabled={roundLocked || showDice || hasVoted}
                        />
                        {hasVoted && !roundLocked && (
                            <div className="text-center mt-3" style={{ color: "white" }}>
                                ✓ Deine Stimme wurde abgegeben. Warten auf andere Spieler...
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    )
}