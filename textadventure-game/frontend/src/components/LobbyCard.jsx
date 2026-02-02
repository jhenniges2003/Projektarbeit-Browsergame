
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
      onClick={() => onClick(characterInfo)}
      style={{
        border: "none",
        padding: 0,
        background: "none",
        width: "100%",
        textAlign: "left",
      }}
    >
      <div className="card h-100" style={{ cursor: "pointer" }}>
        <div className="row g-0">
          <div className="col-md-4">
            <img
              src={characterInfo.image}
              className="img-fluid h-100 w-100"
              alt={characterInfo.name}
              style={{ objectFit: "cover", borderRadius: "5px", margin: "10px" }}
            />
          </div>

          <div className="col-md-8">
            <div className="card-body">
              <h5 className="card-title">{characterInfo.name}</h5>
              <p className="card-text">{characterInfo.text}</p>
            </div>
          </div>
        </div>

        <div className="card-body">
          <p className="card-text">{characterInfo.subtext}</p>
        </div>
      </div>
    </button>
  );
}
