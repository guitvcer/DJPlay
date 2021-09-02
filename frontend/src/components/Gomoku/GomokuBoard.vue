<template>
  <div
    class="max-w-3xl w-full mx-0 mx-auto 2xl:mx-4 mt-12 mb-20 md:mt-20 md:mb-10 2xl:mt-0 bg-board-background dark:bg-board-background-dark"
    id="gomokuBoard"
  >
    <div class="flex flex-col justify-between" id="dotsWrapper">
      <div v-for="(number, index) in numbers" :key="index" class="flex justify-between relative row">
        <div
          v-for="(letter, index) in letters"
          :key="index" :id="letter + number"
          :class="$parent.dotClassName"
          @click="registerMove($event.target)"
        />
      </div>
    </div>
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
  data() {
    return {
      numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      letters: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'k', 'l', 'm', 'n', 'o', 'p'],
      newMoveSound: new Audio(`${this.host}/media/sounds/new_move.mp3`)
    }
  },
  mounted() {
    setTimeout(this.resizeGomokuBoard, 1)
    setTimeout(this.resizeGomokuBoard, 2)
    window.addEventListener('resize', this.resizeGomokuBoard)

    if (this.name === 'GomokuParty') this.selectPartyDots()
  },
  methods: {
    registerMove(target, sendToServer = true) {
      if (this.name === 'GomokuParty') return

      if (this.$parent.gameStatus === 'playing') {
        if (this.$parent.myMove) {
          if (sendToServer) {
            this.$parent.gomokuPartySocket.send(JSON.stringify({
              move: target.id
            }))
          } else this.selectDot(target)
        }
      } else this.selectDot(target)
    },
    resizeGomokuBoard() {
      try {
        const gomokuBoard = document.querySelector('#gomokuBoard')
        gomokuBoard.setAttribute('style',
            'height: ' + gomokuBoard.offsetWidth + 'px'
        )
      } catch (e) {}
    },
    selectDot(target) {
      // выйти из функции, если нажата уже нажатый ход
      if (
          target.classList.contains('bg-white') ||
          target.classList.contains('bg-main') ||
          target.classList.contains('bg-red-400')
      ) return

      // удалить желтую окантовку последнего хода
      try {
        const lastMove = document.querySelector('.border-yellow-500')
        lastMove.classList.remove('border-yellow-500')
        lastMove.classList.add('border-main')
      } catch (e) {}

      // добавить соответствующие классы для "точки"
      if (
          (this.$parent.myMove && this.$parent.currentColor === 'white') ||
          (!this.$parent.myMove && this.$parent.currentColor === 'blue')
      ) {
        target.classList.add('bg-white')
        target.classList.add('dark:bg-gray-300')
        target.classList.add('text-black')
      } else if (
          (this.$parent.myMove && this.$parent.currentColor === 'blue') ||
          (!this.$parent.myMove && this.$parent.currentColor === 'white')
      ) {
        target.classList.add('bg-main')
        target.classList.add('dark:bg-main-dark2')
        target.classList.add('text-gray-100')
      }

      // сменить текущий цвет, если оффлайн игра
      if (this.$parent.gameStatus !== 'playing') {
        if (this.$parent.currentColor === 'white') this.$parent.currentColor = 'blue'
        else this.$parent.currentColor = 'white'
      }

      // добавить желтую окантовку для последней точки
      target.classList.add('border-yellow-500')
      target.classList.add('border-2')

      // добавить последний ход в список
      this.$parent.moves.push(target)

      // добавить порядковый номер внутрь "точки"
      target.innerHTML = this.$parent.moves.length

      try {
        this.newMoveSound.play()
      } catch (e) {}
    },
    selectPartyDots() {
      for (const move of this.$parent.party.moves) {
        const dot = document.getElementById(move['coordinate'])
        this.selectDot(dot)
      }
    }
  }
}
</script>

<style scoped>
#dotsWrapper {
  height: calc(100% + 33px);
}
.row {
  width: calc(100% + 34px);
  top: -15px;
  left: -15px;
}
.dot {
  width: 35px;
  height: 35px;
  cursor: pointer;
}
.dot:not(.bg-white, .bg-main .bg-red-400):hover {
  background: #393e46;
}

@media screen and (max-width: 640px) {
  .dot {
    width: 22px;
    height: 22px;
  }
  #dotsWrapper {
    height: calc(100% + 22px);
  }
  .row {
    width: calc(100% + 22px);
    top: -11px;
    left: -11px;
  }
}
</style>