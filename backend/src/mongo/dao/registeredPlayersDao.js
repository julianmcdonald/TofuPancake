import { pool } from '../../db';

class PostgresPlayer {
  constructor(row, games = [], gameRecords = []) {
    this._id = row.id;
    this.firebaseUID = row.firebase_uid;
    this.name = row.name || 'Guest';
    this.games = games;
    this.gameRecords = gameRecords;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  toObject() {
    return this;
  }
}

// Helper to populate games and gameRecords for a player
async function populatePlayerData(playerRow) {
  if (!playerRow) return null;

  // Load all games played by this player
  const res = await pool.query(
    `SELECT pg.*, g.game_id, g.text, g.created_at as game_created_at 
     FROM player_games pg 
     JOIN games g ON pg.game_id = g.id 
     WHERE pg.player_id = $1`,
    [playerRow.id]
  );

  const games = [];
  const gameRecords = [];

  for (const row of res.rows) {
    games.push({
      _id: row.game_id,
      gameId: row.game_id,
      text: row.text,
      createdAt: row.game_created_at,
      players: [] // Stub players list
    });
    gameRecords.push({
      _id: row.game_id,
      textTyped: row.text_typed,
      wpm: row.wpm
    });
  }

  return new PostgresPlayer(playerRow, games, gameRecords);
}

export async function createRegisteredPlayer(registeredPlayer) {
  const firebaseUID = registeredPlayer.firebaseUID || null;
  const name = registeredPlayer.name || null;

  // Insert player
  const insertRes = await pool.query(
    'INSERT INTO players (firebase_uid, name) VALUES ($1, $2) RETURNING *',
    [firebaseUID, name]
  );
  const playerRow = insertRes.rows[0];

  // Insert player_games links
  const gamesArr = Array.isArray(registeredPlayer.games) ? registeredPlayer.games : [registeredPlayer.games];
  const recordsArr = Array.isArray(registeredPlayer.gameRecords) ? registeredPlayer.gameRecords : [registeredPlayer.gameRecords];

  for (let i = 0; i < gamesArr.length; i++) {
    const game = gamesArr[i];
    const record = recordsArr[i];
    if (game && record) {
      // Find game integer ID by gameId/_id
      const gameIdVal = game.gameId || game._id || game;
      const gameRes = await pool.query('SELECT id FROM games WHERE game_id = $1', [gameIdVal]);
      if (gameRes.rows.length > 0) {
        await pool.query(
          'INSERT INTO player_games (player_id, game_id, text_typed, wpm) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
          [playerRow.id, gameRes.rows[0].id, record.textTyped, record.wpm]
        );
      }
    }
  }

  return await populatePlayerData(playerRow);
}

export async function retrieveAllRegisteredPlayers() {
  const res = await pool.query('SELECT * FROM players');
  const players = [];
  for (const row of res.rows) {
    const player = await populatePlayerData(row);
    players.push(player);
  }
  return players;
}

export async function retrieveRegisteredPlayer(id) {
  const res = await pool.query('SELECT * FROM players WHERE id = $1', [id]);
  if (res.rows.length === 0) return null;
  return await populatePlayerData(res.rows[0]);
}

export async function retrieveRegisteredPlayerByFirebaseUID(firebaseUID) {
  if (!firebaseUID) return null;
  const res = await pool.query('SELECT * FROM players WHERE firebase_uid = $1', [firebaseUID]);
  if (res.rows.length === 0) return null;
  return await populatePlayerData(res.rows[0]);
}

export async function updateRegisteredPlayer(registeredPlayer) {
  const id = registeredPlayer._id;
  const firebaseUID = registeredPlayer.firebaseUID || null;
  const name = registeredPlayer.name || null;

  // Update players table
  const updateRes = await pool.query(
    'UPDATE players SET firebase_uid = $1, name = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
    [firebaseUID, name, id]
  );
  const playerRow = updateRes.rows[0];

  // Sync player_games table: first delete existing links
  await pool.query('DELETE FROM player_games WHERE player_id = $1', [id]);

  // Re-insert game links
  const gamesArr = Array.isArray(registeredPlayer.games) ? registeredPlayer.games : [registeredPlayer.games];
  const recordsArr = Array.isArray(registeredPlayer.gameRecords) ? registeredPlayer.gameRecords : [registeredPlayer.gameRecords];

  for (let i = 0; i < gamesArr.length; i++) {
    const game = gamesArr[i];
    const record = recordsArr[i];
    if (game && record) {
      const gameIdVal = game.gameId || game._id || game;
      const gameRes = await pool.query('SELECT id FROM games WHERE game_id = $1', [gameIdVal]);
      if (gameRes.rows.length > 0) {
        await pool.query(
          'INSERT INTO player_games (player_id, game_id, text_typed, wpm) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
          [id, gameRes.rows[0].id, record.textTyped, record.wpm]
        );
      }
    }
  }

  return await populatePlayerData(playerRow);
}

export async function deleteRegisteredPlayer(id) {
  await pool.query('DELETE FROM players WHERE id = $1', [id]);
}
