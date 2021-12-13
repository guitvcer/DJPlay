<template>
  <div class="w-full fixed left-0 bottom-0 bg-white border-main border-t flex justify-around items-center py-1 dark:bg-main-dark">
    <div class="relative top-0.5">
      <button
        v-if="action === 'Chess'"
        v-for="button in gameButtons"
        :title="button.title"
        @click="button.onclick"
        class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1"
      >
        <reply-icon v-if="button.icon === 'reply-icon'" class="h-6 w-6" />
        <refresh-icon v-else-if="button.icon === 'refresh-icon'" class="h-6 w-6" />
      </button>

      <button
        v-if="action === 'ChessParty'"
        v-for="button in partyButtons"
        :title="button.title"
        @click="button.onclick"
        class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1"
      >
        <chevron-double-left-icon
          v-if="button.icon === 'chevron-double-left-icon'"
          class="h-6 w-6"
        />
        <chevron-left-icon
          v-if="button.icon === 'chevron-left-icon'"
          class="h-6 w-6"
        />
        <chevron-right-icon
          v-if="button.icon === 'chevron-right-icon'"
          class="h-6 w-6"
        />
        <chevron-double-right-icon
          v-if="button.icon === 'chevron-double-right-icon'"
          class="h-6 w-6"
        />
      </button>
    </div>
  </div>
</template>

<script>
import {
  ChevronLeftIcon,
  ChevronDoubleLeftIcon,
  ChevronRightIcon,
  ChevronDoubleRightIcon,
  ClockIcon,
  RefreshIcon,
  ReplyIcon
} from "@heroicons/vue/outline";
import { mapActions, mapGetters } from "vuex";

export default {
  props: {
    action: {
      type: String,
      required: true,
    },
  },
  components: {
    ChevronLeftIcon,
    ChevronDoubleLeftIcon,
    ChevronRightIcon,
    ChevronDoubleRightIcon,
    ClockIcon,
    RefreshIcon,
    ReplyIcon,
  },
  methods: mapActions("chess", [
    "resetBoard",
    "returnMove",
    "firstMove",
    "prevMove",
    "nextMove",
    "lastMove",
  ]),
  computed: mapGetters("chess", ["players"]),
  data() {
    return {
      gameButtons: [
        {
          title: "Отменить ход",
          onclick: this.returnMove,
          icon: "reply-icon",
        },
        {
          title: "Сбросить доску",
          onclick: this.resetBoard,
          icon: "refresh-icon",
        },
      ],
      partyButtons: [
        {
          title: "Первый ход",
          onclick: this.firstMove,
          icon: "chevron-double-left-icon",
        },
        {
          title: "Предыдущий ход",
          onclick: this.prevMove,
          icon: "chevron-left-icon",
        },
        {
          title: "Следующий ход",
          onclick: this.nextMove,
          icon: "chevron-right-icon",
        },
        {
          title: "Последний ход",
          onclick: this.lastMove,
          icon: "chevron-double-right-icon",
        },
      ],
    }
  }
}
</script>