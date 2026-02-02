
/*
  //////// CONST BUILD
  const character = [{
    id: 0,
    name: "",
    text: "",
    subtext: "",
    image: "",
  }];

  const handleCardClick = (character) => {
    console.log("Clicked character:", character);
  };

  //////// COMPONENETS CALL

  return (
    <div
      className="d-flex gap-3 flex-wrap"
      style={{ flexDirection: "row-reverse" }}
    >
      {characters.map((character) => (
        <div key={character.id}>
          <LobbyCard
            characterInfo={character}
            onClick={handleCardClick}
          />
        </div>
      ))}
    </div>
  );
*/

export default function LobbyCard({ characterInfo, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(characterInfo)}
      style={{
        border: "none",
        padding: 0,
        background: "none",
        textAlign: "left",
      }}
      className="h-100 w-100"
    >
      <div className="card h-100 w-100" style={{ cursor: "pointer", display: "flex", flexDirection: "column", minWidth: 0, }}>
        <div className="d-flex" style={{ flex: "0 0 auto", minWidth: 0, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: 100,
              height: 120,
              borderRight: "1px solid rgba(0,0,0,0.05)",
              padding: 2,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 6,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={characterInfo.image}
                alt={characterInfo.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
          </div>

          <div className="card-body pb-2" style={{ flex: "1 1 auto", minWidth: 0}}>
            <h5 className="card-title mb-2 text-truncate">
              {characterInfo.name}
            </h5>
            <p className="card-text mb-0" style={{ overflowWrap: "anywhere" }}>
              {characterInfo.text}
            </p>
          </div>
        </div>

        <div
          className="card-body pt-2"
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden"
          }}
        >
          <p className="card-text mb-0" style={{ overflowWrap: "anywhere" }}>
            {characterInfo.subtext}
          </p>
        </div>
      </div>
    </button>
  );
}
