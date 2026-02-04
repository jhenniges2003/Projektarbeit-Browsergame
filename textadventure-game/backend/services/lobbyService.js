import dbInstance from "../db.js";

/**
 * Erstellt eine neue Lobby mit einem Host-Spieler
 * @param {string} playerName - Name des Host-Spielers
 * @param {number} maxPlayers - Maximale Anzahl an Spielern
 * @returns {Promise<{lobby: Object, player: Object}>} Lobby- und Spieler-Objekt
 */
export async function createLobbyInDB(playerName, maxPlayers) {
    try {
        const joinCode = Math.random().toString(36).substring(2, 7).toUpperCase();
        const lobbyName = `Lobby von ${playerName}`;

        // 1. Lobby erstellen
        const [lobbyResult] = await dbInstance.query(
            `INSERT INTO lobbies (name, max_players, join_code)
             VALUES (?, ?, ?)`,
            [lobbyName, maxPlayers, joinCode]
        );

        const lobbyId = lobbyResult.insertId;

        // 2. Player erstellen (Host)
        const [playerResult] = await dbInstance.query(
            `INSERT INTO players (name, lobby_id, is_alive)
             VALUES (?, ?, TRUE)`,
            [playerName, lobbyId]
        );

        const playerId = playerResult.insertId;

        // 3. Vollständige Objekte laden
        const [lobbyRows] = await dbInstance.query(
            "SELECT * FROM lobbies WHERE id = ?",
            [lobbyId]
        );

        const [playerRows] = await dbInstance.query(
            "SELECT * FROM players WHERE id = ?",
            [playerId]
        );

        return {
            lobby: lobbyRows[0],
            player: playerRows[0]
        };
    } catch (error) {
        console.error("Fehler beim Erstellen der Lobby:", error);
        throw new Error("Lobby konnte nicht erstellt werden 3");
    }
}

/**
 * Fügt einen Spieler zu einer bestehenden Lobby hinzu
 * @param {string} playerName - Name des beitretenden Spielers
 * @param {string} joinCode - Join-Code der Lobby
 * @returns {Promise<{lobby: Object, player: Object}>} Lobby- und Spieler-Objekt
 */
export async function joinLobbyInDB(playerName, joinCode) {
    try {
        console.log(joinCode);

        // 1. Lobby finden
        const [lobbyRows] = await dbInstance.query(
            "SELECT * FROM lobbies WHERE join_code = ? AND is_active = TRUE",
            [joinCode]
        );

        console.log("Lobby Rows:", lobbyRows);
        console.log("Länge", lobbyRows.length);

        if (lobbyRows.length === 0) {
            throw new Error("Lobby nicht gefunden2");
        }

        const lobby = lobbyRows[0];

        // 2. Prüfen ob Lobby voll ist
        const [countRows] = await dbInstance.query(
            "SELECT COUNT(*) AS count FROM players WHERE lobby_id = ?",
            [lobby.id]
        );

        console.log("Aktuelle Spieleranzahl:", countRows[0].count, "Max:", lobby.max_players);

        if (countRows[0].count >= lobby.max_players) {
            throw new Error("Lobby ist voll");
        }

        // 3. Spieler zur Lobby hinzufügen (mit is_alive = TRUE wie beim Host)
        const [result] = await dbInstance.query(
            `INSERT INTO players (name, lobby_id, is_alive)
             VALUES (?, ?, TRUE)`,
            [playerName, lobby.id]
        );

        // 4. Spieler-Objekt laden
        const [playerRows] = await dbInstance.query(
            "SELECT * FROM players WHERE id = ?",
            [result.insertId]
        );

        return {
            lobby,
            playerCount: countRows[0].count,
            player: playerRows
        };
    } catch (error) {
        console.error("Fehler beim Beitreten der Lobby:", error);
        throw error;
    }
}


/**
 * Entfernt einen Spieler aus einer Lobby
 * @param {number} lobbyId - ID der Lobby
 * @param {number} playerId - ID des Spielers
 * @returns {Promise<{message: string, lobby_players_count: number, lobby_empty: boolean}>}
 */
export async function leaveLobbyInDB(lobbyId, playerId) {
    try {
        // 1. Spieler aus Lobby entfernen
        const [result] = await dbInstance.query(
            "DELETE FROM players WHERE lobby_id = ? AND id = ?",
            [lobbyId, playerId]
        );

        if (result.affectedRows === 0) {
            throw new Error("Spieler nicht in dieser Lobby gefunden");
        }


        // 2. Prüfen, ob Lobby leer ist
        const [players] = await dbInstance.query(
            "SELECT COUNT(*) as count FROM players WHERE lobby_id = ?",
            [lobbyId]
        );

        const playerCount = players[0].count;
        const lobbyEmpty = playerCount === 0;

        // 3. Lobby deaktivieren, wenn leer
        if (lobbyEmpty) {
            await dbInstance.query(
                "UPDATE lobbies SET is_active = FALSE WHERE id = ?",
                [lobbyId]
            );
        }

        return {
            message: "Lobby erfolgreich verlassen",
            lobby_players_count: playerCount,
            lobby_empty: lobbyEmpty
        };
    } catch (error) {
        console.error("Fehler beim Verlassen der Lobby:", error);
        throw error;
    }
}

/**
 * Lädt eine Lobby anhand ihrer ID
 * @param {number} lobbyId - ID der Lobby
 * @returns {Promise<Object>} Lobby-Objekt
 */
export async function getLobbyById(lobbyId) {
    try {
        const [rows] = await dbInstance.query(
            "SELECT * FROM lobbies WHERE id = ?",
            [lobbyId]
        );

        if (rows.length === 0) {
            throw new Error("Lobby nicht gefunden");
        }

        return rows[0];
    } catch (error) {
        console.error("Fehler beim Abrufen der Lobby:", error);
        throw error;
    }
}

/**
 * Lädt alle Spieler einer Lobby
 * @param {number} lobbyId - ID der Lobby
 * @returns {Promise<Array>} Array mit Spieler-Objekten
 */
export async function getPlayersInLobby(lobbyId) {
    try {
        const [rows] = await dbInstance.query(
            "SELECT * FROM players WHERE lobby_id = ?",
            [lobbyId]
        );

        return rows;
    } catch (error) {
        console.error("Fehler beim Abrufen der Spieler:", error);
        throw error;
    }
}