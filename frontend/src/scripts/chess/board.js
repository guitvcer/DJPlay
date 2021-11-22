import { WHITE, BLACK, NUMBERS, LETTERS } from "./constants";
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

function squareBoard() {
  /* Сделать доску квадратной */

  const board = document.getElementById("chessBoard");

  if (board.offsetWidth !== board.offsetHeight) {
    board.style.height = board.offsetWidth + "px";
    squareBoard();
  } else {
    if (board.offsetHeight > window.innerHeight) {
      board.style.width = window.innerHeight - 200 + "px";
      board.style.height = window.innerHeight - 200 + "px";
    } else if (board.offsetHeight + 200 < window.innerHeight) {
      board.removeAttribute("style");
      board.style.height = board.offsetWidth + "px";
    }
  }
}

export function onResizeBoard() {
  /* Сделать доску квадратным при изменении размера окна */

  squareBoard();
  window.addEventListener("resize", squareBoard);
}

export function onBoardClick(event) {
  /* При нажатии на доску */

  if (
    store.getters.moveOf === store.getters.currentColor &&
    event.target.id !== "chessBoard"
  ) {
    const coordinate = event.target.closest(".cell").id;
    const piece = store.getters.pieces[coordinate];

    if (piece) {
      if (piece.color === store.getters.currentColor) {
        if (store.getters.selectedPiece === piece) {
          store.dispatch("unselectPiece").then();
        } else {
          store.dispatch("selectPiece", piece.coordinate).then();
        }
      } else {
        if (store.getters.field[coordinate].edible) {
          // store.commit("removePiece", store.getters.field[coordinate].edible.coordinate);
          store.dispatch("movePiece", coordinate).then();
        }
      }
    } else {
      if (store.getters.selectedPiece) {
        if (store.getters.field[coordinate].selectable) {
          store.dispatch("movePiece", coordinate).then();
        } else if (store.getters.field[coordinate].castling) {
          store.dispatch("castle", coordinate).then();
        } else if (store.getters.field[coordinate].edible) {
          // store.commit("removePiece", store.getters.field[coordinate].edible.coordinate);
          store.dispatch("movePiece", coordinate).then();
        }
      }
    }
  }
}

export function isCoordinateValid(coordinate) {
  /* Валидна ли координата? */

  return Object.keys(store.getters.field).includes(coordinate);
}

export function isCellEmpty(coordinate) {
  /* Пустая ли клетка? */

  return !(Object.keys(store.getters.pieces).includes(coordinate));
}

export function isCellHostile(coordinate) {
  /* Враждебная ли клетка? */

  return !(isCellEmpty(coordinate) || store.getters.pieces[coordinate].color === store.getters.currentColor);
}

export function eatingOnAisle(coordinate) {
  /* Взятие на проходе? */

  const lastMove = store.getters.moves[store.getters.moves.length - 1];

  return (
    lastMove !== undefined &&
    lastMove.from_coordinate && lastMove.to_coordinate &&
    store.getters.selectedPiece.name === 'pawn' &&
    isCellEmpty(coordinate) &&
    store.getters.selectedPiece.coordinate[1] === lastMove.to_coordinate[1] &&
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
