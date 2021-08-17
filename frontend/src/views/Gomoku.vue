<template>
  <section class="flex flex-col-reverse 2xl:flex-row mx-auto justify-center 2xl:justify-between px-0 md:px-16">
    <loading v-if="loading" class="m-auto" />
    <div
      v-if="!loading"
      class="max-w-3xl w-full mx-0 mx-auto 2xl:mx-4 mt-12 mb-10 md:mt-20 2xl:mt-0 bg-board-background dark:bg-board-background-dark"
      id="gomokuBoard"
    >
      <div class="flex flex-col justify-between" id="dotsWrapper">
        <div v-for="(number, index) in numbers" :key="index" class="flex justify-between relative row">
          <div v-for="(letter, index) in letters" :key="index" :id="letter + number" :class="dotClassName" @click="registerMove($event.target)"></div>
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
    <div v-if="!loading" class="w-full fixed left-0 bottom-0 bg-white border-main border-t flex justify-center items-center py-1 dark:bg-main-dark">
      <button title="Отменить ход" class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1" @click="returnMove">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </button>
      <button title="Сбросить доску" class="rounded bg-gray-100 py-0.5 px-1 hover:bg-gray-200 dark:bg-main dark:hover:bg-main-dark2 mx-1" @click="resetBoard">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  </section>
</template>

<script>
import axios from 'axios'
import Alert from '@/components/Alert'
import Loading from '@/components/Loading'

export default {
  data() {
    return {
      loading: true,
      game: {},
      gameStatus: false,
      findOpponentSocket: null,
      gomokuPartySocket: null,
      returnMoveSocket: null,
      partyID: null,
      opponent: null,
      username: null,
      myMove: true,
      numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      letters: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'k', 'l', 'm', 'n', 'o', 'p'],
      data: null,
      moves: [],
      dotClassName: 'dot rounded-full pointer text-center text-xs sm:text-base flex items-center justify-center',
      currentColor: 'white'
    }
  },
  components: {
    Alert, Loading
  },
  mounted() {
    axios
      .get(this.host + '/gomoku/')
      .then(response => {
        this.game = response.data
        this.loading = false

        setTimeout(this.resizeGomokuBoard, 1)
        setTimeout(this.resizeGomokuBoard, 2)
      })
      .catch(error => {
        this.$emit('api-error', error)
      })

    this.username = this.getUserInfo().username

    window.addEventListener('resize', this.resizeGomokuBoard)
  },
  computed: {
    gameBackgroundUrl() {
      if (!this.loading)
        return this.host + '/media/' + this.game['app_name'] + '/board_background.png'
    }
  },
  methods: {
    findOpponent() {
      if (this.username === null) {
        this.$emit('create-alert', {
          title: 'Вы не авторизованы',
          level: 'danger'
        })
        return
      }

      this.gameStatus = 'finding'
      this.findOpponentSocket = new WebSocket(this.webSocketHost + '/gomoku/ws/find')
      this.findOpponentSocket.onopen = this.findOpponentSocketOnOpen
      this.findOpponentSocket.onmessage = this.findOpponentSocketOnMessage
      this.findOpponentSocket.onclose = this.findOpponentSocketOnClose
    },
    cancelFinding() {
      this.findOpponentSocket.close()
    },
    giveUp() {
      this.gomokuPartySocket.close()
    },
    findOpponentSocketOnMessage(e) {
      let data = JSON.parse(e.data)

      this.partyID = data['party_id']

      if (data['player_1'] === this.username) this.opponent = data['player_2']
      else this.opponent = data['player_1']

      this.findOpponentSocket.close()

      this.gomokuPartySocket = new WebSocket(this.webSocketHost + '/gomoku/ws/play/' + data['party_id'])
      this.gomokuPartySocket.onopen = this.gomokuPartySocketOnOpen
      this.gomokuPartySocket.onmessage = this.gomokuPartySocketOnMessage
      this.gomokuPartySocket.onclose = this.gomokuPartySocketOnClose

      this.returnMoveSocket = new WebSocket(this.webSocketHost + '/gomoku/ws/chat/' + data['party_id'])
      this.returnMoveSocket.onmessage = this.returnMoveSocketOnMessage
    },
    findOpponentSocketOnOpen() {
      this.findOpponentSocket.send(JSON.stringify({
        'access_token': this.getCookie('access')
      }))
    },
    findOpponentSocketOnClose(e) {
      if (e.code === 1006) {
        this.$emit('create-alert', {
          level: 'danger',
          title: 'Соединение потеряно.'
        })
      }

      this.gameStatus = false
    },
    gomokuPartySocketOnMessage(e) {
      this.data = JSON.parse(e.data)

      if (this.data.move === 'exit') {
        if (this.data.username === this.opponent) {
          this.gomokuPartySocket.close()
        }
      } else if (this.data['win']) {
          this.gomokuPartySocket.close()
      } else {
        let dot = document.querySelector('#' + this.data.move)
        this.selectDot(dot)

        if (this.data.username === this.username) this.myMove = false
        else if (this.data.username === this.opponent) {
          this.myMove = true

          if (this.moves.length === 1) this.currentColor = 'blue'
        }
      }
    },
    gomokuPartySocketOnOpen() {
      this.gomokuPartySocket.send(JSON.stringify({
        'access_token': this.getCookie('access')
      }))
      this.gameStatus = 'playing'
      this.resetBoard(false)
      this.$emit('create-alert', {
        level: 'simple',
        title: `Вы играете против ${this.opponent}`
      })
    },
    gomokuPartySocketOnClose(e) {
      if (e.code === 1000) {
        try {
          if (this.data.move === 'exit' && this.data.username === this.opponent) {
            this.$emit('create-alert', {
              level: 'success',
              title: 'Вы выиграли. Соперник сдался.'
            })
          } else if (this.data['win']) {
            for (let dotID of JSON.parse(this.data['row_moves'])) {
              const dot = document.querySelector('#' + dotID)
              this.selectDot(dot)
              dot.classList.add('bg-red-400')
              dot.classList.remove('bg-main')
              dot.classList.remove('dark:bg-main-dark2')
              dot.classList.remove('bg-white')
              dot.classList.remove('dark:bg-gray-300')
            }

            if (this.data.username === this.username) {
              this.$emit('create-alert', {
                level: 'success',
                title: 'Вы выиграли.'
              })
            } else if (this.data.username === this.opponent) {
              this.$emit('create-alert', {
                level: 'danger',
                title: 'Вы проиграли.'
              })
            }
          }
        } catch (e) {
          {
            this.$emit('create-alert', {
              level: 'danger',
              title: 'Вы проиграли.'
            })
          }
        }
      } else if (e.code === 1006) {
        this.$emit('create-alert', {
          level: 'danger',
          title: 'Соединение потеряно.'
        })
      }

      this.partyID = null
      this.opponent = null
      this.myMove = true
      this.data = null
      this.gameStatus = false
      this.returnMoveSocket.close()
    },
    returnMoveSocketOnMessage(e) {
      const data = JSON.parse(e.data)

      if (data['command'] === 'return_move') {
        let alert_title

        if (data['returner'] === this.username)
          alert_title = 'Вы отправили запрос на отмену хода.'
        else if (data['returner'] === this.opponent)
          alert_title = `Соперник запрашивает отмену хода.
            <button class="acceptReturnMoveButton">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button class="declineReturnMoveButton">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
        `

        this.$emit('create-alert', {
          level: 'simple',
          title: alert_title
        })

        const _socket = this.returnMoveSocket
        const _accessToken = this.getCookie('access')

        setTimeout(function(socket = _socket, accessToken = _accessToken) {
          const acceptOrDeclineReturnMove = function(command) {
            socket.send(JSON.stringify({
              command: command,
              returner: data['returner'],
              access_token: accessToken,
              returnable_move: data['returnable_move']
            }))
          }

          for (let acceptReturnMoveButton of document.querySelectorAll('button.acceptReturnMoveButton')) {
            acceptReturnMoveButton.addEventListener('click', function() {
              acceptOrDeclineReturnMove('return_move_accept')
            })
          }

          for (let declineReturnMoveButton of document.querySelectorAll('button.declineReturnMoveButton')) {
            declineReturnMoveButton.addEventListener('click', function() {
              acceptOrDeclineReturnMove('return_move_decline')
            })
          }
        }, 1000)
      } else if (data['command'] === 'return_move_accept') {
        const returnableMoveID = data['returnable_move']
        const returnableMove = document.querySelector('#' + returnableMoveID)
        const index = this.moves.indexOf(returnableMoveID)

        returnableMove.className = this.dotClassName
        returnableMove.innerHTML = ''
        this.moves.splice(index, 1)

        let alert_title

        if (data['returner'] === this.username) {
          alert_title = 'Вы отменили ход.'
          this.myMove = true
        } else if (data['returner'] === this.opponent) {
          alert_title = 'Соперник отменил ход.'
          this.myMove = false
        }

        this.$emit('create-alert', {
          level: 'success',
          title: alert_title
        })

        try {
          document.querySelector('button.acceptReturnMoveButton').closest('[role="alert"]').remove()
        } catch (e) {}
      } else if (data['command'] === 'return_move_decline') {
        if (data['returner'] === this.username) {
          this.$emit('create-alert', {
            level: 'danger',
            title: 'Вы не отменили ход.'
          })
        } else if (data['returner'] === this.opponent) {
          this.$emit('create-alert', {
            level: 'simple',
            title: 'Соперник не отменил ход.'
          })
        }

        try {
          document.querySelector('button.acceptReturnMoveButton').closest('[role="alert"]').remove()
        } catch (e) {}
      }
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
      if (
          target.classList.contains('bg-white') ||
          target.classList.contains('bg-main') ||
          target.classList.contains('bg-red-400')
      ) return

      try {
        const lastMove = document.querySelector('.border-yellow-500')
        lastMove.classList.remove('border-yellow-500')
        lastMove.classList.add('border-main')
      } catch (e) {}

      if (
        (this.myMove && this.currentColor === 'white') ||
        (!this.myMove && this.currentColor === 'blue')
      ) {
        target.classList.add('bg-white')
        target.classList.add('dark:bg-gray-300')
        target.classList.add('text-black')
      } else if (
          (this.myMove && this.currentColor === 'blue') ||
          (!this.myMove && this.currentColor === 'white')
      ) {
        target.classList.add('bg-main')
        target.classList.add('dark:bg-main-dark2')
        target.classList.add('text-gray-100')
      }

      if (this.gameStatus !== 'playing') {
        if (this.currentColor === 'white') this.currentColor = 'blue'
        else this.currentColor = 'white'
      }

      target.classList.add('border-yellow-500')
      target.classList.add('border-2')
      this.moves.push(target)
      target.innerHTML = this.moves.length
    },
    resetBoard(showAlert = true) {
      if (this.gameStatus === 'playing' && showAlert) {
        this.$emit('create-alert', {
          level: 'warning',
          title: 'Во время игры нельзя очищать поле.'
        })
      } else {
        for (let dot of document.querySelectorAll('.dot')) {
          dot.className = this.dotClassName
          dot.innerHTML = ''
        }
      }

      this.moves = []
      this.currentColor = 'white'
    },
    returnMove() {
      if (this.moves.length !== 0) {
        const lastDot = this.moves[this.moves.length - 1]

        if (this.gameStatus === 'playing') {
          if (
              (this.currentColor === 'white' && lastDot.classList.contains('bg-main')) ||
              (this.currentColor === 'blue' && lastDot.classList.contains('bg-white'))
          ) {
            this.$emit('create-alert', {
              level: 'warning',
              title: 'Последний ход не Ваш.'
            })
          } else {
            this.returnMoveSocket.send(JSON.stringify({
              access_token: this.getCookie('access'),
              command: 'return_move',
              returnable_move: lastDot.id,
              returner: this.username
            }))
          }
        } else {
          lastDot.className = this.dotClassName
          lastDot.innerHTML = ''
          this.moves.pop()

          if (this.currentColor === 'white') this.currentColor = 'blue'
          else this.currentColor = 'white'
        }
      }
    }
  }
}
</script>

<style scoped>
section {
  max-width: 1800px;
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