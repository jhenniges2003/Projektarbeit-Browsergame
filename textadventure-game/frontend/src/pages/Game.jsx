import { useMemo, useState, useEffect } from "react";
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

    const players = useMemo(() => {
        const fromState = location.state?.players;

        if (Array.isArray(fromState) && fromState.length) return fromState;

        return [
            { name: "Benutzer 1", characterName: "Magier", image: "https://placecats.com/300/300" },
            { name: "Benutzer 2", characterName: "Kämpfer", image: "https://placecats.com/301/300" },
            { name: "Benutzer 3", characterName: "Heiler", image: "https://placecats.com/302/300" },
            { name: "Benutzer 4", characterName: "Dieb", image: "https://placecats.com/303/300" },
        ];
    }, [location.state]);

    const playerCount = players.length;

    // Socket-Verbindung
    const [socket] = useState(() => io("https://textadventure-game.thorben-dev.org", {
        transports: ['websocket', 'polling'],
        upgrade: true,
        reconnection: true,
        reconnectionDelay: 1000
    }));

    const [storyText, setStoryText] = useState(currentNode?.content || "");

    const [votes, setVotes] = useState({});
    const [roundLocked, setRoundLocked] = useState(false);

    const [showDice, setShowDice] = useState(false);
    const [timerKey, setTimerKey] = useState(0);

    const everyoneVoted = Object.keys(votes).length >= playerCount;

    // Aktualisiere Story-Text wenn sich der Node ändert
    useEffect(() => {
        if (currentNode) {
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

        return () => {
            socket.disconnect();
        };
    }, [socket, lobbyId]);

    const voteAvatars = useMemo(() => {
        const buckets = Array(decisions.length).fill(null).map(() => []);
        Object.entries(votes).forEach(([playerIndexStr, optionIndex]) => {
            const playerIndex = Number(playerIndexStr);
            const image = players[playerIndex]?.skin_image;
            if (image && buckets[optionIndex]) buckets[optionIndex].push(image);
        });
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
            // Lade Decision um going_to zu bekommen
            const decisionResponse = await fetch(`/api/decision/${decisionId}`);
            const decision = await decisionResponse.json();

            if (!decision.going_to) {
                console.warn("Keine going_to Node gefunden, Spiel könnte zu Ende sein");
                setStoryText("Das Spiel ist zu Ende.");
                return;
            }

            // Lade den nächsten Story-Node
            const nodeResponse = await fetch(`/api/story_nodes/${decision.going_to}`);
            const nextNode = await nodeResponse.json();

            // Lade die Decisions für den nächsten Node
            const decisionsResponse = await fetch(`/api/decisions/node/${decision.going_to}`);
            const nextDecisions = await decisionsResponse.json();

            setCurrentNode(nextNode);
            setDecisions(nextDecisions);
        } catch (error) {
            console.error("Fehler beim Laden des nächsten Nodes:", error);
        }
    };

    const resetForNextScene = () => {
        setVotes({});
        setRoundLocked(false);
        setShowDice(false);
        setTimerKey((key) => key + 1);
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
        if (roundLocked || showDice) return;

        setVotes((previous) => {
            if(previous[0] !== undefined) return previous;
            return {...previous, 0: optionIndex};
        });

        setTimeout(() => {
            setVotes((previous) => {
                const next = {...previous};
                for (let i = 1; i < playerCount; i++) {
                    if (next[i] === undefined) next[i] = Math.floor(Math.random() * decisions.length);
                }
                return next;
            });
        }, 450); 
    };

    useEffect(() => {
        if(roundLocked) return;
        if(showDice) return;
        if(!everyoneVoted) return;

        const winner = computeWinnerIndex(votes);
        finishRoundWithWinner(winner);
    }, [everyoneVoted, votes]);

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
                        <div className="fw-semibold mb-2">Story</div>
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
                            disabled={roundLocked || showDice }
                        />
                    </section>
                </main>
            </div>
        </div>
    )
}