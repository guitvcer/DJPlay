<template>
  <section class="flex justify-center flex-wrap">
    <alert :alerts="alerts" />
    <home-game-item v-for="(game, index) in games" :key="index" :game="game" v-if="!loading" />
  </section>
</template>

<script>
import Alert from '@/components/Alert'
import HomeGameItem from '@/components/HomeGameItem'

export default {
  components: {
    Alert, HomeGameItem
  },
  data() {
    return {
      games: [],
      loading: true,
      alerts: []
    }
  },
  mounted() {
    this.sendRequest(this.host + '/account/games/')
      .then(json => {
        if (json.type === 'alert') {
          this.alerts.push(json)
        } else {
          this.games = json
          this.loading = false
        }
      })
  }
}
</script>