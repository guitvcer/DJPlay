<template>
  <section class="flex flex-col-reverse 2xl:flex-row mx-auto justify-center 2xl:justify-between px-0 md:px-16">
    <div
      v-if="!loading"
      class="max-w-3xl w-full mx-0 mx-auto 2xl:mx-4 mt-12 mb-10 md:mt-20 2xl:mt-0"
      id="gomokuBoard"
    >
      <div class="flex flex-col justify-between" id="dotsWrapper">
        <div v-for="(number, index) in numbers" :key="index" class="flex justify-between relative row">
          <div v-for="(letter, index) in letters" :key="index" :id="letter + number" class="dot rounded-full pointer border-main" @click="registerMove($event.target)">

          </div>
        </div>
      </div>
    </div>
    <div v-if="!loading" class="bg-main dark:bg-main-dark text-gray-100 max-w-2xl rounded-md shadow-xl px-6 md:px-12 py-12 md:py-20 mb-10 flex flex-col justify-between mx-0 mx-auto 2xl:mx-4">
      <div>
        <h2 class="text-2xl md:text-4xl mb-4">{{ game.name }}</h2>
        <p class="mb-12 md:mb-20" v-html="game.rules" />
      </div>
      <div>
        <button
          class="px-6 py-4 w-full text-xl md:text-2xl font-semibold bg-gray-200 hover:bg-gray-300 text-black border rounded-md dark:border-main-dark2 dark:bg-main-dark2 dark:text-gray-200 dark:hover:bg-main"
          @click="findOpponent"
          v-if="!gameStatus"
        >Найти соперника</button>
        <button
            class="px-6 py-4 w-full text-xl md:text-2xl font-semibold bg-gray-200 hover:bg-gray-300 text-black border rounded-md dark:border-main-dark2 dark:bg-main-dark2 dark:text-gray-200 dark:hover:bg-main"
            @click="cancelFinding"
            v-else-if="gameStatus === 'finding'"
        >Отменить ожидание</button>
        <button
            class="px-6 py-4 w-full text-xl md:text-2xl font-semibold bg-gray-200 hover:bg-gray-300 text-black border rounded-md dark:border-main-dark2 dark:bg-main-dark2 dark:text-gray-200 dark:hover:bg-main"
            @click="giveUp"
            v-else-if="gameStatus === 'playing'"
        >Сдаться</button>
      </div>
    </div>
    <div class="w-full fixed left-0 bottom-0 bg-white border-main border-t flex justify-center items-center py-1">
      <button title="Сбросить доску" class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200" @click="resetBoard">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  </section>
</template>

<script>
import Alert from '@/components/Alert'

export default {
  data() {
    return {
      loading: true,
      game: {},
      gameStatus: false,
      findOpponentSocket: null,
      gomokuPartySocket: null,
      partyID: null,
      opponent: null,
      username: null,
      myMove: true,
      numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      letters: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'k', 'l', 'm', 'n', 'o', 'p'],
    }
  },
  components: {
    Alert
  },
  mounted() {
    this.sendRequest(this.host + '/gomoku/').then(json => {
      if (json.type === 'alert') this.$emit('create-alert', json)
      else {
        this.game = json
        this.loading = false

        setTimeout(this.resizeGomokuBoard, 1)
        setTimeout(this.resizeGomokuBoard, 2)
      }
    })
    this.sendRequest(this.host + '/account/').then(json => {
      if (json.type === 'alert') this.$emit('create-alert', json)
      else this.username = json.username
    })

    window.addEventListener('resize', this.resizeGomokuBoard)
  },
  computed: {
    gameBackgroundUrl() {
      if (!this.loading)
        return this.host + '/media/' + this.game.app_name + '/board_background.png'
    }
  },
  methods: {
    findOpponent() {
      this.gameStatus = 'finding'

      this.findOpponentSocket = new WebSocket(this.webSocketHost + '/gomoku/ws/find')

      this.findOpponentSocket.onopen = this.findOpponentSocketOnOpen

      this.findOpponentSocket.onmessage = this.findOpponentSocketOnMessage
    },
    cancelFinding() {
      this.gameStatus = false
      this.findOpponentSocket.close()
    },
    giveUp() {
      this.gameStatus = false
      this.gomokuPartySocket.close()
      this.partyID = null
      this.opponent = null
      this.myMove = true
      this.$emit('create-alert', {
        level: 'danger',
        title: 'Вы проиграли.'
      })
    },
    findOpponentSocketOnMessage(e) {
      let data = JSON.parse(e.data)

      this.partyID = data['party_id']

      if (data['player_1'] === this.username) this.opponent = data['player_2']
      else this.opponent = data['player_1']

      this.findOpponentSocket.close()

      this.resetBoard()
      this.gameStatus = 'playing'

      this.gomokuPartySocket = new WebSocket(this.webSocketHost + '/gomoku/ws/play/' + data.party_id)
      this.gomokuPartySocket.onopen = this.gomokuPartySocketOnOpen

      this.gomokuPartySocket.onmessage = this.gomokuPartySocketOnMessage
    },
    findOpponentSocketOnOpen() {
      this.findOpponentSocket.send(JSON.stringify({
        'access_token': this.getCookie('access')
      }))
    },
    gomokuPartySocketOnMessage(e) {
      let data = JSON.parse(e.data)

      if (data.move === 'exit') {
        if (data.username === this.opponent) {
          this.gomokuPartySocket.close()
          this.$emit('create-alert', {
            level: 'success',
            title: 'Вы выиграли. Соперник сдался.'
          })
          this.gameStatus = false
        }
      } else if (data.move === 'win') {
          console.log(data)
      } else {
        let dot = document.querySelector('#' + data.move)
        this.selectDot(dot)
        if (data.username === this.username) this.myMove = false
        else if (data.username === this.opponent) this.myMove = true
      }
    },
    gomokuPartySocketOnOpen() {
      this.gomokuPartySocket.send(JSON.stringify({
        'access_token': this.getCookie('access')
      }))
    },
    resizeGomokuBoard() {
      const gomokuBoard = document.querySelector('#gomokuBoard')
      gomokuBoard.setAttribute('style',
          'height: ' + gomokuBoard.offsetWidth + 'px'
      )
    },
    registerMove(target, sendToServer = true) {
      if (this.gameStatus === 'playing') {
        if (this.myMove) {
          if (sendToServer) {
            this.gomokuPartySocket.send(JSON.stringify({
              move: target.id
            }))
          } else this.selectDot(target)
        }
      } else this.selectDot(target)
    },
    selectDot(target) {
      try {
        const lastMove = document.querySelector('.lastMove')

        lastMove.classList.remove('lastMove')

        if (lastMove.classList.contains('bg-main')) target.classList.add('bg-white')
        else target.classList.add('bg-main')
      } catch (e) {
        target.classList.add('bg-white')
      }

      target.classList.add('lastMove')
      target.classList.add('border-2')
    },
    resetBoard() {
      if (this.gameStatus === 'playing') {
        this.$emit('create-alert', {
          level: 'warning',
          title: 'Во время игры нельзя очищать поле.'
        })
      } else {
        for (let dot of document.querySelectorAll('.dot')) {
          dot.className = 'dot rounded-full pointer border-main'
        }
      }
    }
  }
}
</script>

<style scoped >
section {
  max-width: 1800px;
}
#gomokuBoard {
  background-image: url('http://127.0.0.1:8000/media/gomoku/board_background.png');
  background-size: 100%;
}
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
.dot:hover {
  border: 1px solid black;
  background: #393e46;
}
.lastMove {
  border: 3px solid orange;
}
.dot.bg-white:hover {
  background-color: white;
}

@media screen and (max-width: 768px) {
  .dot {
    width: 25px;
    height: 25px;
  }
  #dotsWrapper {
    height: calc(100% + 25px);
  }
  .row {
    width: calc(100% + 25px);
    top: -12.5px;
    left: -12px;
  }
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