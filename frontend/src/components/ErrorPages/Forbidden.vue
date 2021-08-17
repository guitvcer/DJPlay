<template>
  <section class="flex flex-col items-center pt-32">
    <h2 class="font-bold text-9xl">403</h2>
    <p class="font-bold text-3xl mt-6 mb-3">Страница не доступна</p>
    <router-link to="/" class="font-semibold" @click="$emit('redirect')">На главную</router-link> </section>
</template>