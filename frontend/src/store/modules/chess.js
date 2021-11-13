import api from "../../api/index";
import { WHITE } from "../../scripts/chess/constants";

export default {
  actions: {
    async loadChess({ commit }) {
      const response = await api.chess.load();

      commit("updateGame", response.data);
    }
  },
  mutations: {
    updateGame(state, game) {
      state.game = game;
      state.loading = false;
    }
  },
  state: {
    game: null,
    loading: true,
    currentColor: WHITE,
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
    }
  }
}