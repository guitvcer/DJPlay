import { getField } from "./board";

export const WHITE = "white";
export const BLACK = "black";

export const PIECE_Y = {
  WHITE: 1,
  BLACK: 8,
}
export const PAWN_Y = {
  WHITE: 2,
  BLACK: 7,
}

export const FIELD = getField();

export const NUMBERS = [8, 7, 6, 5, 4, 3, 2, 1];
export const LETTERS = ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
export const COLORS = [WHITE, BLACK];

export default { WHITE, BLACK, PIECE_Y, PAWN_Y, FIELD, NUMBERS, LETTERS, COLORS };