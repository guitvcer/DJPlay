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

  data["white"].avatar = process.env.VUE_APP_BASE_URL + data["white"].avatar;
  data["black"].avatar = process.env.VUE_APP_BASE_URL + data["black"].avatar;

  store.dispatch("chess/updateWhitePlayer", data["white"]).then();
  store.dispatch("chess/updateBlackPlayer", data["black"]).then();

  if (data["black"].id === store.getters.user.id) {
    store.commit("chess/updateColor", BLACK);
  }

  store.commit("chess/openChessPartySocket");
  store.dispatch("chess/cancelFinding").then();
  store.commit("chess/playGenericSound");
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
      const coordinate = data["notation"][3] + data["notation"][4];

      if (
        selectedPiece.name === "pawn" &&
        selectedPiece.coordinate[0] !== coordinate[0] &&
        !store.getters["chess/pieces"][coordinate]
      ) {
        store.commit("chess/updateCell", {
          coordinate,
          properties: {
            edible: store.getters["chess/pieces"][coordinate[0] + selectedPiece.coordinate[1]],
          }
        });
      }

      store.commit("chess/updateSelectedPiece", selectedPiece);

      if (data["notation"].length >= 7) {
        store.dispatch("chess/movePiece", { coordinate, pawnTo: data["notation"].split("=")[1]}).then();
      } else {
        store.dispatch("chess/movePiece", { coordinate }).then();
      }
    }
  } else if (data["action"] === "offer_draw") {
    if (data["request"]) {
      if (data["player"].id === store.getters.user.id) {
        store.commit("createAlert", {
          title: "Вы отправили запрос на ничью.",
          level: "simple",
        });
      } else {
        store.commit("chess/playSocialSound");
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
      store.commit("chess/playMoveSound");

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
        title: "Вы проиграли.",
        level: "danger",
      });
    } else {
      store.commit("createAlert", {
        title: "Вы выиграли. Соперник вышел из игры.",
        level: "success",
      });
    }

    store.commit("chess/closeChessPartySocket");
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
        store.commit("chess/playSocialSound");
        store.commit("createAlert", {
          title: "Соперник запрашивает отмену хода.",
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
      store.commit("chess/playMoveSound");

      if (data["player"].id === store.getters.user.id) {
        store.commit("createAlert", {
          title: "Соперник отменил ход.",
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
  } else if (data["action"] === "give_up") {
    if (data["player"].id === store.getters.user.id) {
      store.commit("createAlert", {
        title: "Вы проиграли. Вы сдались.",
        level: "danger",
      });
    } else {
      store.commit("createAlert", {
        title: "Вы выиграли. Соперник сдался.",
        level: "success",
      });
    }

    store.commit("chess/closeChessPartySocket");
  } else if (data["action"] === "timed_out") {
    if (data["player"].id === store.getters.user.id) {
      store.commit("createAlert", {
        title: "Вы проиграли. Закончилось время.",
        level: "danger",
      });
    } else {
      store.commit("createAlert", {
        title: "Вы выиграли. Закончилось время.",
        level: "success",
      });
    }

    store.commit("chess/closeChessPartySocket");
  }
}

export function chessPartySocketOnClose(e) {
  store.commit("chess/updateGameStatus", GAME_STASUSES.FINISHED);
  store.commit("chess/playGenericSound");

  if ([1006, 1011].includes(e.code)) {
    store.commit("createAlert", {
      title: "Соединение потеряно.",
      level: "danger",
    });
  }
}