import { WHITE, LETTERS } from "./constants";
import store from "../../store/index";

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
    selectableCells = {
      selectable: [],
      edible: [],
    },
    x = coordinate[0],
    y = +coordinate[1],
    leftX = LETTERS[LETTERS.indexOf(x) - 1],
    rightX = LETTERS[LETTERS.indexOf(x) + 1],
    frontY = store.getters.currentColor === WHITE ? y + 1 : y - 1,
    frontY2 = store.getters.currentColor === WHITE ? frontY + 1 : frontY - 1;

  selectableCells.selectable.push(x + frontY);

  if (!getDidPieceMove(coordinate)) {
    selectableCells.selectable.push(x + frontY2);
  }

  selectableCells.edible.push(leftX + frontY);
  selectableCells.edible.push(rightX + frontY);

  return selectableCells;
}

export default {
  pawn: availableCellsForPawn,
}