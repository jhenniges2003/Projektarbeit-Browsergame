import colors from "../styles/colors";

/* 
  //////// CONST BUILD
  const players = [{ name: "", charactername: "", Image: ""}, { name: "", charactername: "", Image: ""}, ...];

  //////// COMPONENETS CALL
  <LobbyPlayerList players={players} />
*/

export default function LobbyPlayerList({ players }) {
  const avatarColors = ["#ff4d4f", "#722ed1", "#faad14", "#13c2c2"];

   return (
    <ul className="list-group">
      {players.map((player, index) => {
        const hasCharacter = Boolean(player.skin_id && player.skin_image);

        return (
          <li
            key={index}
            className="list-group-item d-flex align-items-center"
            style={{
              border: `1px solid ${colors.secondary}`,
              borderRadius: 5,
              margin: 5,
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 50,
                height: 50,
                marginRight: 10,
                borderRadius: 8,
                backgroundColor: hasCharacter
                  ? "transparent"
                  : avatarColors[index % avatarColors.length],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                border: `1px solid ${colors.secondary}`,
                flexShrink: 0,
              }}
            >
              {hasCharacter ? (
                <img
                  src={player.skin_image}
                  alt={player.skin_name || "Character"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <i
                  className="fa-solid fa-user"
                  style={{ color: "white", fontSize: 22 }}
                />
              )}
            </div>

            {/* Player info */}
            <div>
              <div className="fw-bold">{player.name}</div>
              <div className="text-muted small">
                {player.skin_name || "Kein Charakter"}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

