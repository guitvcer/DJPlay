import api from "../../../api";
import router from "../../../router";
import { isAuthenticated } from "../../../utilities";
import { LETTERS, BLACK, GAME_STASUSES, PIECE_Y, WHITE } from "../../../scripts/chess/constants";
import {
  check,
  eatingOnAisle,
  isCellEmpty,
  isCellHostile,
  willCheckEntail,
  checkmateOrStalemate,
  getField, deepClone,
} from "../../../scripts/chess/board";
import select from "../../../scripts/chess/select";
import getPieces from "../../../scripts/chess/pieces";

export default {
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
    if (getters.gameStatus !== GAME_STASUSES.ONLINE) {
      commit("updateColor", getters.currentColor === WHITE ? BLACK : WHITE);
    }
  },

  resetBoard({ dispatch, commit, getters }) {
    /* Сбросить доску */

    if (getters.gameStatus === GAME_STASUSES.ONLINE) {
      commit("createAlert", {
        title: "Во время игры нельзя сбросить доску.",
        level: "warning",
      }, { root: true });
    } else {
      commit("resetCells");
      commit("resetPieces");
      commit("updateSelectedPiece", null);
      commit("clearMoves");
      commit("updateColor", WHITE);
      commit("updateMoveOf", WHITE);
      commit("updateGameStatus", null);
      dispatch("stopStopwatch");

      const avatarURL = "/media/avatars/user.png";

      dispatch("updateWhitePlayer", {
        username: "БЕЛЫЙ", avatar: avatarURL,
      });
      dispatch("updateBlackPlayer", {
        username: "ЧЕРНЫЙ", avatar: avatarURL,
      });

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
    }
  },
  returnMove({ dispatch, commit, getters }, { cancelIfOnline = false }) {
    /* Отменить предыдущий ход */

    if (getters.moves.length > 0) {
      if (
        [GAME_STASUSES.OFFLINE, GAME_STASUSES.FINDING, GAME_STASUSES.WATCH].includes(getters.gameStatus) ||
        (getters.gameStatus === GAME_STASUSES.ONLINE && cancelIfOnline)
      ) {
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
                piece.image = "/media/chess/pieces/" + piece.color + "/pawn.svg";
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
      } else if (getters.gameStatus === GAME_STASUSES.ONLINE) {
        const lastMove = getters.moves[getters.moves.length - 1];

        if (lastMove.color === getters.currentColor) {
          let notation;

          if (lastMove.shortCastling) {
            notation = "O-O";
          } else if (lastMove.longCastling) {
            notation = "O-O-O";
          } else {
            notation = lastMove.from_coordinate + '-' + lastMove.to_coordinate;

            if (lastMove.transformed) {
              notation += "=" + lastMove.piece.name;
            }
          }

          commit("sendChessPartySocket", {
            action: "cancel_move",
            request: true,
            notation,
          });
        } else {
          commit("createAlert", {
            title: "Последний ход не Ваш.",
            level: "warning",
          }, { root: true });
        }
      }
    }
  },
  castle({ dispatch, commit, getters }, coordinate) {
    /* Сделать рокировку */

    dispatch("stopStopwatch");

    const castling = getters.field[coordinate].castling;
    const kingOldCoordinate = 'e' + PIECE_Y[getters.moveOf];
    const rookOldCoordinate = (castling.longCastling ? 'a' : 'h') + PIECE_Y[getters.moveOf];

    dispatch("unselectPiece");

    commit("removePiece", kingOldCoordinate);
    commit("removePiece", rookOldCoordinate);

    castling.king.selected = false;

    commit("createPiece", castling.king);
    commit("createPiece", castling.rook);

    const move = {
      color: getters.moveOf,
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

    // check();
    checkmateOrStalemate();

    dispatch("startStopwatch");
  },

  startCountdown({ dispatch, commit, getters }, playerIndex) {
    /* Начать/продолжить отсчет */

    if (getters.gameStatus !== GAME_STASUSES.WATCH) {
      const intervalHandle = setInterval(() => {
        if (getters.players[playerIndex].secondsRemaining === 0) {
          if (getters.gameStatus === GAME_STASUSES.ONLINE) {
            if (getters.players[playerIndex].color === getters.currentColor) {
              commit("sendChessPartySocket", {
                action: "timed_out",
              });
            }
          } else {
            const winnerUsername = getters.players[playerIndex === 0 ? 1 : 0].user.username;
            const loserUsername = getters.players[playerIndex].user.username;

            commit("createAlert", {
              title: `Игрок "${winnerUsername}" выиграл. У игрока "${loserUsername}" закончилось время.`,
              level: "simple",
            }, { root: true });
            commit("updateIntervalHandle", { playerIndex });
          }
        }

        if (getters.gameStatus === GAME_STASUSES.FINISHED) {
          commit("updateIntervalHandle", { playerIndex });
        }

        commit("updateSecondsRemaining", { index: playerIndex, seconds: -1 });
      }, 1000);

      commit("updateIntervalHandle", { playerIndex, intervalHandle });
    }
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

    if (piece.name === "pawn") {
      const y = +piece.coordinate[1];
      const leftX = LETTERS[LETTERS.indexOf(piece.coordinate[0]) - 1];
      const rightX = LETTERS[LETTERS.indexOf(piece.coordinate[0]) + 1];
      const frontY = getters.moveOf === WHITE ? y + 1 : y - 1;

      if (eatingOnAisle(leftX + frontY)) {
        commit("updateCell", {
          coordinate: leftX + frontY,
          properties: {
            edible: getters.pieces[leftX + y],
          }
        });
      }

      if (eatingOnAisle(rightX + frontY)) {
        commit("updateCell", {
          coordinate: rightX + frontY,
          properties: {
            edible: getters.pieces[rightX + y],
          }
        });
      }
    }
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

    dispatch("stopStopwatch");

    if (
      ![GAME_STASUSES.ONLINE, GAME_STASUSES.WATCH].includes(getters.gameStatus) &&
      pawnTo == null && getters.selectedPiece.name === "pawn" &&
      +coordinate[1] === PIECE_Y[getters.moveOf === BLACK ? WHITE : BLACK]
    ) {
      commit("updateSelectedCell", coordinate);
      commit("updateModalAction", "transformPawn", { root: true });
      commit("updateOpenModal", true, { root: true });

      return;
    }

    const newMove = {
      color: getters.moveOf,
      piece: getters.selectedPiece,
      from_coordinate: getters.selectedPiece.coordinate,
      to_coordinate: coordinate,
    };

    if (getters.gameStatus === GAME_STASUSES.ONLINE) {
      if (getters.field[coordinate].edible) {
        commit("updatePlayerEatenPieces", { playerIndex: getters.movingPlayerIndex, [getters.field[coordinate].edible.name]: 1 });
        newMove.eatenPiece = getters.field[coordinate].edible;
        commit("removePiece", newMove.eatenPiece.coordinate);
      } else {
        if (isCellHostile(coordinate)) {
          commit("updatePlayerEatenPieces", { playerIndex: getters.movingPlayerIndex, [getters.pieces[coordinate].name]: 1 });
          newMove.eatenPiece = getters.pieces[coordinate];
          commit("removePiece", newMove.eatenPiece.coordinate);
        }
      }
    } else if (getters.field[coordinate].edible) {
      commit("updatePlayerEatenPieces", { playerIndex: getters.movingPlayerIndex, [getters.field[coordinate].edible.name]: 1 });
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
      piece.image = "/media/chess/pieces/" + piece.color + '/' + pawnTo + ".svg";
      commit("updateOpenModal", false, { root: true });
    }

    commit("createPiece", piece);

    commit("addMove", newMove);

    dispatch("selectLastMoveCell");
    dispatch("unselectCheckingCells");

    dispatch("swapMoveOf");
    dispatch("swapColor");

    check();
    checkmateOrStalemate();

    dispatch("startStopwatch");
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
  castlingCell({ commit, getters }, { coordinate, castling, checkForCheck = true }) {
    /* Сделать клетку доступным для рокировки */

    if (checkForCheck && willCheckEntail(coordinate)) return;

    const properties = { castling };

    commit("updateCell", { coordinate, properties })
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

  async findOpponent({ commit }) {
    if (await isAuthenticated()) {
      commit("updateGameStatus", GAME_STASUSES.FINDING);
      commit("openFindOpponentSocket");
    } else {
      commit("updateModalAction", "authorization", { root: true });
      commit("updateOpenModal", true, { root: true });
    }
  },
  cancelFinding({ commit }) {
    commit("updateGameStatus", GAME_STASUSES.OFFLINE);
    commit("closeFindOpponentSocket");
  },
  giveUp({ commit, getters }) {
    if (getters.gameStatus === GAME_STASUSES.ONLINE) {
      commit("sendChessPartySocket", {
        action: "give_up",
      });
    }
  },
  offerDraw({ commit }) {
    commit("sendChessPartySocket", {
      action: "offer_draw",
      request: true,
    });
  },
  acceptDraw({ commit }) {
    commit("sendChessPartySocket", {
      action: "offer_draw",
      accept: true,
    });
  },
  declineDraw({ commit }) {
    commit("sendChessPartySocket", {
      action: "offer_draw",
      decline: true,
    });
  },
  updateWhitePlayer({ commit }, user) {
    commit("updatePlayer", {
      index: 0, user,
    });
  },
  updateBlackPlayer({ commit }, user) {
    commit("updatePlayer", {
      index: 1, user,
    });
  },

  startStopwatch({ commit, getters }) {
    if (getters.gameStatus === GAME_STASUSES.ONLINE) {
      const handler = setInterval(() => {
        commit("updateTime", 1);
      }, 1000);
      commit("updateStopwatchHandler", handler);
    }
  },
  stopStopwatch({ commit, getters }) {
    if (getters.gameStatus === GAME_STASUSES.ONLINE) {
      commit("updateStopwatchHandler");
      commit("updateTime", -1 * getters.time);
    }
  },

  cancelMoveAccept({ commit, getters }) {
    const lastMove = getters.moves[getters.moves.length - 1];
    let lastMoveNotation;

    if (lastMove.shortCastling) {
      lastMoveNotation = "O-O";
    } else if (lastMove.longCastling) {
      lastMoveNotation = "O-O-O";
    } else {
      lastMoveNotation = lastMove.from_coordinate + '-' + lastMove.to_coordinate;

      if (lastMove.transformed) {
        lastMoveNotation += "=" + lastMove.piece.name;
      }
    }

    if (getters.cancelingMove === lastMoveNotation) {
      commit("sendChessPartySocket", {
        action: "cancel_move",
        accept: true,
        notation: getters.cancelingMove,
      });
    } else {
      commit("createAlert", {
        title: "Запрошенный ход на отмену уже не последний.",
        level: "warning",
      }, { root: true });
    }
  },
  cancelMoveDecline({ commit }) {
    commit("sendChessPartySocket", {
      action: "cancel_move",
      decline: true,
    });
  },

  setPartyPlayers({ commit, getters }) {
    commit("updatePlayer", { index: 0, user: getters.party.white });
    commit("updatePlayer", { index: 1, user: getters.party.black });
  },
  firstMove({ commit, getters }) {
    commit("updateField", getField());
    commit("updatePieces", getPieces())
    commit("clearMoves");
    commit("updateColor", WHITE);
    commit("updateMoveOf", WHITE);

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
  prevMove({ dispatch, getters }) {
    if (getters.moves.length > 0) {
      dispatch("returnMove", { cancelIfOnline: false });
    }
  },
  nextMove({ dispatch, commit, getters }, { move = null }) {
    if (getters.moves.length < getters.party.moves.length) {
      const partyMove = move ?? getters.party.moves[getters.moves.length];
      const playerIndex = getters.players[0].color === getters.moveOf ? 0 : 1;

      commit("updateSecondsRemaining", { index: playerIndex, seconds: -1 * partyMove.time });

      if (["O-O", "O-O-O"].includes(partyMove.notation)) {
        const y = PIECE_Y[getters.moveOf];
        const kingCoordinate = 'e' + y;
        const coordinate = (partyMove.notation === "O-O" ? 'g' : 'c') + y;
        const rookOldCoordinate = (partyMove.notation === "O-O" ? 'h' : 'a') + y;
        const rookCoordinate = (partyMove.notation === "O-O" ? 'f' : 'd') + y;

        commit("updateSelectedPiece", getters.pieces[kingCoordinate]);

        let castling = {
          shortCastling: true,
        }

        if (partyMove.notation === "O-O-O") {
          castling = {
            longCastling: true,
          }
        }

        castling.king = deepClone(getters.pieces[kingCoordinate]);
        castling.rook = deepClone(getters.pieces[rookOldCoordinate]);
        castling.king.coordinate = coordinate
        castling.rook.coordinate = rookCoordinate;

        dispatch("castlingCell", { coordinate, castling, checkForCheck: false }).then();
        dispatch("castle", coordinate).then();
      } else {
        const fromCoordinate = partyMove.notation[0] + partyMove.notation[1];
        const toCoordinate = partyMove.notation[3] + partyMove.notation[4];
        commit("updateSelectedPiece", getters.pieces[fromCoordinate]);
        dispatch("movePiece", { coordinate: toCoordinate });
      }
    }
  },
  lastMove({ dispatch, getters }) {
    for (let i = getters.moves.length; i < getters.party.moves.length; i++) {
      dispatch("nextMove", { move: getters.party.moves[i] });
    }
  },
  async loadParty({ commit }) {
    commit("updateParty", await api.chess.getParty(router.currentRoute.value.params.id));
  }
}