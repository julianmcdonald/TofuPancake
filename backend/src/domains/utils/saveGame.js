/* eslint-disable no-await-in-loop */
import { createGame, updateGame } from '../../mongo/dao/gamesDao';
import { createRegisteredPlayer, updateRegisteredPlayer, retrieveRegisteredPlayerByFirebaseUID } from '../../mongo/dao/registeredPlayersDao';
import firebase from '../../firebase';
// eslint-disable-next-line import/no-cycle
import { LobbyRegister } from '../LobbyRegister';

async function retrieveUIDFromFirebaseId(firebaseId) {
  return null;
}

/**
 * Save a game after a game has finished. If user has a firebase id then their nickname is
 * not saved.
 * @param {*} lobbyId
 */
export async function saveGame(lobbyId) {
  const lobby = LobbyRegister.getLobby(lobbyId);
  const dbGame = await createGame({
    players: [],
  });

  if (!lobby) {
    return;
  }
  const gameDataArray = Array.from(lobby.game.gameData, ([name, value]) => ({ name, value }));
  // eslint-disable-next-line no-restricted-syntax
  for (const gameData of gameDataArray) {
    const playerInfo = lobby.game.playerInfoRegister.get(gameData.name);
    const playerFirebaseUID = await retrieveUIDFromFirebaseId(
      playerInfo.firebaseId,
    );
    let player = null;
    if (playerFirebaseUID) {
      player = await retrieveRegisteredPlayerByFirebaseUID(playerFirebaseUID);
    }
    if (player) {
      const existingGames = player.games;
      player.games = [...existingGames, dbGame];
      player.gameRecords.push({
        textTyped: gameData.value.textTyped,
        wpm: playerInfo.wpm,
      });
      await updateRegisteredPlayer(player);
    } else if (!playerFirebaseUID) {
      player = await createRegisteredPlayer({
        name: lobby.users.get(gameData.name).name,
        games: dbGame,
        gameRecords: {
          textTyped: gameData.value.textTyped,
          wpm: playerInfo.wpm,
        },
      });
    } else {
      player = await createRegisteredPlayer({
        firebaseUID: playerFirebaseUID,
        games: dbGame,
        gameRecords: {
          textTyped: gameData.value.textTyped,
          wpm: playerInfo.wpm,
        },
      });
    }
    dbGame.players = [...dbGame.players, player];
    await updateGame(dbGame);
  }
}
