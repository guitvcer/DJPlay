import api from "../../api/index";
import router from "../../router";
import { isAuthenticated } from "../../utilities";
import {getField, getLastMovesCoordinate} from "../../scripts/gomoku/board";
import { WHITE, BLACK, GAME_STASUSES } from "../../scripts/gomoku/constants";
import {
  FIND_OPPONENT_SOCKET_URL,
  findOpponentSocketOnOpen,
  findOpponentSocketOnMessage,
  findOpponentSocketOnClose,
  GOMOKU_PARTY_SOCKET_URL,
  gomokuPartySocketOnOpen,
  gomokuPartySocketOnMessage,
  gomokuPartySocketOnClose,
} from "../../scripts/gomoku/socket";
import store from "../index";

export default {
  namespaced: true,
  actions: {
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

          dispatch("unselectDot");
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
      commit("updateColor", WHITE);
      commit("updateMoveOf", WHITE);

      for (const move of getters.party.moves) {
        dispatch("selectDot", move.coordinate);
        dispatch("swapMoveOf");
        dispatch("swapColor");
      }
    },
  },
  mutations: {
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
    }
  },
  state: {
    game: {},
    gameStatus: GAME_STASUSES.OFFLINE,
    loading: true,
    moveOf: WHITE,
    currentColor: WHITE,
    moves: [],
    field: getField(),

    findOpponentSocket: null,
    gomokuPartySocket: null,
    partyID: null,
    opponent: null,
    cancelingCoordinate: null,
    moveSound: new Audio(process.env.VUE_APP_BASE_URL + "/media/sounds/new_move.mp3"),
    party: null,
  },
  getters: {
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
  },
}