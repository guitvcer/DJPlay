<template>
  <section
      class="flex flex-col-reverse 2xl:flex-row mx-auto justify-center 2xl:justify-between px-0 md:px-16"
      @keydown.left="prevMove"
      @keydown.right="nextMove"
  >
    <loading v-if="loading" class="m-auto" />
    <gomoku-board v-if="!loading" name="GomokuParty" ref="gomokuBoard" />
    <start-panel
      v-if="!loading"
      name="GomokuParty"
      :party="party"
      :player1="player1"
      :player2="player2"
      @firstMove="firstMove"
      @prevMove="prevMove"
      @nextMove="nextMove"
      @lastMove="lastMove"
    />
    <control-panel
      v-if="!loading"
      name="GomokuParty"
      ref="controlPanel"
      @firstMove="firstMove"
      @prevMove="prevMove"
      @nextMove="nextMove"
      @lastMove="lastMove"
    />
  </section>
</template>

<script>
import axios from 'axios'
import ControlPanel from '@/components/Gomoku/ControlPanel'
import GomokuBoard from '@/components/Gomoku/GomokuBoard'
import StartPanel from '@/components/Gomoku/StartPanel'
import Loading from '@/components/Loading'

export default {
  components: {
    ControlPanel, GomokuBoard, StartPanel, Loading
  },
  data() {
    return {
      loading: true,
      currentColor: 'white',
      party: {},
      player1: {},
      player2: {},
      moves: []
    }
  },
  async mounted() {
    await axios
      .get(`${this.host}/gomoku/${this.$route.params.id}/`)
      .then(async response => {
        this.party = response.data

        await axios
          .get(`${this.host}/account/${this.party.player1}/`)
          .then(response => this.player1 = response.data)
          .catch(error => {
            this.player1 = {
              username: this.party.player1,
              avatar: '/media/user.png'
            }
          })

        await axios
          .get(`${this.host}/account/${this.party.player2}/`)
          .then(response => this.player2 = response.data)
          .catch(error => {
            this.player2 = {
              username: this.party.player2,
              avatar: '/media/user.png'
            }
          })

        this.loading = false
      })
      .catch(error => this.$emit('api-error', error))
  },
  methods: {
    firstMove() {
      const firstMoveCoordinate = this.party.moves[0]['coordinate']
      const firstDot = document.getElementById(firstMoveCoordinate)

      this.$refs.controlPanel.resetBoard()
      this.$refs.gomokuBoard.selectDot(firstDot)
    },
    prevMove() {
      if (this.loading || this.moves.length === 1) return

      this.moves.pop()
      const penultDot = this.moves[this.moves.length - 1]
      const lastDot = document.querySelector('.border-yellow-500')
      penultDot.classList.add('border-yellow-500')
      lastDot.className = this.dotClassName
      lastDot.innerHTML = ''

      if (this.currentColor === 'white') this.currentColor = 'blue'
      else this.currentColor = 'white'
    },
    nextMove() {
      if (this.loading || this.moves.length === this.party.moves.length) return

      const nextMoveCoordinate = this.party.moves[this.moves.length]['coordinate']
      const nextMove = document.getElementById(nextMoveCoordinate)

      this.$refs.gomokuBoard.selectDot(nextMove)
    },
    lastMove() {
      this.$refs.gomokuBoard.selectPartyDots()
    }
  }
}
</script>