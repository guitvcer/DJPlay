<template>
  <div
    :class="[
      'max-w-3xl w-full mx-0 mx-auto 2xl:mx-4 mt-12 mb-20 md:mt-20 md:mb-10 2xl:mt-0 bg-chess-board flex ',
      currentColor === WHITE ? 'flex-row-reverse flex-wrap' : 'flex-row flex-wrap-reverse'
    ]"
  >

  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { WHITE } from "../../scripts/chess/constants";

export default {
  data() {
    return { WHITE }
  },
  computed: mapGetters(["currentColor"]),
}
</script>

<style>
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