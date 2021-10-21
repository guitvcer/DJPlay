import { LETTERS, NUMBERS } from "./constants";

export function getField() {
  /* Получить объект из всех координат поля */

  let field = {};

  for (let numberIndex in NUMBERS) {
    for (let letterIndex in LETTERS) {
      const number = NUMBERS[numberIndex];
      const letter = LETTERS[letterIndex];
      field[letter + number] = {};
    }
  }

  return field;
}

export function resizeChessBoard() {
  /* Приравнить высоту поля ширине */

  try {
    const chessBoard = document.querySelector("#chessBoard");

    chessBoard.setAttribute("style",
      "height: " + chessBoard.offsetWidth + "px"
    )
  } catch (e) {}
}

export default { getField, resizeChessBoard };