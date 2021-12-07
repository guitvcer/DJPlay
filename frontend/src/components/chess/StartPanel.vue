<template>
  <div
    class="
      bg-main dark:bg-main-dark text-gray-100 max-w-2xl w-full 2xl:w-auto rounded-md shadow-xl px-6 md:px-12 py-12
      md:py-20 mb-10 flex flex-col justify-between mx-0 mx-auto 2xl:mx-4
    "
  >
    <div><slot></slot></div>

    <div v-if="action === 'Chess'">
      <button
        v-for="button in gameButtons"
        v-show="button.show()"
        @click="button.onclick"
        v-html="button.title"
        class="
          px-6 py-4 w-full text-xl md:text-2xl font-semibold bg-gray-200 hover:bg-gray-300 text-black border rounded-md
          dark:border-main-dark2 dark:bg-main-dark2 dark:text-gray-200 dark:hover:bg-main my-0.5
        "
        tabindex="3"
      />
    </div>
    <div v-else-if="action === 'ChessParty'" class="hidden 2xl:flex px-8 justify-center mt-4">
      <button
        v-for="button in partyButtons"
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
  ChevronDoubleRightIcon
} from "@heroicons/vue/outline";
import { GAME_STASUSES } from "../../scripts/chess/constants";

export default {
  props: {
    action: {
      type: String,
      required: true,
    },
  },
  computed: mapGetters("chess", ["gameStatus"]),
  methods: mapActions("chess", ["findOpponent", "cancelFinding", "giveUp", "offerDraw"]),
  components: {
    ChevronDoubleLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDoubleRightIcon,
  },
  data() {
    return {
      GAME_STASUSES,
      gameButtons: [
        {
          show: () => [GAME_STASUSES.OFFLINE, GAME_STASUSES.FINISHED, null].includes(this.gameStatus),
          title: "Найти соперника",
          onclick: this.findOpponent,
        },
        {
          show: () => this.gameStatus === GAME_STASUSES.FINDING,
          title: "Отменить поиск",
          onclick: this.cancelFinding,
        },
        {
          show: () => this.gameStatus === GAME_STASUSES.ONLINE,
          title: "Сдаться",
          onclick: this.giveUp,
        },
        {
          show: () => this.gameStatus === GAME_STASUSES.ONLINE,
          title: "Предложить ничью",
          onclick: this.offerDraw,
        },
      ],
      partyButtons: [
        { icon: "chevron-double-left", onclick: this.firstMove },
        { icon: "chevron-left", onclick: this.prevMove },
        { icon: "chevron-right", onclick: this.nextMove },
        { icon: "chevron-double-right", onclick: this.lastMove },
      ],
    }
  },
}
</script>