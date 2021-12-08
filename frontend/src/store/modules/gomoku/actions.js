import api from "../../../api";
import router from "../../../router";
import { BLACK, GAME_STASUSES, WHITE } from "../../../scripts/gomoku/constants";
import { getField, getLastMovesCoordinate } from "../../../scripts/gomoku/board";
import { isAuthenticated } from "../../../utilities";
import store from "../../index";

export default {
  async loadGame({ commit }) {
    commit("updateGame", await api.gomoku.getGame());
    commit("updateLoading", false);
  },
  async loadParty({ commit }) {
    commit("updateParty", await api.gomoku.getParty(router.currentRoute.value.params.id));
  },

  swapMoveOf({ commit, getters }) {
    commit("updateMoveOf", getters.moveOf === WHITE ? BLACK : WHITE);
  },
  swapColor({ commit, getters }) {
    if (getters.gameStatus !== GAME_STASUSES.ONLINE) {
      commit("updateColor", getters.currentColor === WHITE ? BLACK : WHITE);
    }
  },

  registerMove({ dispatch, commit, getters }, coordinate) {
    /* Зарегистрировать ход */

    if (getters.gameStatus === GAME_STASUSES.ONLINE) {
      commit("sendGomokuPartySocket", {
        coordinate,
        action: "make_move",
      });
    } else {
      dispatch("selectDot", coordinate);
      dispatch("swapMoveOf");
      dispatch("swapColor");
    }
  },
  selectDot({ commit, getters }, coordinate) {
    /* Выбрать точку */

    const properties = {
      count: getters.moves.length + 1,
      color: getters.moveOf,
    }

    commit("updateCell", { properties, coordinate });
    commit("addMove", coordinate);
    commit("playMoveSound");
  },
  rowDot({ commit }, coordinate) {
    /* Указать точку как один из завершающей линии */

    commit("updateCell", { properties: { row: true }, coordinate });
  },
  unRowDots({ commit, getters }) {
    /* Указать все точки не принадлежащим завершающей линии */

    for (const move of getters.moves) {
      commit("updateCell", {
        properties: { row: false },
        coordinate: move.coordinate,
      });
    }
  },
  unselectLastDot({ commit, getters }) {
    const coordinate = getters.moves[getters.moves.length - 1].coordinate;
    const properties = {
      count: null, color: null,
    }
    commit("updateCell", { properties, coordinate });
  },
  resetBoard({ commit, getters }) {
    if (getters.gameStatus === GAME_STASUSES.ONLINE) {
      commit("createAlert", {
        title: "Во время игры нельзы сбросить доску.",
        level: "warning",
      }, { root: true });
    } else {
      commit("updateColor", WHITE);
      commit("updateMoveOf", WHITE);
      commit("clearMoves");
      commit("updateField", getField());
    }
  },
  cancelMove({ dispatch, commit, getters }, cancel_if_online = false) {
    if (getters.moves.length > 0) {
      if (getters.gameStatus !== GAME_STASUSES.ONLINE || cancel_if_online) {
        dispatch("unRowDots");

        dispatch("unselectLastDot");
        commit("removeLastMove");
        dispatch("swapMoveOf");
        dispatch("swapColor");
      } else if (getters.gameStatus === GAME_STASUSES.ONLINE) {
        commit("sendGomokuPartySocket", {
          action: "cancel_move",
          request: true,
        });
      }
    }
  },

  async findOpponent({ commit }) {
    if (!await isAuthenticated()) {
      commit("updateModalAction", "authorization", { root: true });
      commit("updateOpenModal", true, { root: true });
    } else {
      commit("updateGameStatus", GAME_STASUSES.FINDING);
      commit("openFindOpponentSocket");
    }
  },
  cancelFinding({ commit }) {
    commit("closeFindOpponentSocket");
  },
  giveUp({ commit }) {
    commit("closeGomokuPartySocket");
    commit("createAlert", {
      title: "Вы проиграли.",
      level: "danger",
    }, { root: true });
  },

  acceptRequest({ commit }) {
    if (getLastMovesCoordinate() === store.getters["gomoku/cancelingCoordinate"]) {
      commit("sendGomokuPartySocket", {
        action: "cancel_move",
        accept: true,
      });
      commit("removeAlert", null, { root: true });
    } else {
      commit("createAlert", {
        title: "Ход запрошенный на отмену уже не последний.",
        level: "warning",
      }, { root: true });
    }
  },
  declineRequest({ commit }) {
    if (getLastMovesCoordinate() === store.getters["gomoku/cancelingCoordinate"]) {
      commit("sendGomokuPartySocket", {
        action: "cancel_move",
        decline: true,
      });
      commit("removeAlert", null, { root: true });
    } else {
      commit("createAlert", {
        title: "Ход запрошенный на отмену уже не последний.",
        level: "warning",
      }, { root: true });
    }
  },

  firstMove({ dispatch, getters }) {
    dispatch("resetBoard");

    const firstMoveCoordinate = getters.party.moves[0]["coordinate"];
    dispatch("selectDot", firstMoveCoordinate);
  },
  prevMove({ dispatch, commit, getters }) {
    if (getters.moves.length > 1) {
      dispatch("swapColor");
      dispatch("swapMoveOf");
      dispatch("unselectLastDot");
      commit("removeLastMove");
    }
  },
  nextMove({ dispatch, getters }) {
    if (getters.moves.length < getters.party.moves.length) {
      const nextMoveCoordinate = getters.party.moves[getters.moves.length]["coordinate"]
      dispatch("swapMoveOf");
      dispatch("swapColor");
      dispatch("selectDot", nextMoveCoordinate);
    }
  },
  lastMove({ dispatch, commit, getters }) {
    dispatch("resetBoard");
    commit("updateColor", WHITE);
    commit("updateMoveOf", WHITE);

    for (const move of getters.party.moves) {
      dispatch("selectDot", move.coordinate);
      dispatch("swapMoveOf");
      dispatch("swapColor");
    }
  },
}