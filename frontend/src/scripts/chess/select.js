import { WHITE, BLACK, LETTERS, PIECE_Y, PAWN_Y } from "./constants";
import store from "../../store/index";

function getSelectableCellsForPawn(coordinate, pieces, currentColor) {
  /* Получить объект из координат допустимых клеток для пешки */

  const
    selectableCells = {
      selectable: [],
      edible: [],
    },
    x = coordinate[0],
    y = +coordinate[1],
    leftX = LETTERS[LETTERS.indexOf(x) - 1],
    rightX = LETTERS[LETTERS.indexOf(x) + 1],
    frontY = currentColor === WHITE ? coordinate[1] + 1 : coordinate[1] - 1,
    frontY2 = currentColor === WHITE ? frontY + 1 : frontY - 1,
    frontCoordinate = x + frontY;

  if (
    store.dispatch("validateCoordinate", frontCoordinate) &&
    store.dispatch("checkCellForEmptiness", frontCoordinate)
  ) {
    selectableCells.selectable.push(frontCoordinate);

    if (PAWN_Y[currentColor] === y) {
      const frontCell2Coordinate = x + frontY2;

      if (
        store.dispatch("validateCoordinate", frontCell2Coordinate) &&
        store.dispatch("checkCellForEmptiness", frontCell2Coordinate)
      ) {
        selectableCells.selectable.push(frontCell2Coordinate);
      }
    }
  }

  const edibleLeftCoordinate = leftX + frontY;
  if (
    store.dispatch("validateCoordinate", edibleLeftCoordinate) &&
    store.dispatch("checkCellForHostility", edibleLeftCoordinate)
  ) {
    selectableCells.edible.push(edibleLeftCoordinate);
  }

  const edibleRightCoordinate = rightX + frontY;
  if (
    store.dispatch("validateCoordinate", edibleRightCoordinate) &&
    store.dispatch("checkCellForHostility", edibleRightCoordinate)
  ) {
    selectableCells.edible.push(edibleRightCoordinate);
  }

  return selectableCells;
}

function getSelectableCellsForKnight(coordinate) {
  /* Получить объект из координат допустимых клеток для коня */

  const selectableCells = {
    selectable: [],
    edible: [],
  };

  for (let x = -2; x <= 2; x++) {
    if (x === 0) continue;

    const yBegin = Math.abs(x) === 2 ? -1: -2;
    const yEnd = -1 * yBegin;

    for (let y = yBegin; y <= yEnd; y += 2) {
      if (y === 0) continue;

      const selectableCoordinate = LETTERS[LETTERS.indexOf(coordinate[0]) + x] + (+coordinate[1] + y);
      if (store.dispatch("validateCoordinate", selectableCoordinate)) {
        if (store.dispatch("checkCellForFriendliness", selectableCoordinate)) {
          selectableCells.selectable.push(selectableCoordinate);
        } else if (store.dispatch("checkCellForHostility", selectableCoordinate)) {
          selectableCoordinate.edible.push(selectableCoordinate)
        }
      }
    }
  }

  return selectableCells;
}

function getSelectableCellsByFormula(_formulas, coordinate) {
  /* Получить объект из координат допустимых клеток по формуле */

  const
    selectableCells = {
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

      if (store.dispatch("validateCoordinate", coordinate)) {
        if (store.dispatch("checkCellForEmptiness", coordinate)) {
          selectableCells.selectable.push(coordinate);
        } else if (store.dispatch("checkCellForHostility", coordinate)) {
          selectableCells.edible.push(coordinate);
          formulas[direction] = false;
          break;
        } else {
          formulas[direction] = false;
          break;
        }
      }
    }
  }

  return selectableCells;
}

function getSelectableCellsForRook(coordinate) {
  /* Получить объект из координат допустимых клеток для ладьи */

  const verticalAndHorizontalFormulas = {
    forward: (indexOfX, y, n) => LETTERS[indexOfX + n] + y,
    right: (indexOfX, y, n) => LETTERS[indexOfX] + (y + n),
    back: (indexOfX, y, n) => LETTERS[indexOfX - n] + y,
    left: (indexOfX, y, n) => LETTERS[indexOfX] + (y - n),
  }

  return getSelectableCellsByFormula(verticalAndHorizontalFormulas, coordinate);
}

function getSelectableCellsForBishop(coordinate) {
  /* Получить объект из координат допустимых клеток для слона */

  const diagonalFormulas = {
    topLeft: (indexOfX, y, n) => LETTERS[indexOfX - n] + (y + n),
    topRight: (indexOfX, y, n) => LETTERS[indexOfX + n] + (y + n),
    bottomRight: (indexOfX, y, n) => LETTERS[indexOfX + n] + (y - n),
    bottomLeft: (indexOfX, y, n) => LETTERS[indexOfX - n] + (y - n),
  }

  return getSelectableCellsByFormula(diagonalFormulas, coordinate);
}

function getSelectableCellsForQueen(coordinate, pieces, currentColor) {
  /* Получить объект из координат допустимых клеток для ферзя */

  const selectableCellsForRook = getSelectableCellsForRook(coordinate, pieces, currentColor);
  const selectableCellsForBishop = getSelectableCellsForBishop(coordinate, pieces, currentColor);
  return selectableCellsForRook.concat(selectableCellsForBishop);
}

function getCastlingCellsForKing(moves, pieces, currentColor, y) {
  /* Получить массив из координатов клеток доступные для рокировки */

  const castlingMoves = [];

  for (const move of moves) {
    if (move.movedFrom === `e${PIECE_Y[currentColor]}`) {
      return castlingMoves;
    } else {
      if (
        move.color === currentColor && (
          move.longCastling ||
          move.shortCastling
        )
      ) return castlingMoves;
    }
  }

  let didFirstRookMove = false;
  let didSecondRookMove = false;
  for (const move of moves) {
    const rookLeftCoordinate = `a${y}`;
    const rookRightCoordinate = `h${y}`;

    if (move.movedFrom === rookLeftCoordinate || move.movedTo === rookRightCoordinate) {
      didFirstRookMove = true;
    } else if (move.movedFrom === rookRightCoordinate || move.movedTo === rookRightCoordinate) {
      didSecondRookMove = true;
    }
  }

  if (
    !didFirstRookMove &&
    pieces[`b${y}`] == null &&
    pieces[`c${y}`] == null &&
    pieces[`d${y}`] == null
  ) {
    castlingMoves.push(`c${y}`);
  }

  if (
    !didSecondRookMove &&
    pieces[`f${y}`] == null &&
    pieces[`g${y}`] == null
  ) {
    castlingMoves.push(`g${y}`);
  }

  return castlingMoves;
}

function getSelectableCellsForKing(coordinate, pieces, moves, currentColor) {
  /* Получить объект из координат допустимых клеток для короля */

  const
    selectableCells = {
      selectable: [],
      edible: [],
      castling: [],
    },
    x = coordinate[0],
    y = +coordinate[1],
    indexOfX = LETTERS.indexOf(x);

  for (let _indexOfX = indexOfX - 1; _indexOfX <= indexOfX + 1; _indexOfX++) {
    for (let _y = y - 1; _y <= y + 1; _y++) {
      const coordinate = LETTERS[_indexOfX] + _y;

      if (store.dispatch("validateCoordinate", coordinate) && !checkForCheck(coordinate)) {
        if (store.dispatch("checkCellForEmptiness", coordinate)) {
          selectableCells.selectable.push(coordinate);
        } else if (store.dispatch("checkCellForEmptiness", coordinate)) {
          selectableCells.edible.push(coordinate);
        }
      }
    }
  }

  selectableCells.castling.concat(getCastlingCellsForKing(moves, pieces, currentColor, y));

  return selectableCells;
}

export default {
  pawn: getSelectableCellsForPawn,
  rook: getSelectableCellsForRook,
  knight: getSelectableCellsForKnight,
  bishop: getSelectableCellsForBishop,
  queen: getSelectableCellsForQueen,
  king: getSelectableCellsForKing,
}