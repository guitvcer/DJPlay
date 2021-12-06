<template>
  <div class="w-full fixed left-0 bottom-0 bg-white border-main border-t flex justify-center items-center py-1 dark:bg-main-dark">
    <button
      v-if="action === 'Gomoku'"
      title="Отменить ход"
      class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1"
      @click="cancelMove(false)"
    >
      <!-- TODO: добавить ctrl+z на отмену хода -->
      <reply-icon class="h-6 w-6" />
    </button>
    <button
      v-if="action === 'Gomoku'"
      title="Сбросить доску"
      class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1"
      @click="resetBoard"
    >
      <refresh-icon class="h-6 w-6" />
    </button>
    <button
      v-if="action === 'GomokuParty'"
      v-for="button in buttons"
      @click="button.onclick"
      class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1"
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
</template>

<script>
import { mapActions } from "vuex";
import {
  ChevronLeftIcon,
  ChevronDoubleLeftIcon,
  ChevronRightIcon,
  ChevronDoubleRightIcon,
  RefreshIcon,
  ReplyIcon
} from "@heroicons/vue/outline";

export default {
  props: {
    action: {
      type: String,
      required: true,
    }
  },
  components: {
    ChevronLeftIcon,
    ChevronDoubleLeftIcon,
    ChevronRightIcon,
    ChevronDoubleRightIcon,
    RefreshIcon,
    ReplyIcon,
  },
  data() {
    return {
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
  methods: {
    ...mapActions("gomoku", [
      "resetBoard",
      "cancelMove",
      "firstMove",
      "prevMove",
      "nextMove",
      "lastMove",
    ]),
  }
}
</script>