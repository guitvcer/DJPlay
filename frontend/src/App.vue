<template>
  <div id="app">
    <the-header v-if="$route.name !== 'authorization' && $route.name !== 'registration'" />

    <!-- Content -->
    <main class="px-4 py-8">
      <router-view />
    </main>
  </div>
</template>

<script>
import TheHeader from '@/components/TheHeader'

export default {
  name: 'App',
  components: {
    TheHeader
  }
}
</script>