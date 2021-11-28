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
import api from "../../api/index";
import HomeGameItem from "../../components/home/HomeGameItem.vue";
import Loading from "../../components/interface/Loading.vue";

export default {
  components: { HomeGameItem, Loading },
  data() {
    return {
      games: [],
      loading: true,
    }
  },
  methods: {
    async loadListOfGames() {
      this.games = await api.account.getListOfGames();
      this.loading = false;
    }
  },
  async mounted() {
    await this.loadListOfGames();

    document.title = "DJPlay";
  },
}
</script>