<template>
  <header class="bg-gray-50 dark:bg-main-dark border-b-2 border-main-light dark:border-main">
    <alert v-if="alerts.length" :alerts="alerts" />
    <div class="container mx-auto flex justify-between items-center h-full py-3 px-6 md:px-10 lg:px-20" style="max-width: 1750px;">
      <!-- Logo -->
      <div class="h-full">
        <router-link to="/">
          <h1 class="bg-main dark:bg-main-dark2 text-white text-4xl px-8 py-3 font-monoton rounded border-red">DJPLAY</h1>
        </router-link>
      </div>

      <!-- User Dropdown -->
      <dropdown @create-alert="createAlert" />
    </div>
  </header>
</template>

<script>
import Alert from '@/components/Alert'
import Dropdown from '@/components/Dropdown'

export default {
  components: {
    Alert, Dropdown
  },
  data() {
    return {
      alerts: []
    }
  },
  methods: {
    createAlert(alert) {
      this.alerts.push(alert)
    }
  }
}
</script>