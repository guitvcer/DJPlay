<template>
  <div
    :class="[
      'max-w-2xl w-full mx-0 mx-auto 2xl:mx-4 mt-12 mb-20 md:mt-20 md:mb-10 2xl:mt-0 flex ',
      currentColor === WHITE ? 'flex-col' : 'flex-col-reverse',
    ]"
  >
    <chess-player :index="1" />
    <div
      id="chessBoard"
      :class="[
        'bg-chess-board flex ',
        currentColor === WHITE ? 'flex-row flex-wrap-reverse' : 'flex-row-reverse flex-wrap'
      ]"
      @click="onBoardClick"
    >
      <div
        v-for="coordinate of Object.keys(field)"
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
import { WHITE } from "../../scripts/chess/constants";
import { onResizeBoard, onBoardClick } from "../../scripts/chess/board";
import ChessPlayer from "./ChessPlayer.vue";

export default {
  data() {
    return { WHITE }
  },
  mounted() {
    onResizeBoard();
  },
  components: { ChessPlayer },
  methods: { onBoardClick },
  computed: mapGetters([
    "currentColor",
    "field",
    "pieces",
    "players",
    "selectedPiece",
  ]),
}
</script>

<style>
.cell {
  width: 11%;
  height: 11%;
  margin: 0.75%;
  padding: 3px;
  border-radius: 20px;
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