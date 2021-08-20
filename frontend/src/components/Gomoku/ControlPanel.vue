<template>
  <div class="w-full fixed left-0 bottom-0 bg-white border-main border-t flex justify-center items-center py-1 dark:bg-main-dark">
    <button v-if="name === 'Gomoku'" title="Отменить ход" class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1" @click="returnMove">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    </button>
    <button v-if="name === 'Gomoku'" title="Сбросить доску" class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1" @click="resetBoard">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </button>

    <button
        v-if="name === 'GomokuParty'"
        @click="$emit('firstMove')"
        class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
      </svg>
    </button>
    <button
        v-if="name === 'GomokuParty'"
        @click="$emit('prevMove')"
        class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <button
        v-if="name === 'GomokuParty'"
        @click="$emit('nextMove')"
        class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
    <button
        v-if="name === 'GomokuParty'"
        @click="$emit('lastMove')"
        class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      required: true
    }
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
          lastDot.className = this.dotClassName
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
          dot.className = this.dotClassName
          dot.innerHTML = ''
        }

        this.$parent.moves = []
        this.$parent.currentColor = 'white'
      }
    }
  }
}
</script>