import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import Sidebar from "../components/Sidebar";
import LobbyCard from "../components/LobbyCard";
import StoryCarousel from "../components/StoryCarousel";
import Alert from "../components/Alert";

export default function Lobby() {
      const navigate = useNavigate();
      const location = useLocation();

      const playerName = location.state?.playerName ?? 'Spieler';
      const [showPlayerAlert, setShowPlayerAlert] = useState(false);

      const lobbyCode = location.state?.result?.lobby?.join_code ?? 'ABCDf';
      const lobbyId = location.state?.result?.lobby?.id;

      // State für Spielerliste
      const [players, setPlayers] = useState(location.state?.result?.players || []);

      // State für verfügbare Skins
      const [availableSkins, setAvailableSkins] = useState([]);
      const [selectedSkinId, setSelectedSkinId] = useState(null);

      const [stories, setStories] = useState([]);

      // Socket-Verbindung
      // const [socket] = useState(() => io("https://textadventure-game.thorben-dev.org", {
      const [socket] = useState(() => io("http://localhost:3000", {
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

          socket.on("skinSelected", (data) => {
              console.log("🎨 Skin ausgewählt:", data);
              if (data.players) {
                  setPlayers(data.players);
              }
          });

          socket.on("skinRemoved", (data) => {
              console.log("🗑️ Skin entfernt:", data);
              if (data.players) {
                  setPlayers(data.players);
              }
          });

          socket.on("error", (data) => {
              console.error("❌ Socket Error:", data);
              alert(data.message || "Ein Fehler ist aufgetreten");
          });

          socket.on("gameStarted", (data) => {
              console.log("🎮 Spiel wurde gestartet:", data);

              // Finde den aktuellen Spieler
              const currentPlayer = data.players.find(p => p.name === playerName);

              // Navigiere zur Game-Seite mit allen benötigten Daten
              navigate("/game", {
                  state: {
                      story: data.story,
                      currentNode: data.currentNode,
                      decisions: data.decisions,
                      players: data.players,
                      lobbyId: lobbyId,
                      currentPlayerId: currentPlayer?.id
                  }
              });
          });

          return () => {
              socket.off("playerJoined");
              socket.off("playerLeft");
              socket.off("skinSelected");
              socket.off("skinRemoved");
              socket.off("error");
              socket.off("gameStarted");
          };
      }, [socket, lobbyId, navigate]);

      // Lade verfügbare Skins
      useEffect(() => {
          const fetchSkins = async () => {
              try {
                  const response = await fetch("/api/skins");
                  const data = await response.json();
                  setAvailableSkins(data);
              } catch (error) {
                  console.error("Fehler beim Laden der Skins:", error);
              }
          };

          const fetchStories = async () => {
                try {
                      const response = await fetch("/api/stories");
                      const data = await response.json();
                      setStories(data);
                      console.log("Stories:", data);
                } catch (error) {
                      console.error("Fehler beim Laden der Stories:", error);
                }
          };

          fetchSkins();
          fetchStories();

      }, []);

      // Setze initial ausgewählten Skin vom aktuellen Spieler
      useEffect(() => {
          const currentPlayer = players.find(p => p.name === playerName);
          if (currentPlayer && currentPlayer.skin_id) {
              setSelectedSkinId(currentPlayer.skin_id);
          }
      }, [players, playerName]);

      // Ermittle verwendete Skin IDs
      const usedSkinIds = players.map(p => p.skin_id).filter(id => id !== null);

      // Enriche Spielerdaten mit Charakterinformationen aus der Datenbank
      const enrichedPlayers = players.map(player => {
            if (player.skin_id) {
                  const skin = availableSkins.find(s => s.id === player.skin_id);
                console.log("skin image:", skin?.resource_path);

                  if (skin) {
                        return {
                              ...player,
                              skin_name: skin.name,
                              skin_image: skin.resource_path
                        };
                  }
            }
            return player;
      });

      const handleStart = (selectedStory) => {
            if (players.length < 2) {
                  setShowPlayerAlert(true);
                  return;
            }

            // Sende startGame Event an Server mit Story-ID
            console.log("Sende startGame Event mit Story:", selectedStory);
            socket.emit("startGame", {
                  lobbyId: lobbyId,
                  storyId: selectedStory.id
            });
      };

      const handleSkinSelect = (skinId) => {
            const currentPlayer = players.find(p => p.name === playerName);
            if (!currentPlayer) {
                  console.error("Aktueller Spieler nicht gefunden");
                  return;
            }

            // Prüfe ob der Skin bereits von einem anderen Spieler verwendet wird
            const skinInUse = players.some(p => p.id !== currentPlayer.id && p.skin_id === skinId);
            if (skinInUse) {
                  alert("Dieser Charakter wurde bereits von einem anderen Spieler ausgewählt");
                  return;
            }

            // Wenn der Spieler bereits diesen Skin hat, entferne ihn
            if (currentPlayer.skin_id === skinId) {
                  socket.emit("removeSkin", {
                        lobbyId: lobbyId,
                        playerId: currentPlayer.id
                  });
                  setSelectedSkinId(null);
            } else {
                  // Sonst wähle den neuen Skin
                  socket.emit("selectSkin", {
                        lobbyId: lobbyId,
                        playerId: currentPlayer.id,
                        skinId: skinId
                  });
                  setSelectedSkinId(skinId);
            }
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
                              players={enrichedPlayers}
                              onLeave={() => navigate("/")}
                        />

                        <main className="bg-white border rounded shadow-sm p-3 d-flex flex-column flex-grow-1"
                              style={{ minWidth: 0, minHeight: 0 }}>
                              <StoryCarousel 
                                    slides={stories}
                                    height={380}
                                    disabled={!selectedSkinId}
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
                                          {availableSkins.map((skin) => {
                                                const isUsed = usedSkinIds.includes(skin.id);
                                                const isSelectedByMe = selectedSkinId === skin.id;
                                                const playerWithSkin = players.find(p => p.skin_id === skin.id);

                                                // Erstelle Charakter-Objekt für LobbyCard aus Datenbank-Daten
                                                const characterInfo = {
                                                      id: skin.id,
                                                      name: skin.name,
                                                      text: `Wesen: ${skin.personality}`,
                                                      subtext: isUsed
                                                            ? (isSelectedByMe ? "✓ Von dir gewählt" : `Gewählt von ${playerWithSkin?.name}`)
                                                            : skin.description || "Verfügbar",
                                                      image: skin.resource_path
                                                };

                                                return (
                                                      <div key={skin.id} style={{
                                                            flex: "1 1 0",
                                                            height: "100%",
                                                            minWidth: 0,
                                                            position: "relative",
                                                            border: isSelectedByMe ? "3px solid #4A741B" : "none",
                                                            borderRadius: "8px",
                                                            opacity: isUsed && !isSelectedByMe ? 0.5 : 1,
                                                            cursor: isUsed && !isSelectedByMe ? "not-allowed" : "pointer",
                                                            pointerEvents: isUsed && !isSelectedByMe ? "none" : "auto",
                                                      }}>
                                                            <LobbyCard
                                                                  characterInfo={characterInfo}
                                                                  onClick={() => handleSkinSelect(skin.id)}
                                                            />
                                                      </div>
                                                );
                                          })}
                                    </div>
                              </section>
                        </main>
                  </div>
            </div>
      )
}