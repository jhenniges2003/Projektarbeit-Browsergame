import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import GameTimer from "../components/GameTimer";
import GameDice from "../components/GameDice";
import GameButtonGrid from "../components/GameButtonGrid";

export default function Game() {
    const navigate = useNavigate();
    const location = useLocation();

    const players = useMemo(() => {
        const fromLobby = location.state?.players;

        if (Array.isArray(fromLobby) && fromLobby.length) return fromLobby;

        return [
            { name: "Benutzer 1", characterName: "Magier", image: "https://placecats.com/300/300" },
            { name: "Benutzer 2", characterName: "Kämpfer", image: "https://placecats.com/301/300" },
            { name: "Benutzer 3", characterName: "Heiler", image: "https://placecats.com/302/300" },
            { name: "Benutzer 4", characterName: "Dieb", image: "https://placecats.com/303/300" },
        ];
    }, [location.state]);

    const playerCount = players.length;

    const scenes = useMemo(
        () => [
            {
                id: "s1",
                text:
                "Ihr betretet einen dunklen Wald. Zwischen den Bäumen hört ihr ein Knacken. Was tut ihr?",
                options: ["Weitergehen", "Verstecken", "Rufen", "Zurücklaufen"],
                nextTextByWinnerIndex: [
                "Ihr geht weiter – und entdeckt eine alte Ruine.",
                "Ihr versteckt euch – ein Schatten zieht vorbei.",
                "Ihr ruft – eine Stimme antwortet aus der Dunkelheit.",
                "Ihr rennt zurück – doch der Weg ist plötzlich versperrt.",
                ],
            },
            {
                id: "s2",
                text:
                "Vor euch liegt ein steinernes Tor mit Runen. Es wirkt uralt – aber aktiv. Was jetzt?",
                options: ["Anfassen", "Magie prüfen", "Umgehen", "Warten"],
                nextTextByWinnerIndex: [
                "Als ihr es berührt, vibriert das Tor und öffnet sich einen Spalt.",
                "Ihr spürt eine Aura – ein Schutzzauber liegt darüber.",
                "Ihr findet einen schmalen Pfad an der Seite.",
                "Ihr wartet – und hört Schritte näherkommen…",
                ],
            },
        ], 
        []
    );

    const [sceneIndex, setSceneIndex] = useState(0);
    const scene = scenes[sceneIndex];

    const [storyText, setStoryText] = useState(scene.text);

    const [votes, setVotes] = useState({});
    const [roundLocked, setRoundLocked] = useState(false);

    const [showDice, setShowDice] = useState(false);
    const [timerKey, setTimerKey] = useState(0);

    const everyoneVoted = Object.keys(votes).length >= playerCount;

    useEffect(() => {
        setStoryText(scene.text);
    }, [scene.id]);

    const voteAvatars = useMemo(() => {
        const buckets = [[], [], [], []];
        Object.entries(votes).forEach(([playerIndexStr, optionIndex]) => {
            const playerIndex = Number(playerIndexStr);
            const image = players[playerIndex]?.image;
            if (image && buckets[optionIndex]) buckets[optionIndex].push(image);
        });
        return buckets;
    }, [votes, players]);

    const computeWinnerIndex = (voteObject) => {
        const counts = [0,0,0,0];
        Object.values(voteObject).forEach((index) => {
            if (index >= 0 && index < 4) counts[index] += 1;
        });

        let winner = 0;
        for (let i = 1; i < 4; i++) {
            if (counts[i] > counts[winner]) winner = i;
        }
        return winner;
    };

    const resetForNextScene = (nextSceneIdx) => {
        setVotes({});
        setRoundLocked(false);
        setShowDice(false);
        setTimerKey((key) => key + 1);
        setSceneIndex(nextSceneIdx);
    }

    const finishRoundWithWinner = (winnerIndex) => {
        setRoundLocked(true);

        const nextText = scene.nextTextByWinnerIndex[winnerIndex] ?? scene.text;
        setStoryText(nextText);

        setTimeout(() => {
            const nextSceneIndex = Math.min(sceneIndex + 1, scenes.length - 1);
            resetForNextScene(nextSceneIndex);
        }, 1200);
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
                    if (next[i] === undefined) next[i] = Math.floor(Math.random()*4);
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
        const winnerIndex = Math.max(1, Math.min(4, result)) - 1;
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

                            <GameDice max={4} onFinish={handleDiceFinish} />
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
                            options={scene.options}
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