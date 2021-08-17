<template>
  <section class="flex justify-center flex-wrap">
    <alert :alerts="alerts" />
    <loading v-if="loading" />
    <home-game-item v-for="(game, index) in games" :key="index" :game="game" v-if="!loading && games.length > 0" />
    <h2 v-else-if="!loading && games.length === 0" class="text-4xl font-semibold">Игр не найденo</h2>
  </section>
</template>

<script>
import axios from 'axios'
import Alert from '@/components/Alert'
import HomeGameItem from '@/components/HomeGameItem'
import Loading from '@/components/Loading'

export default {
  components: {
    Alert, HomeGameItem, Loading
  },
  data() {
    return {
      games: [],
      loading: true,
      alerts: []
    }
  },
  methods: {
    async loadGameList() {
      await axios
        .get(this.host + '/account/games/')
        .then(response => {
          this.games = response.data
          this.loading = false
        })
        .catch(error => {
          this.$emit('api-error', error)
        })
    }
  },
  async mounted() {
    await this.loadGameList()

    document.title = 'DJPlay'
  }
}
</script>