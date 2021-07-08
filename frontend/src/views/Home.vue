<template>
  <section class="flex justify-center flex-wrap">
    <home-game-item v-for="(game, index) in games" :key="index" :game="game" v-if="!loading" />
  </section>
</template>

<script>
import HomeGameItem from '@/components/HomeGameItem'

export default {
  components: {
    HomeGameItem
  },
  data() {
    return {
      games: [],
      loading: true
    }
  },
  mounted() {
    fetch(this.host + '/account/games/')
      .then(response => response.json())
      .then(json => {
        this.games = json;
        this.loading = false;
      })
  }
}
</script>