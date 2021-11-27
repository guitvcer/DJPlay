<template>
  <section class="flex justify-center flex-wrap">
    <loading v-if="loading" />
    <home-game-item
      v-if="!loading && games.length > 0"
      v-for="(game, index) in games"
      :key="index"
      :game="game"
    />
    <h2
      v-else-if="!loading && games.length === 0"
      class="text-4xl font-semibold"
    >Игр не найденo</h2>
  </section>
</template>

<script>
import axios from 'axios'
import HomeGameItem from "../../components/Home/HomeGameItem.vue";
import Loading from "../../components/Interface/Loading.vue";

export default {
  components: { HomeGameItem, Loading },
  data() {
    return {
      games: [],
      loading: true,
    }
  },
  methods: {
    async loadGameList() {
      await axios
        .get(this.host + "/api/account/games/")
        .then(response => {
          this.games = response.data;
          this.loading = false;
        });
    }
  },
  async mounted() {
    await this.loadGameList();

    document.title = "DJPlay";
  },
}
</script>