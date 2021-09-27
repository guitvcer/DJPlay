<template>
  <div class="bg-gray-50 dark:bg-main-dark dark:hover:bg-main rounded hover:bg-white pt-8 pb-24 px-16 flex flex-col items-center mx-5 my-4">
    <img :src="this.host + game.image" :alt="game.name" class="w-60 mb-10">
    <h3 class="font-bold text-3xl mb-4">{{ game.name }}</h3>
    <router-link
      :to="{ name: game.appName }"
      class="border-main border px-3 py-2 rounded text-center hover:bg-main dark:hover:bg-main-dark hover:text-white dark:bg-main-dark2"
    >Играть<span v-if="!game['isReleased']"> (в разработке)</span>
    </router-link>
  </div>
</template>

<script>
export default {
  props: {
    game: {
      type: Object,
      required: true
    }
  }
}
</script>