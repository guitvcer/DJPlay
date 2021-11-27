<template>
  <div class="w-full fixed left-0 bottom-0 bg-white border-main border-t flex justify-around items-center py-1 dark:bg-main-dark">
    <div class="relative top-0.5">
      <button
        v-if="name === 'Chess'"
        title="Отменить ход"
        class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1"
        @click="returnMove"
      >
        <!-- TODO: добавить ctrl+z на отмену хода -->
        <reply-icon class="h-6 w-6" />
      </button>
      <button
        v-if="name === 'Chess'"
        title="Сбросить доску"
        class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1"
        @click="resetBoard"
      >
        <refresh-icon class="h-6 w-6" />
      </button>

      <button
        v-if="name === 'ChessParty'"
        @click="$emit('firstMove')"
        class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1"
      >
        <chevron-double-left-icon class="h-6 w-6" />
      </button>
      <button
        v-if="name === 'ChessParty'"
        @click="$emit('prevMove')"
        class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1"
      >
        <chevron-left-icon class="h-6 w-6" />
      </button>
      <button
        v-if="name === 'ChessParty'"
        @click="$emit('nextMove')"
        class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1"
      >
        <chevron-right-icon class="h-6 w-6" />
      </button>
      <button
        v-if="name === 'ChessParty'"
        @click="$emit('lastMove')"
        class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1"
      >
        <chevron-double-right-icon class="h-6 w-6" />
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
    name: {
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
  methods: {
    ...mapActions(["resetBoard", "returnMove"]),
  },
  computed: mapGetters(["players"]),
}
</script>