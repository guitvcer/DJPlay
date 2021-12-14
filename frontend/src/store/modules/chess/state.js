import { BLACK, WHITE } from "../../../scripts/chess/constants";
import { getField } from "../../../scripts/chess/board";
import getPieces from "../../../scripts/chess/pieces";

export default {
  game: null,
  loading: true,
  gameStatus: null,
  currentColor: WHITE,
  moveOf: WHITE,
  field: getField(),
  pieces: getPieces(),
  selectedPiece: null,
  selectedCell: null,
  moves: [],
  players: [
    {
      user: {
        username: "БЕЛЫЙ",
        avatar: "/media/avatars/user.png",
      },
      color: WHITE,
      secondsRemaining: 10 * 60,
      intervalHandle: null,
      eatenPieces: {
        queen: 0, knight: 0, rook: 0, bishop: 0, pawn: 0,
      },
    },
    {
      user: {
        username: "ЧЕРНЫЙ",
        avatar: "/media/avatars/user.png",
      },
      color: BLACK,
      secondsRemaining: 10 * 60,
      intervalHandle: null,
      eatenPieces: {
        queen: 0, knight: 0, rook: 0, bishop: 0, pawn: 0,
      },
    },
  ],

  findOpponentSocket: null,
  chessPartySocket: null,
  partyID: null,

  time: 0,
  stopWatchHandler: null,
  cancelingMove: null,

  party: null,

  moveSound: new Audio(process.env.VUE_APP_BASE_URL + "/media/chess/sounds/move.mp3"),
  captureSound: new Audio(process.env.VUE_APP_BASE_URL + "/media/chess/sounds/capture.mp3"),
  socialSound: new Audio(process.env.VUE_APP_BASE_URL + "/media/chess/sounds/social_notify.mp3"),
  genericSound: new Audio(process.env.VUE_APP_BASE_URL + "/media/chess/sounds/generic_notify.mp3"),
  lowTime: new Audio(process.env.VUE_APP_BASE_URL + "/media/chess/sounds/low_time.mp3"),

  drawOffered: false,
}