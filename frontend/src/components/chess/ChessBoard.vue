<template>
  <div
    :class="[
      'max-w-2xl w-full mx-0 mx-auto 2xl:mx-4 mt-12 mb-20 md:mt-20 md:mb-10 2xl:mt-0 flex items-center ',
      currentColor === BLACK && gameStatus === GAME_STASUSES.ONLINE ? 'flex-col-reverse' : 'flex-col',
    ]"
  >
    <chess-player :index="1" />
    <div
      id="chessBoard"
      :class="[
        'bg-chess-board flex ',
        currentColor === BLACK && gameStatus === GAME_STASUSES.ONLINE ?
        'flex-row-reverse flex-wrap' : 'flex-row flex-wrap-reverse'
      ]"
      @click="onBoardClick"
    >
      <div
        v-for="coordinate of Object.keys(field)"
        class="flex items-center justify-center"
        :id="coordinate"
        :class="['cell',
          selectedPiece && pieces[coordinate] !== undefined && pieces[coordinate].selected ? ' selected-piece' : '',
          pieces[coordinate] !== undefined && pieces[coordinate].check ? ' check-piece' : '',
          field[coordinate].edible ? ' edible-piece' : '',
          field[coordinate].selectable || field[coordinate].castling ? ' selectable-cell' : '',
          field[coordinate].lastMoveCell ? ' last-move-cell' : '',
        ]"
      >
        <img
          v-if="pieces[coordinate]"
          class="w-full h-full"
          :src="this.baseURL + pieces[coordinate].image"
          :alt="pieces[coordinate].name"
        >
      </div>
    </div>
    <chess-player :index="0" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { onResizeBoard } from "../../utilities";
import { BLACK, GAME_STASUSES } from "../../scripts/chess/constants";
import { onBoardClick } from "../../scripts/chess/board";
import ChessPlayer from "./ChessPlayer.vue";

export default {
  data() {
    return { BLACK, GAME_STASUSES }
  },
  mounted: onResizeBoard,
  components: { ChessPlayer },
  methods: { onBoardClick },
  computed: mapGetters("chess", [
    "currentColor",
    "field",
    "pieces",
    "players",
    "selectedPiece",
    "gameStatus",
  ]),
}
</script>

<style>
.cell {
  width: 11%;
  height: 11%;
  margin: 0.75%;
  border-radius: 20px;
}
@media screen and (max-width: 768px) {
  .cell {
    border-radius: 12px;
  }
}
.selected-piece, .selectable-cell {
  border: 2px dashed blue !important;
  cursor: pointer;
}
.edible-piece, .edible-piece.check-piece {
  border: 2px dashed red !important;
  cursor: pointer;
}
.check-piece {
  border: 2px dashed darkorchid !important;
  cursor: pointer;
}
.last-move-cell {
  border: 2px dashed green;
}
</style>