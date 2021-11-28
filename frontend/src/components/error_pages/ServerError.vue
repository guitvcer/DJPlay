<template>
  <section class="flex flex-col items-center pt-32">
    <h2 class="font-bold text-9xl">500</h2>
    <p class="font-bold text-3xl mt-6 mb-3">Внутренняя ошибка сервера</p>

    <router-link
      to="/"
      class="font-semibold"
      @click="updateStatus(200)"
    >На главную</router-link>
  </section>
</template>

<script>
import { mapMutations } from "vuex";

export default {
  methods: mapMutations(["updateStatus"]),
}
</script>