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
}