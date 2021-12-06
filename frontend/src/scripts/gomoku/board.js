import router from "../../router";
import store from "../../store/index";
import { NUMBERS, LETTERS, GAME_STASUSES } from "./constants";

export function getField() {
  const field = {};

  for (const number of NUMBERS) {
    for (const letter of LETTERS) {
      field[letter + number] = {};
    }
  }

  return field;
}

export function onBoardClick(event) {
  if (
    event.target.classList.contains("dot") &&
    store.getters["gomoku/gameStatus"] !== GAME_STASUSES.WATCH &&
    store.getters["gomoku/moveOf"] === store.getters["gomoku/currentColor"] &&
    !store.getters["gomoku/field"][event.target.id].count
  ) {
    store.dispatch("gomoku/registerMove", event.target.id).then();
  }
}

export function getLastMovesCoordinate() {
  const coordinates = Object.keys(store.getters["gomoku/moves"]);
  return coordinates[coordinates.length - 1];
}

export function focus(direction) {
  if (router.currentRoute.value.name === "gomoku") {
    let tabIndex = +document.activeElement.getAttribute("tabindex");

    if (direction === "up" && tabIndex - 15 > 3) {
      tabIndex -= 15;
    } else if (direction === "right" && tabIndex + 1 < 229) {
      tabIndex += 1;
    } else if (direction === "down" && tabIndex + 15 < 229) {
      tabIndex += 15;
    } else if (direction === "left" && tabIndex -1 > 3) {
      tabIndex -= 1;
    }

    document.querySelector(`[tabIndex="${tabIndex}"]`).focus();
  }
}