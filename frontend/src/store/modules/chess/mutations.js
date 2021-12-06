import getPieces from "../../../scripts/chess/pieces";
import { getField } from "../../../scripts/chess/board";
import { GAME_STASUSES } from "../../../scripts/chess/constants";

export default {
  updateGame(state, game) {
    state.game = game;
    state.loading = false;
  },
  updateGameStatus(state, gameStatus) {
    state.gameStatus = gameStatus;
  },

  createPiece(state, piece) {
    state.pieces[piece.coordinate] = piece;
  },
  updatePiece(state, { coordinate, properties }) {
    for (const key of Object.keys(properties)) {
      state.pieces[coordinate][key] = properties[key];
    }
  },
  updateSelectedPiece(state, piece) {
    state.selectedPiece = piece;
  },
  removePiece(state, coordinate) {
    delete state.pieces[coordinate];
  },
  resetPieces(state) {
    state.pieces = getPieces();
  },

  updateCell(state, { coordinate, properties }) {
    for (const key of Object.keys(properties)) {
      state.field[coordinate][key] = properties[key];
    }
  },
  resetCells(state) {
    state.field = getField();
  },
  updateSelectedCell(state, coordinate) {
    state.selectedCell = coordinate;
  },

  updateColor(state, color) {
    state.currentColor = color;
  },
  updateMoveOf(state, color) {
    state.moveOf = color;
  },

  addMove(state, move) {
    if (state.moves.length === 0) {
      state.gameStatus = GAME_STASUSES.OFFLINE;
    }

    state.moves.push(move);
  },
  deleteLastMove(state) {
    state.moves.pop();
  },
  clearMoves(state) {
    state.moves = [];
  },

  updateSecondsRemaining(state, playerIndex) {
    if (state.players[playerIndex].secondsRemaining === 0) {
      state.gameStatus = GAME_STASUSES.FINISHED;
      clearInterval(state.players[playerIndex].intervalHandle);
    } else {
      state.players[playerIndex].secondsRemaining--;
    }
  },
  resetSecondsRemaining(state, playerIndex) {
    state.players[playerIndex].secondsRemaining = 10 * 60;
  },
  updateIntervalHandle(state, { playerIndex, intervalHandle = null }) {
    if (intervalHandle) {
      state.players[playerIndex].intervalHandle = intervalHandle;
    } else {
      clearInterval(state.players[playerIndex].intervalHandle);
    }
  },

  updatePlayerEatenPieces(state, { playerIndex, queen = 0, knight = 0, rook = 0, bishop = 0, pawn = 0}) {
    state.players[playerIndex].eatenPieces.queen += queen;
    state.players[playerIndex].eatenPieces.knight += knight;
    state.players[playerIndex].eatenPieces.rook += rook;
    state.players[playerIndex].eatenPieces.bishop += bishop;
    state.players[playerIndex].eatenPieces.pawn += pawn;
  }
}