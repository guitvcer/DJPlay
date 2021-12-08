import store from "../../store/index";
import { getCookie } from "../../utilities";
import { GAME_STASUSES, BLACK } from "./constants";

export const FIND_OPPONENT_SOCKET_URL = process.env.VUE_APP_BASE_WS_URL + "/chess/ws/find";

export function findOpponentSocketOnOpen() {
  store.commit("chess/sendFindOpponentSocket", {
    access: getCookie("access"),
  });
}

export function findOpponentSocketOnMessage(e) {
  const data = JSON.parse(e.data);

  store.dispatch("chess/resetBoard").then();
  store.commit("chess/updatePartyID", data["party_id"]);
  store.dispatch("chess/updateWhitePlayer", data["white"]).then();
  store.dispatch("chess/updateBlackPlayer", data["black"]).then();

  if (data["black"].id === store.getters.user.id) {
    store.commit("chess/updateColor", BLACK);
  }

  store.commit("chess/closeFindOpponentSocket");
  store.commit("chess/openChessPartySocket");
}

export function findOpponentSocketOnClose(e) {
  if ([1006, 1011].includes(e.code)) {
    store.commit("createAlert", {
      title: "Соединение потеряно.",
      level: "danger",
    });
  }

  store.commit("chess/updateGameStatus", GAME_STASUSES.OFFLINE);
}

export const CHESS_PARTY_SOCKET_URL = process.env.VUE_APP_BASE_WS_URL + "/chess/ws/play/";

export function chessPartySocketOnOpen() {
  store.commit("chess/updateGameStatus", GAME_STASUSES.ONLINE);
  store.commit("chess/sendChessPartySocket", {
    access: getCookie("access"),
    action: "authorize",
  });

  const currentColor = store.getters["chess/currentColor"]
  const players = store.getters["chess/players"];
  const opponent = players[0].color === currentColor ? players[1] : players[0];

  store.commit("createAlert", {
    title: `Вы играете против ${opponent.user.username}.`,
    level: "simple",
  });
}

export function chessPartySocketOnMessage(e) {
  const data = JSON.parse(e.data);

  if (data["action"] === "offer_draw") {
    if (data["request"]) {
      if (data["player"].id === store.getters.user.id) {
        store.commit("createAlert", {
          title: "Вы отправили запрос на ничью.",
          level: "simple",
        });
      } else {
        store.commit("createAlert", {
          title: "Соперник предлагает ничью.",
          level: "simple",
          buttons: [
            {
              icon: "check",
              onclick: () => store.dispatch("chess/acceptDraw"),
            },
            {
              icon: "x",
              onclick: () => store.dispatch("chess/declineDraw"),
            },
          ],
        });
      }
    } else {
      if (data["accept"]) {
        store.commit("removeAlert", store.getters.alerts.length - 1);
        store.commit("createAlert", {
          title: "Партия завершилась ничьей.",
          level: "simple",
        });
        store.commit("chess/closeChessPartySocket");
      }
    }
  }
}

export function chessPartySocketOnClose() {
  store.commit("chess/updateGameStatus", GAME_STASUSES.FINISHED);
}