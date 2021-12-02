import { NUMBERS, LETTERS } from "./constants";

export function getField() {
  const field = {};

  for (const number of NUMBERS) {
    for (const letter of LETTERS) {
      field[letter + number] = {};
    }
  }

  return field;
}