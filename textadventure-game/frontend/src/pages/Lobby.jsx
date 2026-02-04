import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import Sidebar from "../components/Sidebar";
import MenuCard from "../components/LobbyCard";
import StoryCarousel from "../components/StoryCarousel";
import Alert from "../components/Alert";

export default function Lobby() {
      const navigate = useNavigate();
      const location = useLocation();

      const playerName = location.state?.playerName ?? 'Spieler';
      const [selectedCharacter, setSelectedCharacter] = useState(null);
      const [showPlayerAlert, setShowPlayerAlert] = useState(false);

      const lobbyCode = location.state?.result?.lobby?.join_code ?? 'ABCDf';
      const lobbyId = location.state?.result?.lobby?.id;

      // State für Spielerliste
      const [players, setPlayers] = useState(location.state?.result?.players || []);

      // Socket-Verbindung
      const [socket] = useState(() => io("https://textadventure-game.thorben-dev.org", {
          transports: ['websocket', 'polling'],
          upgrade: true,
          reconnection: true,
          reconnectionDelay: 1000
      }));

      // Socket-Listener für neue Spieler
      useEffect(() => {
          // Host muss dem Room beitreten, um Events zu empfangen
          if (lobbyId && socket.connected) {
              console.log("🔌 Trete Socket-Room bei:", lobbyId);
              socket.emit("joinRoom", { lobbyId });
          } else if (lobbyId) {
              socket.once("connect", () => {
                  console.log("🔌 Socket verbunden, trete Room bei:", lobbyId);
                  socket.emit("joinRoom", { lobbyId });
              });
          }

          socket.on("playerJoined", (data) => {
              console.log("✅ Neuer Spieler beigetreten:", data);
              if (data.players) {
                  setPlayers(data.players);
              }
          });

          socket.on("playerLeft", (data) => {
              console.log("👋 Spieler hat die Lobby verlassen:", data);
              if (data.players) {
                  setPlayers(data.players);
              }
          });

          return () => {
              socket.off("playerJoined");
              socket.off("playerLeft");
          };
      }, [socket, lobbyId]);

      // const players = [
      //       {
      //             name: playerName,
      //             characterName: selectedCharacter ? selectedCharacter.name : "",
      //             image: selectedCharacter ? selectedCharacter.image : "",            },
      // ];

      // const players = location.state?.result?.players;

      const characters = [
            {
                  id: 1,
                  name: "Gurkelbert",
                  text: "Wesen: neugierig, rational",
                  subtext: "Gurkelbert sucht nicht nach Sicherheit, sondern nach Antworten. Alte Symbole faszinieren ihn mehr, als sie ihm Angst machen. Er glaubt, dass alles erklärbar ist, selbst Dinge, die besser unbeantwortet bleiben.",
                  image: new URL("../assets/skins/Charakter_Gelehrter_Gurkelbert.png", import.meta.url).href,
            },
            {
                  id: 2,
                  name: "Zottelrudi",
                  text: "Wesen: chaotisch, enthusiastisch",
                  subtext: "Probiert alles, auch wenn es komisch klingt und rührt ständig in Töpfen herum. Ist immer mit Schürze unterwegs.",
                  image: new URL("../assets/skins/Charakter_Koch_Zottelrudi.png", import.meta.url).href,
            },
            {
                  id: 3,
                  name: "Trudelhut",
                  text: "Wesen: freundlich, fröhlich",
                  subtext: "Sieht immer das Gute, selbst in Pfützen oder Schuhkartons. Lacht viel, auch über Dinge, die niemand lustig findet.",
                  image: new URL("../assets/skins/Charakter_Optimist_Trudelhut.png", import.meta.url).href,
            },
            {
                  id: 4,
                  name: "Glimmerbart",
                  text: "Wesen: ruhig, nachdenklich",
                  subtext: "Geht alles langsam an und denkt über alles nach, sogar über das Wetter oder die Farbe von Steinen.",
                  image: new URL("../assets/skins/Charakter_Philosoph_Glimmerbart.png", import.meta.url).href,
            },
      ];

      const storySlides = [
            {
                  id: 1,
                  title: "Coole Story",
                  description: "In dieser Story bekämpft ihr gemeinsam den Wald",
                  buttonLabel: "START",
                  backgroundImage: new URL("../assets/images/background.png", import.meta.url).href,
            },
            {
                  id: 2,
                  title: "Schnelle Story",
                  buttonLabel: "START",
                  backgroundImage: new URL("../assets/images/background.png", import.meta.url).href,
            }
      ];

      const handleStart = () => {
            if (players.length < 2) {
                  setShowPlayerAlert(true);
                  return;
            }
            navigate("/game", { state: { players } });
      };

      return (
            <div
                  className="container-fluid py-3"
                  style={{
                        minHeight: "100vh",
                        background: "linear-gradient(180deg, #4A741B 0%, #2B430F 100%)",
                  }}
            >
                  <Alert 
                        open={showPlayerAlert}
                        onClose={() => setShowPlayerAlert(false)}
                        title="Meldung"
                        message="Mindestens 2 Spieler zum Start nötig"
                        severity="danger"
                  />
                  <div
                        className="d-flex gap-3"
                        style={{
                              height: "calc(100vh - 2rem)",
                              maxWidth: 1400,
                              margin: "0 auto",
                        }}
                  >
                        <Sidebar 
                              lobbyCode={lobbyCode}
                              players={players}
                              onLeave={() => navigate("/")}
                        />

                        <main className="bg-white border rounded shadow-sm p-3 d-flex flex-column flex-grow-1"
                              style={{ minWidth: 0, minHeight: 0 }}>
                              <StoryCarousel 
                                    slides={storySlides}
                                    height={380}
                                    disabled={!selectedCharacter}
                                    onStart={handleStart}
                              />

                              {/*Character Cards*/}
                              <section className="border rounded p-3" style={{ flex: "1 1 auto", minHeight: 0, overflow: "hidden" }}>
                                    <div className="d-flex gap-3 align-items-stretch" 
                                         style={{
                                          height: "100%",
                                          overflow: "hidden",
                                          flexWrap: "nowrap",
                                          minWidth: 0,
                                         }}>
                                          {characters.map((character) => (
                                                <div key={character.id} style={{
                                                      flex: "1 1 0",
                                                      height: "100%",
                                                      minWidth: 0,
                                                }}>
                                                      <MenuCard 
                                                            characterInfo={character}
                                                            onClick={setSelectedCharacter}
                                                      />
                                                </div>
                                          ))}
                                    </div>
                              </section>
                        </main>
                  </div>
            </div>
      )
}