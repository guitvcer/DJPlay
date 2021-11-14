import api from "../../api/index";
import { WHITE, BLACK } from "../../scripts/chess/constants";
import { getField } from "../../scripts/chess/board";
import pieces from "../../scripts/chess/pieces";
import select from "../../scripts/chess/select";

export default {
  actions: {
    async loadChess({ commit }) {
      /* Загрузить информацию о Шахматах */

      const response = await api.chess.load();

      commit("updateGame", response.data);
    },

    selectPiece({ dispatch, commit, getters }, coordinate) {
      /* Выбрать фигуру */

      dispatch("unselectPiece");

      const properties = { selected: true };
      commit("updatePiece", { coordinate, properties });
      commit("updateSelectedPiece", getters.pieces[coordinate]);

      const piece = getters.pieces[coordinate];
      const availableCellsIds = select[piece.name](piece.coordinate);

      dispatch("selectCells", availableCellsIds.selectable);
      dispatch("ediblePieces", availableCellsIds.edible);
    },
    unselectPiece({ dispatch, commit, getters }) {
      /* Убрать выделение фигуры и доступные для него клетки */

      if (getters.selectedPiece) {
        const coordinate = getters.selectedPiece.coordinate;
        const properties = { selected: false };

        commit("updatePiece", { coordinate, properties });
        commit("updateSelectedPiece", null);

        dispatch("unSelectCells");
        dispatch("unEdiblePieces");
      }
    },
    movePiece({ dispatch, commit, getters }, coordinate) {
      /* Двинуть фигуру */

      const piece = getters.selectedPiece;

      dispatch("unselectPiece");
      commit("removePiece", piece.coordinate);

      piece.coordinate = coordinate;
      piece.selected = false;

      commit("createPiece", { coordinate, piece });
    },

    selectCell({ commit }, coordinate) {
      /* Выбрать клетку */

      const properties = { selectable: true };

      commit("updateCell", { coordinate, properties });
    },
    selectCells({ dispatch }, cellsIds) {
      /* Выбрать клетки */

      for (const coordinate of cellsIds) {
        dispatch("selectCell", coordinate);
      }
    },
    unSelectCells({ commit, getters }) {
      /* Убрать выделение со всех клеток */

      for (const coordinate in getters.field) {
        const piece = getters.field[coordinate];

        if (piece && piece.selectable) {
          const properties = { selectable: false };

          commit("updateCell", { coordinate, properties });
        }
      }
    },

    ediblePiece({ commit, getters }, coordinate) {
      /* Сделать фигуру съедобным */

      if (getters.pieces[coordinate]) {
        const properties = { edible: true };

        commit("updatePiece", { coordinate, properties });
      }
    },
    ediblePieces({ dispatch }, cellsIds) {
      /* Сделать фигуры съедобными */

      for (const coordinate of cellsIds) {
        dispatch("ediblePiece", coordinate);
      }
    },
    unEdiblePieces({ commit, getters }) {
      /* Сделать все фигуры не съедобными */

      for (const coordinate in getters.pieces) {
        const piece = getters.pieces[coordinate];

        if (piece && piece.edible) {
          const properties = { edible: false };

          commit("updatePiece", { coordinate, properties });
        }
      }
    },
  },
  mutations: {
    updateGame(state, game) {
      state.game = game;
      state.loading = false;
    },
    updatePiece(state, { coordinate, properties }) {
      for (const key of Object.keys(properties)) {
        state.pieces[coordinate][key] = properties[key];
      }
    },
    createPiece(state, { coordinate, piece }) {
      state.pieces[coordinate] = piece;
    },
    removePiece(state, coordinate) {
      state.pieces[coordinate] = undefined;
    },
    updateSelectedPiece(state, piece) {
      state.selectedPiece = piece;
    },
    updateCell(state, { coordinate, properties }) {
      for (const key of Object.keys(properties)) {
        state.field[coordinate][key] = properties[key];
      }
    },
    swapColor(state) {
      state.currentColor = state.currentColor === WHITE ? BLACK : WHITE;
    },
    swapMoveOf(state) {
      state.moveOf = state.moveOf === WHITE ? BLACK : WHITE;
    }
  },
  state: {
    game: null,
    loading: true,
    currentColor: WHITE,
    moveOf: WHITE,
    field: getField(),
    pieces: pieces,
    selectedPiece: null,
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
    }
  }
}