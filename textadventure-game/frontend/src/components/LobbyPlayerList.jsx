import colors from "../styles/colors";

/* 
  //////// CONST BUILD
  const players = [{ name: "", charactername: "", Image: ""}, { name: "", charactername: "", Image: ""}, ...];

  //////// COMPONENETS CALL
  <LobbyPlayerList players={players} />
*/

export default function LobbyPlayerList({ players }) {
  return (
    <ul className="list-group">
      {players.map((player, index) => (
        <li
          key={index}
          className="list-group-item d-flex"
          style={{border: `1px solid ${colors.secondary}`, borderRadius: "5px", margin: "5px", justifyContent: "flex-start !important"}}
        >

          <img
            src={player.image}
            alt=""
            style={{
              width: "50px",
              height: "50px",
              objectFit: "cover",
              borderRadius: "5px",
              marginRight: "10px",
              border: `1px solid ${colors.secondary}`
            }}
          />

          <div>
            <div className="fw-bold">{player.name}</div>
            <div className="text-muted small">{player.description}</div>
          </div>

        </li>
      ))}
    </ul>
  );
}

