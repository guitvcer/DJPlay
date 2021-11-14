import { WHITE, LETTERS } from "./constants";
import store from "../../store/index";
import {isCoordinateValid, isCellHostile, isCellEmpty} from "./board";

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
  /* Получить объект из координат доступных клеток для кноя */

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

export default {
  pawn: availableCellsForPawn,
  knight: availableCellsForKnight,
}