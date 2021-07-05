<template>
  <div id="app">
    <the-header />

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