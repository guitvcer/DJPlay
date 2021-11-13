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
  /* Сделать доску квадратным */

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
