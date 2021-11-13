<template>
  <div
    id="chessBoard"
    :class="[
      'max-w-3xl w-full mx-0 mx-auto 2xl:mx-4 mt-12 mb-20 md:mt-20 md:mb-10 2xl:mt-0 bg-chess-board flex ',
      currentColor === WHITE ? 'flex-row flex-wrap-reverse' : 'flex-row-reverse flex-wrap'
    ]"
  >
    <div
      v-for="coordinate of Object.keys(field)"
      :id="coordinate"
      class="cell"
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
import { onResizeBoard } from "../../scripts/chess/board";

export default {
  data() {
    return { WHITE }
  },
  mounted() {
    onResizeBoard();
  },
  computed: mapGetters(["currentColor", "field", "pieces"]),
}
</script>

<style>
.cell {
  width: 10%;
  height: 10%;
  margin: 1.25%;
}
.selectable-cell {
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