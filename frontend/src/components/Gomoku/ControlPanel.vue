<template>
  <div class="w-full fixed left-0 bottom-0 bg-white border-main border-t flex justify-center items-center py-1 dark:bg-main-dark">
    <button
      v-if="name === 'Gomoku'"
      title="Отменить ход"
      class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1"
      @click="returnMove"
    >
      <!-- TODO: добавить ctrl+z на отмену хода -->
      <reply-icon class="h-6 w-6" />
    </button>
    <button
      v-if="name === 'Gomoku'"
      title="Сбросить доску"
      class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1"
      @click="resetBoard"
    >
      <refresh-icon class="h-6 w-6" />
    </button>

    <button
      v-if="name === 'GomokuParty'"
      @click="$emit('firstMove')"
      class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1"
    >
      <chevron-double-left-icon class="h-6 w-6" />
    </button>
    <button
      v-if="name === 'GomokuParty'"
      @click="$emit('prevMove')"
      class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1"
    >
      <chevron-left-icon class="h-6 w-6" />
    </button>
    <button
      v-if="name === 'GomokuParty'"
      @click="$emit('nextMove')"
      class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1"
    >
      <chevron-right-icon class="h-6 w-6" />
    </button>
    <button
      v-if="name === 'GomokuParty'"
      @click="$emit('lastMove')"
      class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1"
    >
      <chevron-double-right-icon class="h-6 w-6" />
    </button>
  </div>
</template>

<script>
import {
  ChevronLeftIcon,
  ChevronDoubleLeftIcon,
  ChevronRightIcon,
  ChevronDoubleRightIcon,
  RefreshIcon,
  ReplyIcon
} from '@heroicons/vue/outline'

export default {
  props: {
    name: {
      type: String,
      required: true
    }
  },
  components: {
    ChevronLeftIcon,
    ChevronDoubleLeftIcon,
    ChevronRightIcon,
    ChevronDoubleRightIcon,
    RefreshIcon,
    ReplyIcon
  },
  methods: {
    returnMove() {
      if (this.$parent.moves.length !== 0) {
        const lastDot = this.$parent.moves[this.$parent.moves.length - 1]

        if (this.$parent.gameStatus === 'playing') {
          if (
              (this.$parent.currentColor === 'white' && lastDot.classList.contains('bg-main')) ||
              (this.$parent.currentColor === 'blue' && lastDot.classList.contains('bg-white'))
          ) {
            this.$parent.$emit('create-alert', {
              level: 'warning',
              title: 'Последний ход не Ваш.'
            })
          } else {
            this.$parent.returnMoveSocket.send(JSON.stringify({
              access_token: this.getCookie('access'),
              command: 'return_move',
              returnable_move: lastDot.id,
              returner: this.$parent.username
            }))
          }
        } else {
          lastDot.className = this.$parent.dotClassName
          lastDot.innerHTML = ''

          this.$parent.moves.pop()

          if (this.$parent.currentColor === 'white') this.$parent.currentColor = 'blue'
          else this.$parent.currentColor = 'white'
        }
      }
    },
    resetBoard(showAlert = true) {
      if (this.$parent.gameStatus === 'playing' && showAlert) {
        this.$parent.$emit('create-alert', {
          level: 'warning',
          title: 'Во время игры нельзя очищать поле.'
        })
      } else {
        for (let dot of document.querySelectorAll('.dot')) {
          dot.className = this.$parent.dotClassName
          dot.innerHTML = ''
        }

        this.$parent.moves = []
        this.$parent.currentColor = 'white'
      }
    }
  }
}
</script>