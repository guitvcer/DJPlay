import { LETTERS, WHITE } from "./constants";
import store from "../../store/index";
import { isCellEmpty, isCellHostile, isCoordinateValid } from "./board";

function getDidPieceMove(coordinate) {
  /* Получить true, если фигура ранее делала ход, иначе false */

  let didPieceMove = false;

  for (const moveIndex in store.getters.moves) {
    const move = store.getters.moves[moveIndex];
    const piece = store.getters.pieces[coordinate];

    if (move.piece.id === piece.id) {
      didPieceMove = true;
      break;
    }
  }

  return didPieceMove;
}

function availableCellsForPawn(coordinate) {
  /* Получить объект из координат допустимых клеток для пешки */

  const
    availableCells = {
      selectable: [],
      edible: [],
    },
    x = coordinate[0],
    y = +coordinate[1],
    leftX = LETTERS[LETTERS.indexOf(x) - 1],
    rightX = LETTERS[LETTERS.indexOf(x) + 1],
    frontY = store.getters.currentColor === WHITE ? y + 1 : y - 1,
    frontY2 = store.getters.currentColor === WHITE ? frontY + 1 : frontY - 1;

  availableCells.selectable.push(x + frontY);

  if (!getDidPieceMove(coordinate)) {
    availableCells.selectable.push(x + frontY2);
  }

  availableCells.edible.push(leftX + frontY);
  availableCells.edible.push(rightX + frontY);

  return availableCells;
}

function availableCellsForKnight(coordinate) {
  /* Получить объект из координат доступных клеток для коня */

  const availableCells = {
    selectable: [],
    edible: [],
  }

  for (let x = -2; x <= 2; x++) {
    if (x === 0) continue;

    const yBegin = Math.abs(x) === 2 ? -1 : -2;
    const yEnd = -1 * yBegin;

    for (let y = yBegin; y <= yEnd; y += 2) {
      if (y === 0) continue;

      const sCoordinate = LETTERS[LETTERS.indexOf(coordinate[0]) + x] + (+coordinate[1] + y);

      if (isCoordinateValid(sCoordinate)) {
        if (isCellEmpty(sCoordinate)) {
          availableCells.selectable.push(sCoordinate);
        } else if (isCellHostile(sCoordinate)) {
          availableCells.edible.push(sCoordinate);
        }
      }
    }
  }

  return availableCells;
}

function availableCellsByFormula(_formulas, coordinate) {
  /* Получить объект из координат допустимых клеток по формуле */

  const
    availableCells = {
      selectable: [],
      edible: [],
    },
    x = coordinate[0],
    y = +coordinate[1],
    indexOfX = LETTERS.indexOf(x);
  let formulas = _formulas;

  for (const direction in formulas) {
    const formula = formulas[direction];

    if (!formula) continue;

    for (let n = 1; n <= 8; n++) {
      const coordinate = formula(indexOfX, y, n);

      if (isCoordinateValid(coordinate)) {
        if (isCellEmpty(coordinate)) {
          availableCells.selectable.push(coordinate);
        } else if (isCellHostile(coordinate)) {
          availableCells.edible.push(coordinate);
          formulas[direction] = false;
          break;
        } else {
          formulas[direction] = false;
          break;
        }
      }
    }
  }

  return availableCells;
}

function availableCellsForRook(coordinate) {
  /* Получить объект из координат допустимых клеток для ладьи */

  const verticalAndHorizontalFormulas = {
    forward: (indexOfX, y, n) => LETTERS[indexOfX + n] + y,
    right: (indexOfX, y, n) => LETTERS[indexOfX] + (y + n),
    back: (indexOfX, y, n) => LETTERS[indexOfX - n] + y,
    left: (indexOfX, y, n) => LETTERS[indexOfX] + (y - n),
  }

  return availableCellsByFormula(verticalAndHorizontalFormulas, coordinate);
}

function availableCellsForBishop(coordinate) {
  /* Получить объект из координат допустимых клеток для слона */

  const diagonalFormulas = {
    topLeft: (indexOfX, y, n) => LETTERS[indexOfX - n] + (y + n),
    topRight: (indexOfX, y, n) => LETTERS[indexOfX + n] + (y + n),
    bottomRight: (indexOfX, y, n) => LETTERS[indexOfX + n] + (y - n),
    bottomLeft: (indexOfX, y, n) => LETTERS[indexOfX - n] + (y - n),
  }

  return availableCellsByFormula(diagonalFormulas, coordinate);
}

function availableCellsForQueen(coordinate) {
  /* Получить объект из координат допустимых клеток для ферзя */

  const bishopCells = availableCellsForBishop(coordinate);
  const rookCells = availableCellsForRook(coordinate);

  return {
    selectable: bishopCells.selectable.concat(rookCells.selectable),
    edible: bishopCells.edible.concat(rookCells.edible),
  }
}

function availableCellsForKing(coordinate) {
  /* Получить объект из координат допустимых клеток для короля */

  const
    availableCells = {
      selectable: [],
      edible: [],
    },
    x = coordinate[0],
    y = +coordinate[1],
    indexOfX = LETTERS.indexOf(x);

  for (let _indexOfX = indexOfX - 1; _indexOfX <= indexOfX + 1; _indexOfX++) {
    for (let _y = y - 1; _y <= y + 1; _y++) {
      const coordinate = LETTERS[_indexOfX] + _y;

      if (isCoordinateValid(coordinate)) {
        if (isCellEmpty(coordinate)) {
          availableCells.selectable.push(coordinate);
        } else if (isCellHostile(coordinate)) {
          availableCells.edible.push(coordinate);
        }
      }
    }
  }

  return availableCells;
}


export default {
  pawn: availableCellsForPawn,
  knight: availableCellsForKnight,
  rook: availableCellsForRook,
  bishop: availableCellsForBishop,
  queen: availableCellsForQueen,
  king: availableCellsForKing,
}