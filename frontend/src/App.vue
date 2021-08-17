<template>
  <div id="app">
    <the-header
        v-if="$route.name !== 'authorization' && $route.name !== 'registration' && status === 200"
        @create-alert="createAlert"
        :user="user"
        @load-user="setUserInfo"
    />
    <alert v-if="alerts.length" :alerts="alerts" />

    <!-- Content -->
    <main class="px-4 py-8">
      <router-view v-if="status === 200" @create-alert="createAlert" @load-user="setUserInfo" @api-error="apiError" />
      <forbidden v-else-if="status === 403" @redirect="this.status = 200" />
      <not-found v-else-if="status === 404" @redirect="this.status = 200" />
      <server-error v-else-if="status === 500" @redirect="this.status = 200" />
    </main>
  </div>
</template>

<script>
import Alert from '@/components/Alert'
import TheHeader from '@/components/TheHeader'
import Forbidden from '@/components/ErrorPages/Forbidden'
import NotFound from '@/components/ErrorPages/NotFound'
import ServerError from '@/components/ErrorPages/ServerError'

export default {
  name: 'App',
  data() {
    return {
      alerts: [],
      user: {
        username: 'Гость',
        avatar: '/media/user.png'
      },
      connectionSocket: null, // websocket for setting value for is_online
      status: 200,
    }
  },
  components: {
    Alert, TheHeader, Forbidden, NotFound, ServerError
  },
  methods: {
    createAlert(alert) {
      this.alerts.push(alert)
    },
    async setUserInfo() {
      this.user = await this.getUserInfo()

      if (this.isAuthenticated()) this.openConnectionSocket()
    },
    connectionSocketOnOpen() {
      this.connectionSocket.send(JSON.stringify({
        access_token: this.getCookie('access')
      }))
    },
    openConnectionSocket() {
      this.connectionSocket = new WebSocket(this.webSocketHost + '/ws')
      this.connectionSocket.onopen = this.connectionSocketOnOpen
    },
    apiError(error) {
      this.status = error.response.status
    }
  },
  mounted() {
    this.setUserInfo()
  }
}
</script>