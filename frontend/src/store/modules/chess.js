import api from "../../api/index";
import { WHITE, BLACK, PIECE_Y } from "../../scripts/chess/constants";
import { getField, isCellHostile } from "../../scripts/chess/board";
import getPieces from "../../scripts/chess/pieces";
import select from "../../scripts/chess/select";

export default {
  actions: {
    async loadChess({ commit }) {
      /* Загрузить информацию о Шахматах */

      const response = await api.chess.load();

      commit("updateGame", response.data);
    },
    resetBoard({ commit }) {
      /* Сбросить доску */

      commit("resetCells");
      commit("resetPieces");
      commit("updateSelectedPiece", null);
      commit("clearMoves");
      commit("updateColor", WHITE);
      commit("updateMoveOf", WHITE);
    },
    castle({ dispatch, commit, getters }, coordinate) {
      /* Сделать рокировку */

      const castling = getters.field[coordinate].castling;
      const kingOldCoordinate = 'e' + PIECE_Y[getters.currentColor]
      const rookOldCoordinate = (castling.longCastling ? 'a' : 'h') + PIECE_Y[getters.currentColor]

      commit("removePiece", kingOldCoordinate);
      commit("removePiece", rookOldCoordinate);

      commit("createPiece", { coordinate: castling.king.coordinate, piece: castling.king });
      commit("createPiece", { coordinate: castling.rook.coordinate, piece: castling.rook });

      dispatch("unselectPiece");

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
    movePiece({ dispatch, commit, getters }, coordinate) {
      /* Двинуть фигуру */

      commit("addMove", {
        color: getters.currentColor,
        piece: getters.selectedPiece,
        from_coordinate: getters.selectedPiece.coordinate,
        to_coordinate: coordinate
      });

      const piece = getters.selectedPiece;

      dispatch("unselectPiece");
      commit("removePiece", piece.coordinate);

      piece.coordinate = coordinate;
      piece.selected = false;

      commit("createPiece", { coordinate, piece });
      dispatch("selectLastMoveCell");
    },

    selectCell({ commit }, coordinate) {
      /* Выбрать клетку */

      const properties = { selectable: true };

      commit("updateCell", { coordinate, properties });
    },
    selectCells({ dispatch }, cellsIds) {
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

        commit("updateCell", { coordinate: lastMove.from_coordinate, properties });
        commit("updateCell", { coordinate: lastMove.to_coordinate, properties });
      }
    },
    castlingCell({ commit, getters }, { coordinate, castling }) {
      const properties = { castling };

      commit("updateCell", { coordinate, properties })
    },
    castlingCells({ dispatch }, castling) {
      if (castling) {
        for (const coordinate of Object.keys(castling)) {
          dispatch("castlingCell", { coordinate, castling: castling[coordinate] });
        }
      }
    },

    ediblePiece({ dispatch, commit, getters }, coordinate) {
      /* Сделать фигуру съедобным */

      if (isCellHostile(coordinate)) {
        const properties = { edible: true };

        commit("updatePiece", { coordinate, properties });
      }
    },
    ediblePieces({ dispatch }, cellsIds) {
      /* Сделать фигуры съедобными */

      for (const coordinate of cellsIds) {
        dispatch("ediblePiece", coordinate);
      }
    },
    unediblePieces({ commit, getters }) {
      /* Сделать все фигуры не съедобными */

      for (const coordinate in getters.pieces) {
        const piece = getters.pieces[coordinate];

        if (piece.edible) {
          const properties = { edible: false };

          commit("updatePiece", { coordinate, properties });
        }
      }
    },
  },
  mutations: {
    updateGame(state, game) {
      state.game = game;
      state.loading = false;
    },

    createPiece(state, { coordinate, piece }) {
      state.pieces[coordinate] = piece;
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

    swapColor(state) {
      state.currentColor = state.currentColor === WHITE ? BLACK : WHITE;
    },
    updateColor(state, color) {
      state.currentColor = color;
    },

    swapMoveOf(state) {
      state.moveOf = state.moveOf === WHITE ? BLACK : WHITE;
    },
    updateMoveOf(state, color) {
      state.moveOf = color;
    },

    addMove(state, move) {
      state.moves.push(move);
    },
    clearMoves(state) {
      state.moves = [];
    },
  },
  state: {
    game: null,
    loading: true,
    currentColor: WHITE,
    moveOf: WHITE,
    field: getField(),
    pieces: getPieces(),
    selectedPiece: null,
    moves: [],
  },
  getters: {
    game(state) {
      return state.game;
    },
    loading(state) {
      return state.loading;
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
    moves(state) {
      return state.moves;
    }
  }
}