import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

      const lobbyCode = "ABCD";

      const players = [
            {
                  name: playerName,
                  characterName: selectedCharacter ? selectedCharacter.name : "",
                  image: selectedCharacter ? selectedCharacter.image : "",            },
      ];

      const characters = [
            {
                  id: 1,
                  name: "Gurkelbert",
                  text: "Wesen: neugierig, rational",
                  subtext: "Gurkelbert sucht nicht nach Sicherheit, sondern nach Antworten. Alte Symbole faszinieren ihn mehr, als sie ihm Angst machen. Er glaubt, dass alles erklärbar ist, selbst Dinge, die besser unbeantwortet bleiben.",
                  image: new URL("../assets/images/characters/Charakter_Gelehrter_Gurkelbert.png", import.meta.url).href,
            },
            {
                  id: 2,
                  name: "Zottelrudi",
                  text: "Wesen: chaotisch, enthusiastisch",
                  subtext: "Probiert alles, auch wenn es komisch klingt und rührt ständig in Töpfen herum. Ist immer mit Schürze unterwegs.",
                  image: new URL("../assets/images/characters/Charakter_Koch_Zottelrudi.png", import.meta.url).href,
            },
            {
                  id: 3,
                  name: "Trudelhut",
                  text: "Wesen: freundlich, fröhlich",
                  subtext: "Sieht immer das Gute, selbst in Pfützen oder Schuhkartons. Lacht viel, auch über Dinge, die niemand lustig findet.",
                  image: new URL("../assets/images/characters/Charakter_Optimist_Trudelhut.png", import.meta.url).href,
            },
            {
                  id: 4,
                  name: "Glimmerbart",
                  text: "Wesen: ruhig, nachdenklich",
                  subtext: "Geht alles langsam an und denkt über alles nach, sogar über das Wetter oder die Farbe von Steinen.",
                  image: new URL("../assets/images/characters/Charakter_Philosoph_Glimmerbart.png", import.meta.url).href,
            },
      ];

      const storySlides = [
            {
                  id: 1,
                  title: "Coole Story",
                  buttonLabel: "START",
                  backgroundImage: new URL("../assets/images/background.png", import.meta.url).href,
            },
      ];

      const handleStart = () => {
            if (players.length < 2) {
                  setShowPlayerAlert(true);
                  return;
            }
            navigate("/game", { state: { players } });
      };

      return (
            <div className="container-fluid bg-light py-3" style={{ minHeight: "100vh" }}>
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