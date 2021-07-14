<template>
  <div id="app">
    <the-header
        v-if="$route.name !== 'authorization' && $route.name !== 'registration'"
        @create-alert="createAlert"
        :user="user"
        @load-user="setUserInfo"
    />
    <alert v-if="alerts.length" :alerts="alerts" />

    <!-- Content -->
    <main class="px-4 py-8">
      <router-view @create-alert="createAlert" @load-user="setUserInfo" />
    </main>
  </div>
</template>

<script>
import Alert from '@/components/Alert'
import TheHeader from '@/components/TheHeader'

export default {
  name: 'App',
  data() {
    return {
      alerts: [],
      user: {
        username: 'Гость',
        avatar: '/media/user.png'
      }
    }
  },
  components: {
    Alert, TheHeader
  },
  methods: {
    createAlert(alert) {
      this.alerts.push(alert)
    },
    setUserInfo() {
      try {
        this.getUserInfo().then(json => this.user = json)
      } catch (e) {
        this.user = {
          username: 'Гость',
          avatar: '/media/user.png'
        }
      }
    }
  },
  mounted() {
    this.setUserInfo()
  }
}
</script>