import { jest } from "@jest/globals";

// Mock definieren 
const mockQuery = jest.fn();

jest.unstable_mockModule("../db.js", () => ({
  default: {
    query: mockQuery
  }
}));

// Module nach dem Mock importieren
const dbInstance = (await import("../db.js")).default;

const {
  createLobbyInDB,
  joinLobbyInDB,
  leaveLobbyInDB,
  getLobbyById,
  getPlayersInLobby
} = await import("../services/lobbyService.js");

// Reset vor jedem Test
beforeEach(() => {
  mockQuery.mockReset();
});

test("Jest funktioniert", () => {
  expect(1 + 1).toBe(2);
});

describe("createLobbyInDB", () => {
  test("erstellt Lobby und Host-Spieler erfolgreich", async () => {
    // Arrange
    mockQuery
      .mockResolvedValueOnce([{ insertId: 1 }])
      .mockResolvedValueOnce([{ insertId: 10 }])
      .mockResolvedValueOnce([[{ id: 1, name: "Lobby von Max" }]])
      .mockResolvedValueOnce([[{ id: 10, name: "Max" }]]);

    // Act
    const result = await createLobbyInDB("Max", 4);

    // Assert
    expect(mockQuery).toHaveBeenCalledTimes(4);
    expect(result.lobby.id).toBe(1);
    expect(result.player.name).toBe("Max");
  });
});

describe("joinLobbyInDB", () => {
  test("Spieler tritt Lobby erfolgreich bei", async () => {
   mockQuery
    .mockResolvedValueOnce([[{ id: 1, max_players: 4 }]])
    .mockResolvedValueOnce([[{ count: 2 }]])
    .mockResolvedValueOnce([{ insertId: 5 }])
    .mockResolvedValueOnce([[{ id: 5, name: "Anna", lobby_id: 1 }]]);


    const result = await joinLobbyInDB("Anna", "ABCDE");

    expect(result.lobby.id).toBe(1);
    expect(result.player.name).toBe("Anna");
    expect(result.player.lobby_id).toBe(1);

  });

  test("wirft Fehler wenn Lobby nicht existiert", async () => {
    mockQuery.mockResolvedValueOnce([[]]);

    await expect(joinLobbyInDB("Anna", "XXXXX"))
      .rejects
      .toThrow("Lobby nicht gefunden");
  });

  test("wirft Fehler wenn Lobby voll ist", async () => {
    mockQuery
      .mockResolvedValueOnce([[{ id: 1, max_players: 2 }]])
      .mockResolvedValueOnce([[{ count: 2 }]]);

    await expect(joinLobbyInDB("Anna", "ABCDE"))
      .rejects
      .toThrow("Lobby ist voll");
  });
});

describe("leaveLobbyInDB", () => {
  test("Spieler verlässt Lobby, Lobby bleibt aktiv", async () => {
    mockQuery
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{ count: 1 }]]);

    const result = await leaveLobbyInDB(1, 10);

    expect(result.lobby_empty).toBe(false);
    expect(result.lobby_players_count).toBe(1);
  });

  test("deaktiviert Lobby wenn letzter Spieler geht", async () => {
    mockQuery
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{ count: 0 }]])
      .mockResolvedValueOnce([{}]);

    const result = await leaveLobbyInDB(1, 10);

    expect(result.lobby_empty).toBe(true);
    expect(mockQuery).toHaveBeenCalledWith(
      "UPDATE lobbies SET is_active = FALSE WHERE id = ?",
      [1]
    );
  });

  test("wirft Fehler wenn Spieler nicht in Lobby ist", async () => {
    mockQuery.mockResolvedValueOnce([{ affectedRows: 0 }]);

    await expect(leaveLobbyInDB(1, 999))
      .rejects
      .toThrow("Spieler nicht in dieser Lobby gefunden");
  });
});

describe("getLobbyById", () => {
  test("liefert Lobby zurück", async () => {
    mockQuery.mockResolvedValueOnce([[{ id: 1, name: "Test Lobby" }]]);

    const lobby = await getLobbyById(1);

    expect(lobby.id).toBe(1);
  });

  test("wirft Fehler wenn Lobby nicht existiert", async () => {
    mockQuery.mockResolvedValueOnce([[]]);

    await expect(getLobbyById(99))
      .rejects
      .toThrow("Lobby nicht gefunden");
  });
});

describe("getPlayersInLobby", () => {
  test("liefert Spieler-Liste", async () => {
    mockQuery.mockResolvedValueOnce([[{ id: 1 }, { id: 2 }]]);

    const players = await getPlayersInLobby(1);

    expect(players.length).toBe(2);
  });

  test("liefert leeres Array wenn keine Spieler", async () => {
    mockQuery.mockResolvedValueOnce([[]]);

    const players = await getPlayersInLobby(1);

    expect(players).toEqual([]);
  });
});