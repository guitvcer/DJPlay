import { WHITE, BLACK, NUMBERS, LETTERS, PIECE_Y } from "./constants";
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

export function isCellEmpty(coordinate, copyOfPieces = null) {
  /* Пустая ли клетка? */

  const pieces = copyOfPieces ?? store.getters.pieces;

  return !(Object.keys(pieces).includes(coordinate));
}

export function isCellHostile(coordinate, copyOfPieces = null) {
  /* Враждебная ли клетка? */

  const piece = copyOfPieces ? copyOfPieces[coordinate] : store.getters.pieces[coordinate];

  return !(isCellEmpty(coordinate) || piece.color === store.getters.currentColor);
}

export function eatingOnAisle(coordinate, copyOfSelectedPiece = null) {
  /* Взятие на проходе? */

  const lastMove = store.getters.moves[store.getters.moves.length - 1];
  const selectedPiece = copyOfSelectedPiece ?? store.getters.selectedPiece;

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

  for (const piece of Object.values(copyOfPieces ?? store.getters.pieces)) {
    if (piece.color === store.getters.currentColor && piece.name === "king") {
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

export function willCheckEntail(coordinate) {
  /* Повличет ли ход фигуры на эту координату за собой шах? */

  const copyOfPieces = deepClone(store.getters.pieces);
  const copyOfPiece = copyOfPieces[store.getters.selectedPiece.coordinate];

  copyOfPiece.coordinate = coordinate;
  copyOfPieces[coordinate] = copyOfPiece;
  delete copyOfPieces[store.getters.selectedPiece.coordinate];

  if (store.getters.selectedPiece.name === "king") {
    const y = PIECE_Y[store.getters.selectedPiece.color];

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