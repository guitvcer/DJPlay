<template>
  <div
    id="chessBoard"
    :class="[
      'max-w-3xl w-full mx-0 mx-auto 2xl:mx-4 mt-12 mb-20 md:mt-20 md:mb-10 2xl:mt-0 bg-chess-board flex ',
      currentColor === WHITE ? 'flex-row flex-wrap-reverse' : 'flex-row-reverse flex-wrap'
    ]"
    @click="onBoardClick"
  >
    <div
      v-for="coordinate of Object.keys(field)"
      :id="coordinate"
      :class="[
        'cell',
        pieces[coordinate] !== undefined && pieces[coordinate].selected ? ' selected-piece' : '',
        pieces[coordinate] !== undefined && pieces[coordinate].edible ? ' edible-piece' : '',
        field[coordinate].selectable ? ' selectable-cell' : '',
        field[coordinate].lastMoveCell ? ' last-move-cell' : '',
      ]"
    >
      <img
        v-if="pieces[coordinate]"
        :src="this.host + pieces[coordinate].image"
        :alt="pieces[coordinate].name"
      >
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { WHITE } from "../../scripts/chess/constants";
import { onResizeBoard, onBoardClick } from "../../scripts/chess/board";

export default {
  data() {
    return { WHITE }
  },
  mounted() {
    onResizeBoard();
  },
  methods: { onBoardClick },
  computed: mapGetters(["currentColor", "field", "pieces"]),
}
</script>

<style>
.cell {
  width: 11%;
  height: 11%;
  margin: 0.75%;
  padding: 3px;
}
.selected-piece, .selectable-cell {
  border: 2px dashed blue !important;
  cursor: pointer;
}
.edible-piece {
  border: 2px dashed red !important;
  cursor: pointer;
}
.last-move-cell {
  border: 2px dashed green;
}
</style>