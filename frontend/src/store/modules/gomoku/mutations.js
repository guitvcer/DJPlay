import {
  FIND_OPPONENT_SOCKET_URL,
  findOpponentSocketOnClose,
  findOpponentSocketOnMessage,
  findOpponentSocketOnOpen,
  GOMOKU_PARTY_SOCKET_URL,
  gomokuPartySocketOnClose,
  gomokuPartySocketOnMessage,
  gomokuPartySocketOnOpen
} from "../../../scripts/gomoku/socket";

export default {
  updateGame(state, game) {
    state.game = game;
  },
  updateGameStatus(state, status) {
    state.gameStatus = status;
  },
  updateLoading(state, value) {
    state.loading = value;
  },
  updateCell(state, { properties, coordinate }) {
    for (const key of Object.keys(properties)) {
      state.field[coordinate][key] = properties[key];
    }
  },
  updateField(state, field) {
    state.field = field;
  },

  addMove(state, coordinate) {
    state.moves.push({
      coordinate, color: state.currentColor,
    });
  },
  clearMoves(state) {
    state.moves = [];
  },
  removeLastMove(state) {
    state.moves.pop();
  },

  updateMoveOf(state, color) {
    state.moveOf = color;
  },
  updateColor(state, color) {
    state.currentColor = color;
  },

  updatePartyID(state, id) {
    state.partyID = id;
  },
  updateOpponent(state, user) {
    state.opponent = user;
  },

  openFindOpponentSocket(state) {
    state.findOpponentSocket = new WebSocket(FIND_OPPONENT_SOCKET_URL);
    state.findOpponentSocket.onopen = findOpponentSocketOnOpen;
    state.findOpponentSocket.onmessage = findOpponentSocketOnMessage;
    state.findOpponentSocket.onclose = findOpponentSocketOnClose;
  },
  closeFindOpponentSocket(state) {
    state.findOpponentSocket.close();
  },
  sendFindOpponentSocket(state, object) {
    state.findOpponentSocket.send(JSON.stringify(object));
  },

  openGomokuPartySocket(state) {
    state.gomokuPartySocket = new WebSocket(GOMOKU_PARTY_SOCKET_URL + state.partyID);
    state.gomokuPartySocket.onopen = gomokuPartySocketOnOpen;
    state.gomokuPartySocket.onmessage = gomokuPartySocketOnMessage;
    state.gomokuPartySocket.onclose = gomokuPartySocketOnClose;
  },
  closeGomokuPartySocket(state) {
    state.gomokuPartySocket.close();
  },
  sendGomokuPartySocket(state, object) {
    state.gomokuPartySocket.send(JSON.stringify(object));
  },

  updateCancelingCoordinate(state, coordinate) {
    state.cancelingCoordinate = coordinate;
  },

  playMoveSound(state) {
    state.moveSound.currentTime = 0;
    state.moveSound.play().then();
  },

  updateParty(state, party) {
    state.party = party;
  },
}