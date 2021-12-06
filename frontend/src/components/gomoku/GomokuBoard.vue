<template>
  <div
    class="max-w-3xl mx-0 mx-auto 2xl:mx-4 mt-12 mb-20 md:mt-20 md:mb-10 2xl:mt-0 bg-board-background dark:bg-board-background-dark"
    id="gomokuBoard"
    @click="onBoardClick"
    @keydown.enter="onBoardClick"
    @keydown.up="focus('up')"
    @keydown.right="focus('right')"
    @keydown.down="focus('down')"
    @keydown.left="focus('left')"
  >
    <div v-for="(number, numberIndex) in NUMBERS" class="flex justify-between relative row">
      <div
        v-for="(letter, letterIndex) in LETTERS"
        :id="letter + number"
        :class="[
          'dot rounded-full z-0 h-full flex items-center justify-center text-xs sm:text-base text-center',
          moves.length > 0 && moves[moves.length - 1].coordinate === letter + number ? ' border-yellow-500' : ' border-main',
          field[letter + number].row ? ' bg-red-500 hover:bg-red-500 dark:hover:bg-red-500 text-black font-bold' : (
            field[letter + number].color === WHITE ? ' bg-white hover:bg-white border-2 dark:bg-gray-300 dark:hover:bg-gray-300 text-black' : (
              field[letter + number].color === BLACK ? ' bg-main hover:bg-main border-2 dark:bg-main-dark2 dark:hover:bg-main-dark2 text-gray-100' : ' hover:bg-main focus:bg-main cursor-pointer'
            )
          ),
        ]"
        :tabindex="numberIndex * 15 + letterIndex + 4"
      >
        {{ field[letter + number] ? field[letter + number].count : "" }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { onResizeBoard } from "../../utilities";
import { WHITE, BLACK, NUMBERS, LETTERS } from "../../scripts/gomoku/constants";
import { onBoardClick, focus } from "../../scripts/gomoku/board";

export default {
  props: {
    action: {
      type: String,
      required: true,
    }
  },
  data() {
    return { WHITE, BLACK, NUMBERS, LETTERS }
  },
  computed: mapGetters("gomoku", ["field", "moves"]),
  mounted: onResizeBoard,
  methods: { onBoardClick, focus },
}
</script>

<style scoped>
.row {
  width: calc(100% + (100% / 14));
  height: calc(100% / 14);
  top: calc(-100% / 30);
  left: calc(-100% / 30);
}
.dot {
  width: calc(100% / 15);
}
</style>