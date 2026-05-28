import * as SocketEmit from '../../sockets/emit';
// eslint-disable-next-line import/no-cycle
import { Game } from './Game';
// eslint-disable-next-line import/no-cycle
import { LobbyRegister } from '../LobbyRegister';
import firebase from '../../firebase';

/**
 * This class is responsible for all information regarding a
 * single lobby
 */
export class Lobby {
  /**
     */
  constructor(host, lobbyId) {
    this.users = new Map();
    this.lobbyId = lobbyId;
    this.game = new Game(this.lobbyId, host);
    this.host = host;
  }

  /**
   * @param {*} socket, users socket connection
   * @param {*} name, users input nickname
   */
  async addUser(socket, name, firebaseUserIdToken) {
    const firebaseUser = await this.getFirebaseUser(firebaseUserIdToken);
    let firebaseUID = null;
    if (firebaseUser && firebaseUser.uid) {
      firebaseUID = firebaseUser.uid;
    }
    let firebasePicture = null;
    if (firebaseUser && firebaseUser.picture) {
      firebasePicture = firebaseUser.picture;
    }
    this.users.set(socket.id,
      {
        socket, name, firebaseUserIdToken: firebaseUID, photoURL: firebasePicture,
      });
    this.sendLobbyUpdate();
    console.log(`added user ${socket.id}/${name} to lobby: ${this.lobbyId}`);
  }

  /**
   * @param {*} socket, users socket connection
   * @return {*}
   */
  removeUser(socketId) {
    this.users.delete(socketId);
    this.game.gameData.delete(socketId);
    this.sendLobbyUpdate();
    console.log(`removed user ${socketId} from lobby: ${this.lobbyId}`);
    if (this.users.size === 0) {
      LobbyRegister.removeLobby(this.lobbyId);
    }
  }

  userExists(socketId) {
    return this.users.has(socketId);
  }

  sendLobbyUpdate() {
    SocketEmit.updateLobby(this.lobbyId, { users: this.users, host: this.host });
  }

  containsName(name) {
    // eslint-disable-next-line no-restricted-syntax
    for (const value of this.users.values()) {
      if (value.name === name) {
        return true;
      }
    }
    return false;
  }

  containsAccount(firebaseUserIdToken) {
    // if guest user, we don't worry about it
    if (!firebaseUserIdToken) {
      return false;
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const value of this.users.values()) {
      if (value.firebaseUserIdToken === firebaseUserIdToken) {
        return true;
      }
    }
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  async getFirebaseUser(firebaseUserIdToken) {
    return null;
  }
}
