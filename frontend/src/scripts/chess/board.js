import { NUMBERS, LETTERS } from "./constants";
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
      }
    } else {
      if (store.getters.selectedPiece) {
        if (store.getters.field[coordinate].selectable) {
          store.dispatch("movePiece", coordinate).then();
          store.commit("swapColor");
          store.commit("swapMoveOf");
        }
      }
    }
  }
}