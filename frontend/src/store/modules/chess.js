import api from "../../api/index";
import { WHITE, BLACK, PIECE_Y, GAME_STASUSES } from "../../scripts/chess/constants";
import {
  getField,
  isCellEmpty,
  isCellHostile,
  eatingOnAisle,
  check,
  willCheckEntail
} from "../../scripts/chess/board";
import getPieces from "../../scripts/chess/pieces";
import select from "../../scripts/chess/select";

export default {
  actions: {
    async loadChess({ commit }) {
      /* Загрузить информацию о Шахматах */

      commit("updateGame", await api.chess.getGame());
    },

    swapMoveOf({ dispatch, commit, getters }) {
      commit("updateMoveOf", getters.moveOf === WHITE ? BLACK : WHITE);

      dispatch("startCountdown", getters.movingPlayerIndex);
      dispatch("pauseCountdown", getters.waitingPlayerIndex);
    },
    swapColor({ commit, getters }) {
      commit("updateColor", getters.currentColor === WHITE ? BLACK : WHITE);
    },

    resetBoard({ commit, getters }) {
      /* Сбросить доску */

      commit("resetCells");
      commit("resetPieces");
      commit("updateSelectedPiece", null);
      commit("clearMoves");
      commit("updateColor", WHITE);
      commit("updateMoveOf", WHITE);
      commit("updateGameStatus", null);

      for (const playerIndex in getters.players) {
        commit("resetSecondsRemaining", playerIndex);
        commit("updateIntervalHandle", { playerIndex });

        const eatenPieces = getters.players[playerIndex].eatenPieces;
        commit("updatePlayerEatenPieces", {
          playerIndex,
          queen: -1 * eatenPieces.queen,
          knight: -1 * eatenPieces.knight,
          rook: -1 * eatenPieces.rook,
          bishop: -1 * eatenPieces.bishop,
          pawn: -1 * eatenPieces.pawn,
        });
      }
    },
    returnMove({ dispatch, commit, getters }) {
      /* Отменить предыдущий ход */

      if (getters.moves.length > 0 && getters.gameStatus === GAME_STASUSES.OFFLINE) {
        const lastMove = getters.moves[getters.moves.length - 1];

        for (let piece of Object.values(getters.pieces)) {
          if (lastMove.shortCastling || lastMove.longCastling || piece.id === lastMove.piece.id) {
            dispatch("unselectPiece");
            dispatch("unselectLastMoveCells");
            dispatch("unselectCheckingCells");
            commit("deleteLastMove");

            if (lastMove.shortCastling || lastMove.longCastling) {
              let castledKingCoordinate;
              if (lastMove.shortCastling) {
                castledKingCoordinate = 'g' + PIECE_Y[lastMove.color]
                const castledRookCoordinate = 'f' + PIECE_Y[lastMove.color];
                const castledRook = getters.pieces[castledRookCoordinate];

                castledRook.coordinate = 'h' + PIECE_Y[lastMove.color];
                commit("createPiece", castledRook);
                commit("removePiece", castledRookCoordinate);
              } else {
                castledKingCoordinate = 'c' + PIECE_Y[lastMove.color]
                const castledRookCoordinate = 'd' + PIECE_Y[lastMove.color];
                const castledRook = getters.pieces[castledRookCoordinate];

                castledRook.coordinate = 'a' + PIECE_Y[lastMove.color];
                commit("createPiece", castledRook);
                commit("removePiece", castledRookCoordinate);
              }

              const king = getters.pieces[castledKingCoordinate];
              king.coordinate = 'e' + PIECE_Y[lastMove.color];
              commit("createPiece", king);
              commit("removePiece", castledKingCoordinate);
            } else if (piece.id === lastMove.piece.id) {
              commit("removePiece", lastMove.to_coordinate);

              piece.coordinate = lastMove.from_coordinate;

              if (lastMove.transformed) {
                piece.name = "pawn";
                piece.image = "/media/chess/pieces/" + piece.color + "/pawn.png";
              }

              commit("createPiece", piece);

              if (lastMove.eatenPiece) {
                commit("createPiece", lastMove.eatenPiece);
                commit("updatePlayerEatenPieces", {
                  playerIndex: getters.waitingPlayerIndex,
                  [lastMove.eatenPiece.name]: -1,
                });
              }
            }

            if (getters.moves.length > 0) {
              dispatch("selectLastMoveCell");
            }

            dispatch("swapMoveOf");
            dispatch("swapColor");

            check();

            break;
          }
        }
      }
    },
    castle({ dispatch, commit, getters }, coordinate) {
      /* Сделать рокировку */

      const castling = getters.field[coordinate].castling;
      const kingOldCoordinate = 'e' + PIECE_Y[getters.currentColor];
      const rookOldCoordinate = (castling.longCastling ? 'a' : 'h') + PIECE_Y[getters.currentColor];

      dispatch("unselectPiece");

      commit("removePiece", kingOldCoordinate);
      commit("removePiece", rookOldCoordinate);

      commit("createPiece", castling.king);
      commit("createPiece", castling.rook);


      const move = {
        color: getters.currentColor,
      }

      if (castling.longCastling) {
        move.longCastling = true;
      } else if (castling.shortCastling) {
        move.shortCastling = true;
      }

      commit("addMove", move);

      dispatch("selectLastMoveCell", [kingOldCoordinate, rookOldCoordinate]);
      dispatch("unselectCheckingCells");

      dispatch("swapMoveOf");
      dispatch("swapColor");

      check();
    },

    startCountdown({ dispatch, commit, getters }, playerIndex) {
      /* Начать/продолжить отсчет */

      const intervalHandle = setInterval(() => {
        if (getters.players[playerIndex].secondsRemaining === 0) {
          const winnerUsername = getters.players[playerIndex === 0 ? 1 : 0].user.username;
          const loserUsername = getters.players[playerIndex].user.username;

          commit("createAlert", {
            title: `Игрок "${winnerUsername}" выиграл. У игрока "${loserUsername}" закончилось время.`,
            level: "simple",
          }, { root: true });
        }

        commit("updateSecondsRemaining", playerIndex);
      }, 1000);

      commit("updateIntervalHandle", { playerIndex, intervalHandle });
    },
    pauseCountdown({ commit }, playerIndex) {
      /* Остановить отсчет */

      commit("updateIntervalHandle", { playerIndex });
    },

    selectPiece({ dispatch, commit, getters }, coordinate) {
      /* Выбрать фигуру */

      dispatch("unselectPiece");

      const properties = { selected: true };
      commit("updatePiece", { coordinate, properties });
      commit("updateSelectedPiece", getters.pieces[coordinate]);

      const piece = getters.pieces[coordinate];
      const availableCellsIds = select[piece.name](piece.coordinate);

      dispatch("selectCells", availableCellsIds.selectable);
      dispatch("ediblePieces", availableCellsIds.edible);
      dispatch("castlingCells", availableCellsIds.castling);
    },
    unselectPiece({ dispatch, commit, getters }) {
      /* Убрать выделение фигуры и доступные для него клетки */

      if (getters.selectedPiece) {
        const coordinate = getters.selectedPiece.coordinate;
        const properties = { selected: false };

        commit("updatePiece", { coordinate, properties });
        commit("updateSelectedPiece", null);

        dispatch("unselectCells");
        dispatch("unediblePieces");
      }
    },
    movePiece({ dispatch, commit, getters }, { coordinate, pawnTo = null }) {
      /* Двинуть фигуру */

      if (
        pawnTo == null && getters.selectedPiece.name === "pawn" &&
        +coordinate[1] === PIECE_Y[getters.currentColor === BLACK ? WHITE : BLACK]
      ) {
        commit("updateSelectedCell", coordinate);
        commit("updateModalAction", "transformPawn", { root: true});
        commit("updateOpenModal", true, { root: true });

        return;
      }

      const newMove = {
        color: getters.currentColor,
        piece: getters.selectedPiece,
        from_coordinate: getters.selectedPiece.coordinate,
        to_coordinate: coordinate,
      };

      if (getters.field[coordinate].edible) {
        commit("updatePlayerEatenPieces", { playerIndex: getters.movingPlayerIndex, [getters.pieces[coordinate].name]: 1 });
        newMove.eatenPiece = getters.field[coordinate].edible;
        commit("removePiece", newMove.eatenPiece.coordinate);
      }

      const piece = getters.selectedPiece;

      dispatch("unselectPiece");
      commit("removePiece", piece.coordinate);

      piece.coordinate = coordinate;
      piece.selected = false;

      if (pawnTo) {
        newMove.transformed = true;
        piece.name = pawnTo;
        piece.image = '/media/chess/pieces/' + piece.color + '/' + pawnTo + '.png';
        commit("updateOpenModal", false, { root: true });
      }

      commit("createPiece", piece);

      commit("addMove", newMove);

      dispatch("selectLastMoveCell");
      dispatch("unselectCheckingCells");

      dispatch("swapMoveOf");
      dispatch("swapColor");

      check();
    },
    checkPiece({ commit }, coordinate) {
      const properties = { check: true };

      commit("updatePiece", { coordinate, properties });
    },

    selectCell({ commit }, coordinate) {
      /* Выбрать клетку */

      if (isCellEmpty(coordinate) && !willCheckEntail(coordinate)) {
        const properties = { selectable: true };

        commit("updateCell", { coordinate, properties });
      }
    },
    selectCells({ dispatch, getters }, cellsIds) {
      /* Выбрать клетки */

      for (const coordinate of cellsIds) {
        dispatch("selectCell", coordinate);
      }
    },
    unselectCells({ commit, getters }) {
      /* Убрать выделение со всех клеток */

      for (const coordinate in getters.field) {
        const cell = getters.field[coordinate];

        if (cell.selectable || cell.castling) {
          const properties = { selectable: false, castling: false };

          commit("updateCell", { coordinate, properties });
        }
      }
    },
    unselectCheckingCells({ commit, getters }) {
      /* Убрать выделение с фигур, которые дают шах */

      for (const coordinate in getters.pieces) {
        if (getters.pieces[coordinate].check) {
          const properties = { check: false };

          commit("updatePiece", { coordinate, properties });
        }
      }
    },
    unselectLastMoveCells({ commit, getters }) {
      /* Убрать выделение с клеток последнего хода */

      for (const coordinate in getters.field) {
        const cell = getters.field[coordinate];

        if (cell.lastMoveCell) {
          const properties = { lastMoveCell: false };

          commit("updateCell", { coordinate, properties });
        }
      }
    },
    selectLastMoveCell({ dispatch, commit, getters }, coordinates = null) {
      /* Выделить клетки последнего(нового) хода */

      dispatch("unselectLastMoveCells");

      const properties = { lastMoveCell: true };

      if (coordinates) {
        for (const coordinate of coordinates) {
          commit("updateCell", { coordinate, properties });
        }
      } else {
        const lastMove = getters.moves[getters.moves.length - 1];

        if (lastMove.shortCastling) {
          commit("updateCell", { coordinate: 'e' + PIECE_Y[lastMove.color], properties });
          commit("updateCell", { coordinate: 'h' + PIECE_Y[lastMove.color], properties });
        } else if (lastMove.longCastling) {
          commit("updateCell", { coordinate: 'e' + PIECE_Y[lastMove.color], properties });
          commit("updateCell", { coordinate: 'a' + PIECE_Y[lastMove.color], properties });
        } else {
          commit("updateCell", { coordinate: lastMove.from_coordinate, properties });
          commit("updateCell", { coordinate: lastMove.to_coordinate, properties });
        }
      }
    },
    castlingCell({ commit, getters }, { coordinate, castling }) {
      /* Сделать клетку доступным для рокировки */

      if (!willCheckEntail(coordinate)) {
        const properties = { castling };

        commit("updateCell", { coordinate, properties })
      }
    },
    castlingCells({ dispatch }, castling) {
      /* Сделать клетки доступными для рокировки */

      if (castling) {
        for (const coordinate of Object.keys(castling)) {
          dispatch("castlingCell", { coordinate, castling: castling[coordinate] });
        }
      }
    },

    ediblePiece({ dispatch, commit, getters }, coordinate) {
      /* Сделать фигуру съедобным */

      if (isCellHostile(coordinate)) {
        const properties = { edible: getters.pieces[coordinate] };

        commit("updateCell", { coordinate, properties });
      } else if (eatingOnAisle(coordinate)) {
        const properties = { edible: getters.moves[getters.moves.length - 1].piece };

        commit("updateCell", { coordinate, properties });
      }
    },
    ediblePieces({ dispatch }, coordinates) {
      /* Сделать фигуры съедобными */

      for (const coordinate of coordinates) {
        dispatch("ediblePiece", coordinate);
      }
    },
    unediblePieces({ commit, getters }) {
      /* Сделать все фигуры не съедобными */

      for (const coordinate in getters.field) {
        const piece = getters.field[coordinate];

        if (piece.edible) {
          const properties = { edible: false };

          commit("updateCell", { coordinate, properties });
        }
      }
    },
  },
  mutations: {
    updateGame(state, game) {
      state.game = game;
      state.loading = false;
    },
    updateGameStatus(state, gameStatus) {
      state.gameStatus = gameStatus;
    },

    createPiece(state, piece) {
      state.pieces[piece.coordinate] = piece;
    },
    updatePiece(state, { coordinate, properties }) {
      for (const key of Object.keys(properties)) {
        state.pieces[coordinate][key] = properties[key];
      }
    },
    updateSelectedPiece(state, piece) {
      state.selectedPiece = piece;
    },
    removePiece(state, coordinate) {
      delete state.pieces[coordinate];
    },
    resetPieces(state) {
      state.pieces = getPieces();
    },

    updateCell(state, { coordinate, properties }) {
      for (const key of Object.keys(properties)) {
        state.field[coordinate][key] = properties[key];
      }
    },
    resetCells(state) {
      state.field = getField();
    },
    updateSelectedCell(state, coordinate) {
      state.selectedCell = coordinate;
    },

    updateColor(state, color) {
      state.currentColor = color;
    },
    updateMoveOf(state, color) {
      state.moveOf = color;
    },

    addMove(state, move) {
      if (state.moves.length === 0) {
        state.gameStatus = GAME_STASUSES.OFFLINE;
      }

      state.moves.push(move);
    },
    deleteLastMove(state) {
      state.moves.pop();
    },
    clearMoves(state) {
      state.moves = [];
    },

    updateSecondsRemaining(state, playerIndex) {
      if (state.players[playerIndex].secondsRemaining === 0) {
        state.gameStatus = GAME_STASUSES.FINISHED;
        clearInterval(state.players[playerIndex].intervalHandle);
      } else {
        state.players[playerIndex].secondsRemaining--;
      }
    },
    resetSecondsRemaining(state, playerIndex) {
      state.players[playerIndex].secondsRemaining = 10 * 60;
    },
    updateIntervalHandle(state, { playerIndex, intervalHandle = null }) {
      if (intervalHandle) {
        state.players[playerIndex].intervalHandle = intervalHandle;
      } else {
        clearInterval(state.players[playerIndex].intervalHandle);
      }
    },

    updatePlayerEatenPieces(state, { playerIndex, queen = 0, knight = 0, rook = 0, bishop = 0, pawn = 0}) {
      state.players[playerIndex].eatenPieces.queen += queen;
      state.players[playerIndex].eatenPieces.knight += knight;
      state.players[playerIndex].eatenPieces.rook += rook;
      state.players[playerIndex].eatenPieces.bishop += bishop;
      state.players[playerIndex].eatenPieces.pawn += pawn;
    }
  },
  state: {
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
      }
    ],
  },
  getters: {
    game(state) {
      return state.game;
    },
    loading(state) {
      return state.loading;
    },
    gameStatus(state) {
      return state.gameStatus;
    },
    currentColor(state) {
      return state.currentColor;
    },
    moveOf(state) {
      return state.moveOf;
    },
    field(state) {
      return state.field;
    },
    pieces(state) {
      return state.pieces;
    },
    selectedPiece(state) {
      return state.selectedPiece;
    },
    selectedCell(state) {
      return state.selectedCell;
    },
    moves(state) {
      return state.moves;
    },
    players(state) {
      return state.players;
    },
    movingPlayerIndex(state) {
      return state.players[0].color === state.moveOf ? 0 : 1;
    },
    waitingPlayerIndex(state) {
      return state.players[0].color === state.moveOf ? 1 : 0;
    },
  }
}