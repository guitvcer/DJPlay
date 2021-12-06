import store from "../../store/index";
import { getCookie } from "../../utilities";
import { GAME_STASUSES, WHITE, BLACK } from "./constants";
import { getLastMovesCoordinate } from "./board";

export const FIND_OPPONENT_SOCKET_URL = process.env.VUE_APP_BASE_WS_URL + "/gomoku/ws/find";

export function findOpponentSocketOnOpen() {
  store.commit("gomoku/sendFindOpponentSocket", {
    access: getCookie("access"),
  });
}

export function findOpponentSocketOnMessage(e) {
  const data = JSON.parse(e.data);

  store.commit("gomoku/updatePartyID", data["party_id"]);

  if (data["player_1"].username === store.getters.user.username) {
    store.commit("gomoku/updateOpponent", data["player_2"]);
  } else {
    store.commit("gomoku/updateOpponent", data["player_1"]);
  }

  store.commit("gomoku/closeFindOpponentSocket");
  store.commit("gomoku/openGomokuPartySocket");
}

export function findOpponentSocketOnClose(e) {
  if (e.code === 1006) {
    store.commit("createAlert", {
      title: "Соединение потеряно.",
      level: "danger",
    });
  }

  store.commit("gomoku/updateGameStatus", GAME_STASUSES.OFFLINE);
}

export const GOMOKU_PARTY_SOCKET_URL = process.env.VUE_APP_BASE_WS_URL + "/gomoku/ws/play/";

export function gomokuPartySocketOnOpen() {
  store.commit("gomoku/sendGomokuPartySocket", {
    access: getCookie("access"),
    action: "authorize"
  });
  store.dispatch("gomoku/resetBoard").then();
  store.commit("gomoku/updateGameStatus", GAME_STASUSES.ONLINE);
  store.commit("createAlert", {
    title: `Вы играете против ${store.getters["gomoku/opponent"].username}`,
    level: "simple"
  });
}

export function gomokuPartySocketOnMessage(e) {
  const data = JSON.parse(e.data);

  if (data.action === "exit") {
    if (data["player"].id === store.getters["gomoku/opponent"].id) {
      store.commit("gomoku/closeGomokuPartySocket");
      store.commit("createAlert", {
        title: "Вы выиграли. Соперник сдался.",
        level: "success",
      });
    }
  } else if (data.action === "make_move") {
    if (
      store.getters["gomoku/moves"].length === 0 &&
      data["player"].id !== store.getters.user.id
    ) {
      store.commit("gomoku/updateColor", BLACK);
    }

    store.dispatch("gomoku/selectDot", data.coordinate).then();
    store.dispatch('gomoku/swapMoveOf').then();

    if (data["row_moves"]) {
      store.commit("gomoku/closeGomokuPartySocket");

      if (data["player"].id === store.getters.user.id) {
        store.commit("createAlert", {
          title: "Вы выиграли.",
          level: "success",
        });
      } else {
        store.commit("createAlert", {
          title: "Вы проиграли.",
          level: "danger",
        });
      }

      const rowMoves = JSON.parse(data["row_moves"]);

      for (const coordinate of rowMoves) {
        store.dispatch("gomoku/rowDot", coordinate).then();
      }
    }
  } else if (data.action === "cancel_move") {
    if (data["request"]) {
      store.commit("gomoku/updateCancelingCoordinate", getLastMovesCoordinate());

      if (data["player"].id === store.getters.user.id) {
        store.commit("createAlert", {
          title: "Вы отправили запрос на отмену хода.",
          level: "simple",
        });
      } else {
        store.commit("createAlert", {
          title: "Соперник запрашивает отмену хода.",
          level: "simple",
          buttons: [
            {
              icon: "check",
              onclick: () => store.dispatch("gomoku/acceptRequest"),
            },
            {
              icon: "x",
              onclick: () => store.dispatch("gomoku/declineRequest"),
            },
          ],
        });
      }
    } else if (data["accept"]) {
      if (data["player"].id === store.getters.user.id) {
        store.commit("createAlert", {
          title: "Соперник отменил ход.",
          level: "success",
        });
      } else {
        store.commit("createAlert", {
          title: "Вы отменили ход.",
          level: "simple",
        });
      }

      store.dispatch("gomoku/cancelMove", true).then();
    } else if (data["decline"]) {
      if (data["player"].id === store.getters["gomoku/opponent"].id) {
        store.commit("createAlert", {
          title: "Вы не отменили ход.",
          level: "danger",
        });
      }
    }
  }
}

export function gomokuPartySocketOnClose(e) {
  store.commit("gomoku/updateGameStatus", GAME_STASUSES.OFFLINE);

  if ([1006, 1011].includes(e.code)) {
    store.commit("createAlert", {
      title: "Соединение потеряно.",
      level: "danger",
    });
  }

  store.commit("gomoku/updatePartyID", null);
  store.commit("gomoku/updateOpponent", null);
  store.commit("gomoku/updateColor", WHITE);
}