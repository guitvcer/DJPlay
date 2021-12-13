import { WHITE, BLACK, NUMBERS, LETTERS, PIECE_Y, GAME_STASUSES } from "./constants";
import select from "./select";
import store from "../../store/index";

export function getField() {
  /* Получить объект из всех координат поля */

  const field = {};

  for (const number of NUMBERS) {
    for (const letter of LETTERS) {
      field[letter + number] = {};
    }
  }

  return field;
}

export function onBoardClick(event) {
  /* При нажатии на доску */

  if (
    ![GAME_STASUSES.FINISHED, GAME_STASUSES.WATCH].includes(store.getters["chess/gameStatus"]) &&
    store.getters["chess/moveOf"] === store.getters["chess/currentColor"] &&
    event.target.id !== "chessBoard"
  ) {
    const coordinate = event.target.closest(".cell").id;
    const piece = store.getters["chess/pieces"][coordinate];

    if (piece) {
      if (piece.color === store.getters["chess/currentColor"]) {
        if (store.getters["chess/selectedPiece"] === piece) {
          store.dispatch("chess/unselectPiece").then();
        } else {
          store.dispatch("chess/selectPiece", piece.coordinate).then();
        }
      } else {
        if (store.getters["chess/field"][coordinate].edible) {
          if (store.getters["chess/gameStatus"] === GAME_STASUSES.ONLINE) {
            store.commit("chess/sendChessPartySocket", {
              action: "make_move",
              time: store.getters["chess/time"],
              notation: parseNotation(coordinate),
            });
          } else {
            store.dispatch("chess/movePiece", { coordinate }).then();
          }
        }
      }
    } else {
      if (store.getters["chess/selectedPiece"]) {
        if (store.getters["chess/field"][coordinate].selectable) {
          if (store.getters["chess/gameStatus"] === GAME_STASUSES.ONLINE) {
            store.commit("chess/sendChessPartySocket", {
              action: "make_move",
              time: store.getters["chess/time"],
              notation: parseNotation(coordinate),
            });
          } else {
            store.dispatch("chess/movePiece", { coordinate }).then();
          }
        } else if (store.getters["chess/field"][coordinate].castling) {
          if (store.getters["chess/gameStatus"] === GAME_STASUSES.ONLINE) {
            let notation = "O-O";

            if (coordinate[0] === 'c') {
              notation = "O-O-O";
            }

            store.commit("chess/sendChessPartySocket", {
              action: "make_move",
              time: store.getters["chess/time"],
              notation,
            });
          } else {
            store.dispatch("chess/castle", coordinate).then();
          }
        } else if (store.getters["chess/field"][coordinate].edible) {
          if (store.getters["chess/gameStatus"] === GAME_STASUSES.ONLINE) {
            store.commit("chess/sendChessPartySocket", {
              action: "make_move",
              time: store.getters["chess/time"],
              notation: parseNotation(coordinate),
            });
          } else {
            store.dispatch("chess/movePiece", { coordinate }).then();
          }
        }
      }
    }
  }
}

export function isCoordinateValid(coordinate) {
  /* Валидна ли координата? */

  return Object.keys(store.getters["chess/field"]).includes(coordinate);
}

export function isCellEmpty(coordinate, copyOfPieces = null) {
  /* Пустая ли клетка? */

  const pieces = copyOfPieces ?? store.getters["chess/pieces"];

  return !(Object.keys(pieces).includes(coordinate));
}

export function isCellHostile(coordinate, copyOfPieces = null) {
  /* Враждебная ли клетка? */

  const piece = copyOfPieces ? copyOfPieces[coordinate] : store.getters["chess/pieces"][coordinate];

  return !(isCellEmpty(coordinate) || piece.color === store.getters["chess/currentColor"]);
}

export function eatingOnAisle(coordinate, copyOfSelectedPiece = null) {
  /* Взятие на проходе? */

  const lastMove = store.getters["chess/moves"][store.getters["chess/moves"].length - 1];
  const selectedPiece = copyOfSelectedPiece ?? store.getters["chess/selectedPiece"];

  return (
    lastMove !== undefined &&
    lastMove.from_coordinate && lastMove.to_coordinate &&
    selectedPiece.name === 'pawn' &&
    isCellEmpty(coordinate) &&
    selectedPiece.coordinate[1] === lastMove.to_coordinate[1] &&
    (
      lastMove.from_coordinate[0] === lastMove.to_coordinate[0] &&
      lastMove.from_coordinate[0] === coordinate[0] &&
      lastMove.to_coordinate[0] === coordinate[0]
    ) &&
    (
      (+lastMove.from_coordinate[1] === 7 && +lastMove.to_coordinate[1] === 5 && lastMove.piece.color === BLACK) ||
      (+lastMove.from_coordinate[1] === 2 && +lastMove.to_coordinate[1] === 4 && lastMove.piece.color === WHITE)
    )
  );
}

export function check(copyOfPieces = null) {
  /* Шах? */

  let king;

  for (const piece of Object.values(copyOfPieces ?? store.getters["chess/pieces"])) {
    if (piece.color === store.getters["chess/currentColor"] && piece.name === "king") {
      king = piece;
      break;
    }
  }

  const cellsForQueen = select.queen(king.coordinate, copyOfPieces);
  const cellsForKnight = select.knight(king.coordinate, copyOfPieces);
  const cellsForPawn = select.pawn(king.coordinate, copyOfPieces);
  const dangerousCells = cellsForQueen.edible.concat(cellsForKnight.edible.concat(cellsForPawn.edible));

  return dangerousCells.length > 0;
}

export function parseTime(time) {
  let min = Math.floor(time / 60);
  let sec = time - (min * 60);

  if (min < 10) {
    min = "0" + min;
  }

  if (sec < 10) {
    sec = "0" + sec;
  }

  return min + ":" + sec;
}

export function deepClone(obj) {
  /* Глубокое копирование для объекта */

  const clObj = {};

  for (const i in obj) {
    if (obj[i] instanceof Object) {
      clObj[i] = deepClone(obj[i]);
      continue;
    }

    clObj[i] = obj[i];
  }

  return clObj;
}

export function willCheckEntail(coordinate, selectedPiece = store.getters["chess/selectedPiece"]) {
  /* Повличет ли ход фигуры на эту координату за собой шах? */

  const copyOfPieces = deepClone(store.getters["chess/pieces"]);
  const copyOfPiece = copyOfPieces[selectedPiece.coordinate];

  copyOfPiece.coordinate = coordinate;
  copyOfPieces[coordinate] = copyOfPiece;
  delete copyOfPieces[selectedPiece.coordinate];

  if (selectedPiece.name === "king") {
    const y = PIECE_Y[selectedPiece.color];

    if (coordinate === 'c' + y) {
      // Short Castling

      const copyOfRook = deepClone(copyOfPieces['a' + y]);
      copyOfRook.coordinate = 'd' + y;
      delete copyOfPieces['a' + y];
    } else if (coordinate === 'g' + y) {
      // Long Castling

      const copyOfRook = deepClone(copyOfPieces['h' + y]);
      copyOfRook.coordinate = 'f' + y;
      delete copyOfPieces['h' + y];
    }
  }

  return check(copyOfPieces);
}

function parseNotation(coordinate) {
  return store.getters["chess/selectedPiece"].coordinate + '-' + coordinate;
}

export function checkmateOrStalemate() {
  /* Проверка на мат или пат */

  if (store.getters["chess/currentColor"] === store.getters["chess/moveOf"]) {
    let availableCellsCount = 0;

    for (const piece of Object.values(store.getters["chess/pieces"])) {
      if (piece.color === store.getters["chess/currentColor"]) {
        store.commit("chess/updateSelectedPiece", piece);

        const availableCells = select[piece.name](piece.coordinate);

        for (const coordinate of availableCells.selectable) {
          try {
            if (!willCheckEntail(coordinate, piece) && store.getters["chess/pieces"][coordinate] === undefined) {
              availableCellsCount++;
            }
          } catch (e) {}
        }
        for (const coordinate of availableCells.edible) {
          try {
            if (!willCheckEntail(coordinate, piece)) {
              availableCellsCount++;
            }
          } catch (e) {}
        }
      }
    }

    if (availableCellsCount === 0) {
      const opponent = store.getters["chess/players"][store.getters["chess/waitingPlayerIndex"]];
      const currentUser = store.getters["chess/players"][store.getters["chess/movingPlayerIndex"]];

      if (check(deepClone(store.getters["chess/pieces"]))) {
        if (store.getters["chess/gameStatus"] === GAME_STASUSES.ONLINE) {
          store.commit("chess/sendChessPartySocket", {
            action: "checkmate",
          });
        } else {
          store.commit("createAlert", {
            title: `Игрок "${opponent.user.username}" поставил мат игроку "${currentUser.user.username}".`,
            level: "simple",
          });

          if (store.getters["chess/gameStatus"] !== GAME_STASUSES.WATCH) {
            store.commit("chess/updateGameStatus", GAME_STASUSES.FINISHED);
          }
        }
      } else {
        if (store.getters["chess/gameStatus"] === GAME_STASUSES.ONLINE) {
          store.commit("chess/sendChessPartySocket", {
            action: "stalemate",
          });
        } else {
          store.commit("createAlert", {
            title: `Игрок "${opponent.user.username}" поставил пат игроку "${currentUser.user.username}".`,
            level: "simple",
          });

          if (store.getters["chess/gameStatus"] !== GAME_STASUSES.WATCH) {
            store.commit("chess/updateGameStatus", GAME_STASUSES.FINISHED);
          }
        }
      }
    }
  }
}