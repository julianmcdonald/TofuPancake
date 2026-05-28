import { pool } from '../../db';

class PostgresGame {
  constructor(row, players = []) {
    this._id = row.game_id;
    this.gameId = row.game_id;
    this.text = row.text;
    this.players = players;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  toObject() {
    return this;
  }
}

// Helper to populate players details for a game
async function populateGameData(gameRow) {
  if (!gameRow) return null;

  // Load all players linked to this game
  const res = await pool.query(
    `SELECT p.*, pg.text_typed, pg.wpm 
     FROM player_games pg 
     JOIN players p ON pg.player_id = p.id 
     WHERE pg.game_id = $1`,
    [gameRow.id]
  );

  const players = [];
  for (const row of res.rows) {
    players.push({
      _id: row.id,
      firebaseUID: row.firebase_uid,
      name: row.name || 'Guest',
      gameRecords: [
        {
          textTyped: row.text_typed,
          wpm: row.wpm
        }
      ],
      games: [gameRow.game_id]
    });
  }

  return new PostgresGame(gameRow, players);
}

export async function createGame(game) {
  const gameIdVal = game.gameId || `game-${Date.now()}`;
  const text = game.text || '';

  // Insert into games table
  const insertRes = await pool.query(
    'INSERT INTO games (game_id, text) VALUES ($1, $2) RETURNING *',
    [gameIdVal, text]
  );
  const gameRow = insertRes.rows[0];

  // Link players if present
  const playersArr = Array.isArray(game.players) ? game.players : (game.players ? [game.players] : []);
  for (const player of playersArr) {
    const playerIdVal = player._id || player;
    // Find player integer ID
    const playerRes = await pool.query('SELECT id FROM players WHERE id = $1', [playerIdVal]);
    if (playerRes.rows.length > 0) {
      // Find game record data if present in player object
      const record = player.gameRecords ? player.gameRecords[0] : { textTyped: '', wpm: 0 };
      await pool.query(
        'INSERT INTO player_games (player_id, game_id, text_typed, wpm) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
        [playerRes.rows[0].id, gameRow.id, record.textTyped, record.wpm]
      );
    }
  }

  return await populateGameData(gameRow);
}

export async function retrieveAllGames() {
  const res = await pool.query('SELECT * FROM games');
  const games = [];
  for (const row of res.rows) {
    const game = await populateGameData(row);
    games.push(game);
  }
  return games;
}

export async function retrieveGame(id) {
  // Can be integer id or game_id string. Handle both!
  let res;
  if (typeof id === 'number' || !isNaN(id)) {
    res = await pool.query('SELECT * FROM games WHERE id = $1', [id]);
  } else {
    res = await pool.query('SELECT * FROM games WHERE game_id = $1', [id]);
  }
  
  if (res.rows.length === 0) return null;
  return await populateGameData(res.rows[0]);
}

export async function retrieveGameByGameId(gameId) {
  const res = await pool.query('SELECT * FROM games WHERE game_id = $1', [gameId]);
  if (res.rows.length === 0) return null;
  return await populateGameData(res.rows[0]);
}

export async function updateGame(game) {
  // Find game integer ID by gameId/_id
  const gameIdVal = game.gameId || game._id;
  const text = game.text || '';

  const updateRes = await pool.query(
    'UPDATE games SET text = $1, updated_at = CURRENT_TIMESTAMP WHERE game_id = $2 RETURNING *',
    [text, gameIdVal]
  );
  
  if (updateRes.rows.length === 0) return null;
  const gameRow = updateRes.rows[0];

  // Sync player links: delete and re-insert
  await pool.query('DELETE FROM player_games WHERE game_id = $1', [gameRow.id]);

  const playersArr = Array.isArray(game.players) ? game.players : (game.players ? [game.players] : []);
  for (const player of playersArr) {
    const playerIdVal = player._id || player;
    const playerRes = await pool.query('SELECT id FROM players WHERE id = $1', [playerIdVal]);
    if (playerRes.rows.length > 0) {
      // Find game record data if present in player object
      let record = { textTyped: '', wpm: 0 };
      if (player.gameRecords) {
        // If there are multiple records, select the one matching this game
        record = player.gameRecords.find(r => r._id === gameRow.game_id) || player.gameRecords[0] || record;
      }
      await pool.query(
        'INSERT INTO player_games (player_id, game_id, text_typed, wpm) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
        [playerRes.rows[0].id, gameRow.id, record.textTyped, record.wpm]
      );
    }
  }

  return await populateGameData(gameRow);
}

export async function deleteGame(id) {
  if (typeof id === 'number' || !isNaN(id)) {
    await pool.query('DELETE FROM games WHERE id = $1', [id]);
  } else {
    await pool.query('DELETE FROM games WHERE game_id = $1', [id]);
  }
}
