<template>
  <section
    class="flex flex-col-reverse 2xl:flex-row mx-auto justify-center 2xl:justify-between px-0 md:px-16"
    style="max-width: 1800px"
  >
    <loading v-if="loading" class="m-auto" />
    <chess-board v-if="!loading" ref="chessBoard" name="Chess" />
    <start-panel
      v-if="!loading"
      name="Chess"
      :game="game"
      @find-opponent="findOpponent"
      @cancel-finding="cancelFinding"
      @give-up="giveUp"
    >
      <h2 class="text-2xl md:text-4xl mb-4">{{ game.name }}</h2>
      <p class="mb-12 md:mb-20" v-html="game.rules"></p>
    </start-panel>
    <control-panel v-if="!loading" ref="controlPanel" name="Chess" />
  </section>
</template>

<script>
import axios from 'axios'
import Loading from '@/components/Interface/Loading'
import ChessBoard from '@/components/Chess/ChessBoard'
import StartPanel from '@/components/Chess/StartPanel'
import ControlPanel from '@/components/Chess/ControlPanel'

export default {
  components: {
    Loading, ChessBoard, StartPanel, ControlPanel
  },
  data() {
    return {
      loading: true,
      game: null,
      gameStatus: null,
      findOpponentSocket: null,
      chessPartySocket: null,
      returnMoveSocket: null,
      partyID: null,
      opponent: null,
      username: null,
      currentColor: 'white',
      data: null,
      moves: [],
      pieces: [],
      moveOf: 'white',
      check: null
    }
  },
  async mounted() {
    await axios
      .get(`${this.host}/api/chess/`)
      .then(response => {
        this.game = response.data
        this.loading = false
      })
      .catch(error => this.$emit('api-error', error))
  },
  methods: {
    findOpponent() {},
    cancelFinding() {},
    giveUp() {},
    offerDraw() {}
  }
}
</script>