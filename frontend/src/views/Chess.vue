<template>
  <section class="flex flex-col-reverse 2xl:flex-row mx-auto justify-center 2xl:justify-between px-0 md:px-16">
    <div v-if="!loading" class="max-w-3xl mx-0 mx-auto 2xl:mx-4 mt-12 md:mt-20 2xl:mt-0">
      <img :src="gameBackgroundUrl" :alt="game.name">
    </div>
    <div v-if="!loading" class="bg-main dark:bg-main-dark text-gray-100 max-w-2xl rounded-md shadow-xl px-6 md:px-12 py-12 md:py-20 flex flex-col justify-between mx-0 mx-auto 2xl:mx-4">
      <div>
        <h2 class="text-2xl md:text-4xl mb-4">{{ game.name }}</h2>
        <p class="mb-12 md:mb-20" v-html="game.rules" />
      </div>
      <div>
        <button class="px-6 py-4 w-full text-xl md:text-2xl font-semibold bg-gray-200 hover:bg-gray-300 text-black border rounded-md dark:border-main-dark2 dark:bg-main-dark2 dark:text-gray-200 dark:hover:bg-main">Найти соперника</button>
      </div>
    </div>
  </section>
</template>

<script>
import Alert from '@/components/Alert'

export default {
  data() {
    return {
      loading: true,
      game: {}
    }
  },
  components: {
    Alert
  },
  mounted() {
    this.sendRequest(this.host + '/chess/').then(json => {
      if (json.type === 'alert') for (let alert of json.alerts) this.$emit('create-alert', alert)
      else {
        this.game = json
        this.loading = false
      }
    })
  },
  computed: {
    gameBackgroundUrl() {
      if (!this.loading)
        return this.host + '/media/' + this.game.app_name + '/board_background.png'
    }
  }
}
</script>

<style scoped>
section {
  max-width: 1800px;
}
</style>