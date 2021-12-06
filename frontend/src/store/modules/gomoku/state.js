import { GAME_STASUSES, WHITE } from "../../../scripts/gomoku/constants";
import { getField } from "../../../scripts/gomoku/board";

export default {
  game: {},
  gameStatus: GAME_STASUSES.OFFLINE,
  loading: true,
  moveOf: WHITE,
  currentColor: WHITE,
  moves: [],
  field: getField(),

  findOpponentSocket: null,
  gomokuPartySocket: null,
  partyID: null,
  opponent: null,
  cancelingCoordinate: null,
  moveSound: new Audio(process.env.VUE_APP_BASE_URL + "/media/sounds/new_move.mp3"),
  party: null,
}