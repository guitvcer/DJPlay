export default {
  game(state) {
    return state.game;
  },
  loading(state) {
    return state.loading;
  },
  gameStatus(state) {
    return state.gameStatus;
  },
  currentColor(state) {
    return state.currentColor;
  },
  moveOf(state) {
    return state.moveOf;
  },
  field(state) {
    return state.field;
  },
  pieces(state) {
    return state.pieces;
  },
  selectedPiece(state) {
    return state.selectedPiece;
  },
  selectedCell(state) {
    return state.selectedCell;
  },
  moves(state) {
    return state.moves;
  },
  players(state) {
    return state.players;
  },
  movingPlayerIndex(state) {
    return state.players[0].color === state.moveOf ? 0 : 1;
  },
  waitingPlayerIndex(state) {
    return state.players[0].color === state.moveOf ? 1 : 0;
  },
  partyID(state) {
    return state.partyID;
  }
}