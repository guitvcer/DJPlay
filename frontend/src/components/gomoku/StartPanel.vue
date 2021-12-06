<template>
  <div class="bg-main dark:bg-main-dark text-gray-100 max-w-2xl w-full 2xl:w-auto rounded-md shadow-xl px-6 md:px-12 py-12 md:py-20 mb-10 flex flex-col justify-between mx-0 mx-auto 2xl:mx-4">
    <div><slot></slot></div>

    <div v-if="action === 'Gomoku'">
      <button
        class="px-6 py-4 w-full text-xl md:text-2xl font-semibold bg-gray-200 hover:bg-gray-300 text-black border rounded-md dark:border-main-dark2 dark:bg-main-dark2 dark:text-gray-200 dark:hover:bg-main"
        v-if="gameStatus === GAME_STASUSES.OFFLINE"
        @click="findOpponent"
        tabindex="3"
      >Найти соперника</button>
      <button
        class="px-6 py-4 w-full text-xl md:text-2xl font-semibold bg-gray-200 hover:bg-gray-300 text-black border rounded-md dark:border-main-dark2 dark:bg-main-dark2 dark:text-gray-200 dark:hover:bg-main"
        v-else-if="gameStatus === GAME_STASUSES.FINDING"
        @click="cancelFinding"
        tabindex="3"
      >Отменить ожидание</button>
      <button
        class="px-6 py-4 w-full text-xl md:text-2xl font-semibold bg-gray-200 hover:bg-gray-300 text-black border rounded-md dark:border-main-dark2 dark:bg-main-dark2 dark:text-gray-200 dark:hover:bg-main"
        v-else-if="gameStatus === GAME_STASUSES.ONLINE"
        @click="giveUp"
        tabindex="3"
      >Сдаться</button>
    </div>
    <div v-else-if="action === 'GomokuParty'" class="hidden 2xl:flex px-8 justify-center mt-4">
      <button
        v-for="button in buttons"
        @click="button.onclick"
        class="
          px-6 py-4 mx-1 text-xl md:text-2xl font-semibold bg-gray-200 hover:bg-gray-300 text-black border rounded-md
          dark:border-main-dark2 dark:bg-main-dark2 dark:text-gray-200 dark:hover:bg-main
        "
      >
        <chevron-double-left-icon
          v-if="button.icon === 'chevron-double-left'"
          class="h-6 w-6"
        />
        <chevron-left-icon
          v-else-if="button.icon === 'chevron-left'"
          class="h-6 w-6"
        />
        <chevron-right-icon
          v-else-if="button.icon === 'chevron-right'"
          class="h-6 w-6"
        />
        <chevron-double-right-icon
          v-else-if="button.icon === 'chevron-double-right'"
          class="h-6 w-6"
        />
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import {
  ChevronDoubleLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/vue/outline";
import { GAME_STASUSES } from "../../scripts/gomoku/constants";

export default {
  props: {
    action: {
      type: String,
      required: true,
    },
  },
  components: {
    ChevronDoubleLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDoubleRightIcon,
  },
  data() {
    return {
      GAME_STASUSES,
      buttons: [
        {
          icon: "chevron-double-left",
          onclick: this.firstMove,
        },
        {
          icon: "chevron-left",
          onclick: this.prevMove,
        },
        {
          icon: "chevron-right",
          onclick: this.nextMove,
        },
        {
          icon: "chevron-double-right",
          onclick: this.lastMove,
        },
      ],
    }
  },
  methods: mapActions("gomoku", [
    "findOpponent",
    "cancelFinding",
    "giveUp",
    "firstMove",
    "prevMove",
    "nextMove",
    "lastMove",
  ]),
  computed: mapGetters("gomoku", ["gameStatus"]),
}
</script>