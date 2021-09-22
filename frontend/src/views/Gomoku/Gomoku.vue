<template>
  <section
    class="flex flex-col-reverse 2xl:flex-row mx-auto justify-center 2xl:justify-between px-0 md:px-16"
    style="max-width: 1800px"
  >
    <loading v-if="loading" class="m-auto" />
    <gomoku-board v-if="!loading" ref="gomokuBoard" name="Gomoku" />
    <start-panel
      v-if="!loading"
      name="Gomoku"
      :game="game"
      @find-opponent="findOpponent"
      @cancel-finding="cancelFinding"
      @give-up="giveUp"
    >
      <h2 class="text-2xl md:text-4xl mb-4">{{ game.name }}</h2>
      <p class="mb-12 md:mb-20">{{ game.rules }}</p>
    </start-panel>
    <control-panel v-if="!loading" ref="controlPanel" name="Gomoku" />
  </section>
</template>

<script>
import axios from 'axios'
import Loading from '@/components/Interface/Loading'
import ControlPanel from '@/components/Gomoku/ControlPanel'
import GomokuBoard from '@/components/Gomoku/GomokuBoard'
import StartPanel from '@/components/Gomoku/StartPanel'

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
      data: null,
      moves: [],
      currentColor: 'white',
      dotClassName: 'dot rounded-full pointer text-center text-xs sm:text-base flex items-center justify-center'
    }
  },
  components: {
    ControlPanel, GomokuBoard, StartPanel, Loading
  },
  async mounted() {
    await this.loadGame()

    this.username = document.querySelector('#username').innerHTML
    document.title = 'Гомоку - DJPlay'
  },
  computed: {
    gameBackgroundUrl() {
      if (!this.loading)
        return `${this.host}/media/${this.game.appName}/board_background.png`
    }
  },
  methods: {
    async loadGame() {
      await axios
        .get( this.host + '/api/gomoku/')
        .then(response => {
          this.game = response.data
          this.loading = false
        })
        .catch(error => {
          this.$emit('api-error', error)
        })
    },
    createAlert(alert) {
      this.$emit('create-alert', alert)
    },

    findOpponent() {
      if (this.username === 'Гость') {
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
              this.$refs.gomokuBoard.selectDot(dot)
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
            } else {
              this.$emit('create-alert', {
                level: 'danger',
                title: 'Вы проиграли.'
              })
            }
          }
        } catch (e) {
          this.$emit('create-alert', {
            level: 'danger',
            title: 'Вы проиграли.'
          })
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
        this.$refs.gomokuBoard.selectDot(dot)

        if (this.data.username === this.username) this.myMove = false
        else if (this.data.username === this.opponent) {
          this.myMove = true

          if (this.moves.length === 1) this.currentColor = 'blue'
        }

        try {
          document.querySelector('button.acceptReturnMoveButton').closest('[role="alert"]').remove()
        } catch (e) {}
      }
    },
    gomokuPartySocketOnOpen() {
      this.gomokuPartySocket.send(JSON.stringify({
        'access_token': this.getCookie('access')
      }))
      this.$refs.controlPanel.resetBoard()
      this.gameStatus = 'playing'
      this.$emit('create-alert', {
        level: 'simple',
        title: `Вы играете против ${this.opponent}`
      })
    },

    returnMoveSocketOnMessage(e) {
      const data = JSON.parse(e.data)

      if (data['command'] === 'return_move') {
        let alert_title

        if (data['returner'] === this.username) alert_title = 'Вы отправили запрос на отмену хода.'
        else if (data['returner'] === this.opponent) {
          alert_title = `
            <div class="flex items-center">
              <p>Соперник запрашивает отмену хода.</p>
              <div class="flex">
                <button class="acceptReturnMoveButton rounded p-2 hover:bg-gray-100 border-2 border-gray-500 mx-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button class="declineReturnMoveButton rounded p-2 hover:bg-gray-100 border-2 border-gray-500 mx-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>`
        }

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
    }
  }
}
</script>