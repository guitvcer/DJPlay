import api from "../../api/index";
import { WHITE } from "../../scripts/chess/constants";
import { getField } from "../../scripts/chess/board";
import pieces from "../../scripts/chess/pieces";

export default {
  actions: {
    async loadChess({ commit }) {
      const response = await api.chess.load();

      commit("updateGame", response.data);
    },
    selectPiece({ dispatch, commit, getters }, coordinate) {
      dispatch("unselectPiece");

      const properties = { selected: true };
      commit("updatePiece", { coordinate, properties });
      commit("updateSelectedPiece", getters.pieces[coordinate]);
    },
    unselectPiece({ commit, getters }) {
      if (getters.selectedPiece) {
        const coordinate = getters.selectedPiece.coordinate;
        const properties = { selected: false };

        commit("updatePiece", { coordinate, properties });
        commit("updateSelectedPiece", null);
      }
    }
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
    updateSelectedPiece(state, piece) {
      state.selectedPiece = piece;
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