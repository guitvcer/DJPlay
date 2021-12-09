import store from "../../store/index";
import { getCookie } from "../../utilities";
import { GAME_STASUSES, BLACK, PIECE_Y } from "./constants";
import { deepClone } from "./board";

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

  store.commit("chess/openChessPartySocket");
  store.dispatch("chess/cancelFinding").then();
}

export function findOpponentSocketOnClose(e) {
  if ([1006, 1011].includes(e.code)) {
    store.commit("createAlert", {
      title: "Соединение потеряно.",
      level: "danger",
    });
  }
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

  if (data["action"] === "make_move") {
    if (["O-O", "O-O-O"].includes(data["notation"])) {
      const y = PIECE_Y[store.getters["chess/moveOf"]];
      const kingCoordinate = 'e' + y;
      const coordinate = (data["notation"] === "O-O" ? 'g' : 'c') + y;
      const rookOldCoordinate = (data["notation"] === "O-O" ? 'h' : 'a') + y;
      const rookCoordinate = (data["notation"] === "O-O" ? 'f' : 'd') + y;

      store.commit("chess/updateSelectedPiece", store.getters["chess/pieces"][kingCoordinate]);

      let castling = {
        shortCastling: true,
      }

      if (data["notation"] === "O-O-O") {
        castling = {
          longCastling: true,
        }
      }

      castling.king = deepClone(store.getters["chess/pieces"][kingCoordinate]);
      castling.rook = deepClone(store.getters["chess/pieces"][rookOldCoordinate]);
      castling.king.coordinate = coordinate
      castling.rook.coordinate = rookCoordinate;

      store.dispatch("chess/castlingCell", { coordinate, castling, checkForCheck: false }).then();
      store.dispatch("chess/castle", coordinate).then();
    } else {
      const selectedPiece = store.getters["chess/pieces"][data["notation"][0] + data["notation"][1]];
      store.commit("chess/updateSelectedPiece", selectedPiece);
      const coordinate = data["notation"][3] + data["notation"][4];
      store.dispatch("chess/movePiece", { coordinate }).then();
    }
  } else if (data["action"] === "offer_draw") {
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
  } else if (data["action"] === "exit") {
    if (data["player"].id === store.getters.user.id) {
      store.commit("createAlert", {
        title: "Вы проиграли",
        level: "danger",
      });
      store.commit("chess/updateGameStatus", GAME_STASUSES.FINISHED);
    } else {
      store.commit("createAlert", {
        title: "Вы выиграли.",
        level: "success",
      });
      store.commit("chess/updateGameStatus", GAME_STASUSES.FINISHED);
    }
  } else if (data["action"] === "checkmate") {
    if (data["player"].id === store.getters.user.id) {
      store.commit("createAlert", {
        title: "Мат. Вы проиграли.",
        level: "danger",
      });
    } else {
      store.commit("createAlert", {
        title: "Мат. Вы выиграли.",
        level: "success",
      });
    }
    store.commit("chess/closeChessPartySocket");
  } else if (data["action"] === "stalemate") {
    store.commit("createAlert", {
      title: "Пат. Партия завершилась ничьей.",
      level: "simple",
    });
    store.commit("chess/closeChessPartySocket");
  } else if (data["action"] === "cancel_move") {
    if (data["request"]) {
      if (data["player"].id === store.getters.user.id) {
        store.commit("createAlert", {
          title: "Вы отправили запрос на отмену хода.",
          level: "simple",
        });
      } else {
        store.commit("createAlert", {
          title: "Соперника запрашивает отмену хода.",
          level: "simple",
          buttons: [
            {
              icon: "check",
              onclick: () => store.dispatch("chess/cancelMoveAccept"),
            },
            {
              icon: "x",
              onclick: () => store.dispatch("chess/cancelMoveDecline"),
            },
          ],
        });
      }

      store.commit("chess/updateCancelingMove", data["notation"]);
    } else if (data["accept"]) {
      if (data["player"].id === store.getters.user.id) {
        store.commit("createAlert", {
          title: "Соперник отменили ход.",
          level: "simple",
        });
      } else {
        store.commit("createAlert", {
          title: "Вы отменили ход.",
          level: "success",
        });
      }

      store.dispatch("chess/returnMove", { cancelIfOnline: true }).then();
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

export function chessPartySocketOnClose(e) {
  store.commit("chess/updateGameStatus", GAME_STASUSES.FINISHED);

  if ([1006, 1011].includes(e.code)) {
    store.commit("createAlert", {
      title: "Соединение потеряно.",
      level: "danger",
    });
  }
}