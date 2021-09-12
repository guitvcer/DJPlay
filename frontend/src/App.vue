<template>
  <div id="app" class="h-full">
    <the-header
      v-if="$route.name !== 'authorization' && $route.name !== 'registration' && status === 200"
      @create-alert="createAlert"
      :user="user"
      @load-user="setUserInfo"
    />
    <alert v-if="alerts.length" :alerts="alerts" />

    <!-- Content -->
    <main :class="[$route.name === 'chat' || $route.name === 'chats' ? '' : 'px-4 py-8 overflow-y-auto']">
      <router-view v-if="status === 200" @create-alert="createAlert" @load-user="setUserInfo" @api-error="apiError" />
      <forbidden v-else-if="status === 403" @redirect="this.status = 200" />
      <not-found v-else-if="status === 404" @redirect="this.status = 200" />
      <server-error v-else-if="status === 500" @redirect="this.status = 200" />
    </main>
  </div>
</template>

<script>
import Alert from '@/components/Interface/Alert'
import TheHeader from '@/components/Home/TheHeader'
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
      chatSocket: null,
      status: 200,
      newMessageSound: new Audio(`${this.host}/media/sounds/message.mp3`)
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

      if (this.isAuthenticated()) this.openChatSocket()
    },
    chatSocketOnOpen() {
      this.chatSocket.send(JSON.stringify({
        access: this.getCookie('access')
      }))
    },
    chatSocketOnMessage(e) {
      const data = JSON.parse(e.data)

      if (data.status === 400) return

      const message = data.message

      if (this.$route.params.username === message.sentFrom.username) return

      const title = `
        <div class="flex hover:bg-gray-100 p-2 rounded">
          <div>
            <div
              style="background-image: url(${this.host}${message.sentFrom.avatar}); background-size: 100% 100%"
              class="w-12 h-12 rounded flex justify-end items-end"
            >
              <div class="rounded w-4 h-4 bg-green-500"></div>
            </div>
          </div>
          <div class="ml-3">
            <h2 class="text-xl font-semibold">${message.sentFrom.username}</h2>
            <p class="text-gray-500">${message.text}</p>
          </div>
        </div>`

      this.alerts.push({
        title: title,
        level: 'simple',
        url: `/chat/${message.sentFrom.username}/`
      })
      this.newMessageSound.play()
    },
    openChatSocket() {
      this.chatSocket = new WebSocket(this.webSocketHost + '/ws')
      this.chatSocket.onopen = this.chatSocketOnOpen
      this.chatSocket.onmessage = this.chatSocketOnMessage
    },
    apiError(error) {
      this.status = error.response.status
    }
  },
  async mounted() {
    await this.setUserInfo()
  }
}
</script>

<style>
main {
  height: calc(100% - 98px)
}

@media screen and (max-width: 768px) {
  main {
    height: calc(100% - 90px)
  }
}
</style>