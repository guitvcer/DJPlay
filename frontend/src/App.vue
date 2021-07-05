<template>
  <div id="app">
    <the-header />

    <!-- Content -->
    <main class="bg-gray-100 dark:bg-main-dark2 min-h-screen py-8">
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