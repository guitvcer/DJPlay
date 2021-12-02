import { LETTERS, WHITE, PIECE_Y } from "./constants";
import store from "../../store/index";
import { isCellEmpty, isCellHostile, isCoordinateValid, check, deepClone, willCheckEntail } from "./board";

function getDidPieceMove(coordinate, copyOfPieces = null) {
  /* Получить true, если фигура ранее делала ход, иначе false */

  let didPieceMove = false;

  for (const moveIndex in store.getters["chess/moves"]) {
    const move = store.getters["chess/moves"][moveIndex];
    const piece = copyOfPieces ? copyOfPieces[coordinate] : store.getters["chess/pieces"][coordinate];

    if (move.piece && move.piece.id === piece.id) {
      didPieceMove = true;
      break;
    }
  }

  return didPieceMove;
}

function availableCellsForPawn(coordinate, copyOfPieces = null) {
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
    frontY = store.getters["chess/currentColor"] === WHITE ? y + 1 : y - 1,
    frontY2 = store.getters["chess/currentColor"] === WHITE ? frontY + 1 : frontY - 1;

  availableCells.selectable.push(x + frontY);

  if (!getDidPieceMove(coordinate, copyOfPieces) && isCellEmpty(x + frontY)) {
    availableCells.selectable.push(x + frontY2);
  }

  if (isCoordinateValid(leftX + frontY) && isCellHostile(leftX + frontY)) {
    if (
      !copyOfPieces ||
      (copyOfPieces && copyOfPieces[leftX + frontY].name === "pawn")
    ) {
      availableCells.edible.push(leftX + frontY);
    }
  }
  if (isCoordinateValid(rightX + frontY) && isCellHostile(rightX + frontY)) {
    if (
      !copyOfPieces ||
      (copyOfPieces && copyOfPieces[rightX + frontY].name === "pawn")
    ) {
      availableCells.edible.push(rightX + frontY);
    }
  }

  return availableCells;
}

function availableCellsForKnight(coordinate, copyOfPieces = null) {
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
        if (isCellEmpty(sCoordinate, copyOfPieces)) {
          availableCells.selectable.push(sCoordinate);
        } else if (isCellHostile(sCoordinate, copyOfPieces)) {
          if (copyOfPieces && copyOfPieces[sCoordinate].name !== "knight") continue;
          availableCells.edible.push(sCoordinate);
        }
      }
    }
  }

  return availableCells;
}

function availableCellsByFormula(
  _formulas,
  coordinate,
  copyOfPieces = null,
  pieceName = null
) {
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
        if (isCellEmpty(coordinate, copyOfPieces)) {
          availableCells.selectable.push(coordinate);
        } else if (isCellHostile(coordinate, copyOfPieces)) {
          if (
            !copyOfPieces ||
            (copyOfPieces && (copyOfPieces[coordinate].name === "queen" || copyOfPieces[coordinate].name === pieceName))
          ) {
            availableCells.edible.push(coordinate);
          }

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

function availableCellsForRook(coordinate, copyOfPieces = null) {
  /* Получить объект из координат допустимых клеток для ладьи */

  const verticalAndHorizontalFormulas = {
    forward: (indexOfX, y, n) => LETTERS[indexOfX + n] + y,
    right: (indexOfX, y, n) => LETTERS[indexOfX] + (y + n),
    back: (indexOfX, y, n) => LETTERS[indexOfX - n] + y,
    left: (indexOfX, y, n) => LETTERS[indexOfX] + (y - n),
  }

  return availableCellsByFormula(verticalAndHorizontalFormulas, coordinate, copyOfPieces, "rook");
}

function availableCellsForBishop(coordinate, copyOfPieces = null) {
  /* Получить объект из координат допустимых клеток для слона */

  const diagonalFormulas = {
    topLeft: (indexOfX, y, n) => LETTERS[indexOfX - n] + (y + n),
    topRight: (indexOfX, y, n) => LETTERS[indexOfX + n] + (y + n),
    bottomRight: (indexOfX, y, n) => LETTERS[indexOfX + n] + (y - n),
    bottomLeft: (indexOfX, y, n) => LETTERS[indexOfX - n] + (y - n),
  }

  return availableCellsByFormula(diagonalFormulas, coordinate, copyOfPieces, "bishop");
}

function availableCellsForQueen(coordinate, copyOfPieces = null) {
  /* Получить объект из координат допустимых клеток для ферзя */

  const bishopCells = availableCellsForBishop(coordinate, copyOfPieces);
  const rookCells = availableCellsForRook(coordinate, copyOfPieces);

  return {
    selectable: bishopCells.selectable.concat(rookCells.selectable),
    edible: bishopCells.edible.concat(rookCells.edible),
  }
}

function castlingCells(copyOfPieces = null) {
  /* Получить координаты клеток доступные для рокировки */

  const castlingMoves = {};

  for (const move of store.getters["chess/moves"]) {
    if (
      move.color === store.getters["chess/currentColor"] &&
      (
        (move.longCastling || move.shortCastling) ||
        (move.piece.name === "king" && move.piece.color === store.getters["chess/currentColor"])
      )
    ) {
      return castlingMoves;
    }
  }

  if (check(deepClone(store.getters["chess/pieces"])) || copyOfPieces) {
    return castlingMoves;
  }

  let didFirstRookMove = false;
  let didSecondRookMove = false;
  const y = PIECE_Y[store.getters["chess/currentColor"]];
  const rookLeftCoordinate = 'a' + y;
  const rookRightCoordinate = 'h' + y;
  const pieces = copyOfPieces ?? store.getters["chess/pieces"];
  const king = deepClone(pieces['e' + y]);

  for (const move of store.getters["chess/moves"]) {
    if (didFirstRookMove && didSecondRookMove) return castlingMoves;

    if (move.longCastling || move.shortCastling) continue;

    if (move.piece.color === store.getters["chess/currentColor"]) {
      if (move.from_coordinate === rookLeftCoordinate) {
        didFirstRookMove = true;
      } else if (move.from_coordinate === rookRightCoordinate) {
        didSecondRookMove = true;
      }
    }
  }

  if (
    !didFirstRookMove &&
    !pieces['b' + y] &&
    !pieces['c' + y] &&
    !pieces['d' + y] &&
    (!(willCheckEntail('b' + y) && willCheckEntail('c' + y) && willCheckEntail('d' + y)))
  ) {
    const rook = deepClone(pieces[rookLeftCoordinate]);

    rook.coordinate = 'd' + y;
    king.coordinate = 'c' + y;

    castlingMoves['c' + y] = {
      king, rook, longCastling: true,
    }
  }

  if (
    !didSecondRookMove &&
    !pieces['f' + y] &&
    !pieces['g' + y] &&
    (!willCheckEntail('f' + y) && !willCheckEntail('g' + y))
  ) {
    const rook = deepClone(pieces[rookRightCoordinate]);

    rook.coordinate = 'f' + y;
    king.coordinate = 'g' + y;

    castlingMoves['g' + y] = {
      king, rook, shortCastling: true,
    }
  }

  return castlingMoves;
}

function availableCellsForKing(coordinate, copyOfPieces = null) {
  /* Получить объект из координат допустимых клеток для короля */

  const
    availableCells = {
      selectable: [],
      edible: [],
      castling: castlingCells(copyOfPieces),
    },
    x = coordinate[0],
    y = +coordinate[1],
    indexOfX = LETTERS.indexOf(x);

  for (let _indexOfX = indexOfX - 1; _indexOfX <= indexOfX + 1; _indexOfX++) {
    for (let _y = y - 1; _y <= y + 1; _y++) {
      const coordinate = LETTERS[_indexOfX] + _y;

      if (isCoordinateValid(coordinate)) {
        if (isCellEmpty(coordinate, copyOfPieces)) {
          availableCells.selectable.push(coordinate);
        } else if (isCellHostile(coordinate, copyOfPieces)) {
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