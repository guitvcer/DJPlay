export default {
  game(state) {
    return state.game;
  },
  gameStatus(state) {
    return state.gameStatus;
  },
  loading(state) {
    return state.loading;
  },
  moveOf(state) {
    return state.moveOf;
  },
  currentColor(state) {
    return state.currentColor;
  },
  moves(state) {
    return state.moves;
  },
  field(state) {
    return state.field;
  },
  opponent(state) {
    return state.opponent;
  },
  cancelingCoordinate(state) {
    return state.cancelingCoordinate;
  },
  party(state) {
    return state.party;
  }
}