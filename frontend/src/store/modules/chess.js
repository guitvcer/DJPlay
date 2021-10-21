import api from "../../api/index";
import { WHITE, BLACK } from "../../scripts/chess/constants.js";
import initialPieces from "../../scripts/chess/set";
import { getField } from "../../scripts/chess/board";

export default {
  actions: {
    async loadChess({ commit, getters }) {
      /* Загрузить данные о Шахматах */

      const response = await api.chess.load();

      commit("updateGame", response.data);
      commit("onLoaded");
    },
    clearAndSetInitialPieces({ commit, dispatch }, color = WHITE) {
      /* Очистить поле и создать начальные фигуры */

      commit("resetField");
      commit("updateMoveOf", WHITE);
      commit("changeColor", color);
      commit("clearMoves");
      dispatch("changePieces", initialPieces);
    },
    unselectAllPieces({ commit, getters }) {
      /* Отменить выделение всех фигур и клеток */

      for (let piece of getters.pieces) {
        piece.selected = false;
        commit("updatePiece", piece.coordinate, piece);
      }

      commit("changeSelectedPiece", null);
    },
    clearAllLastMoves({ commit, getters }) {
      /* Установить false для поля last всех клеток */

      for (const coordinate in getters.field) {
        let arg = {};
        arg.coordinate = {
          last: false,
        }

        commit("updateCell", arg);
      }
    },
    selectPiece({ commit }, piece) {
      /* Выбрать фигуру */

      let arg = piece;
      arg[selected] = true;

      commit("updatePiece", arg);
      commit("changeSelectedPiece", piece);
    },
    validateCoordinate({ getters }, coordinate) {
      /* Вернуть true если координата принадлежил полю, иначе false */

      return getters.field[coordinate] !== undefined;
    },
    checkCellForHostility({ getters }, coordinate) {
      /* Проверить клетку на враждебную фигуру */

      const piece = getters.pieces[coordinate];

      if (piece === undefined) return false;

      return (piece.color !== getters.currentColor);
    },
    checkCellForEmptiness({ getters }, coordinate) {
      /* Проверить клетку на пустоту */

      return getters.pieces[coordinate] !== undefined;
    },
    checkCellForFriendliness({ dispatch }, coordinate) {
      /* Проверить клетку на дружеблюную фигуру */

      return !dispatch("checkCellForHostility", coordinate) && !dispatch("checkCellForEmptiness", coordinate)
    },
    selectCell({ commit }, coordinate) {
      /* Выбрать клетку */

      let arg = {};

      arg[coordinate] = {
        selectable: true,
      }

      commit("updateCell", arg);
    },
    selectCells({ commit, dispatch }, coordinates) {
      /* Выбрать клетки по координатам */

      for (const coordinate of coordinates) {
        dispatch("selectCell", coordinate);
      }
    },
    move({ commit, dispatch }, coordinate, piece) {
      /* Сделать ход */

      dispatch("clearAllLastMoves");
    },
    addPiece({ commit }, coordinate, piece) {
      commit("updatePiece", coordinate, piece);
    },
    changePieces({ commit }, pieces) {
      commit("updatePieces", pieces);
    },
    clearPieces({ commit }) {
      commit("updatePieces", []);
    },
    swapColor({ commit, getters }) {
      commit("changeColor", getters.oppositeColor);
    },
  },
  mutations: {
    updateGame(state, game) {
      state.game = game;
    },
    onLoaded(state) {
      state.loading = false;
    },
    changeColor(state, color) {
      state.currentColor = color;
    },
    updatePiece(state, coordinate, piece) {
      state.pieces[coordinate] = piece;
    },
    changeSelectedPiece(state, piece) {
      state.selectedPiece = piece;
    },
    updatePieces(state, pieces) {
      state.pieces = pieces;
    },
    clearMoves(state) {
      state.moves = [];
    },
    updateMoveOf(state, color) {
      state.moveOf = color;
    },
    resetField(state) {
      state.field = getField();
    },
    updateCell(state, object) {
      state.field[Object.keys(object)[0]] = Object.values(object)[0];
    },
  },
  state: {
    gameStatus: null,
    findOpponentSocket: null,
    chessPartySocket: null,
    partyId: null,
    opponent: null,
    game: null,
    check: null,
    selectedPiece: null,
    field: getField(),
    moves: [],
    pieces: [],
    currentColor: WHITE,
    moveOf: WHITE,
    loading: true,
  },
  getters: {
    game(state) {
      return state.game;
    },
    loading(state) {
      return state.loading;
    },
    currentColor(state) {
      return state.currentColor;
    },
    oppositeColor(state) {
      return WHITE ? state.currentColor === BLACK : WHITE;
    },
    pieces(state) {
      return state.pieces;
    },
    field(state) {
      return state.field;
    },
  }
}