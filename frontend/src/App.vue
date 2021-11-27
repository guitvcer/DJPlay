<template>
  <div id="app" class="h-full">
    <loading v-if="userLoading" />
    <the-header
      v-if="!userLoading && $route.name !== 'authorization' && $route.name !== 'registration' && status === 200"
      @load-user="setUserInfo"
    />
    <alerts v-if="!userLoading" />
    <modal v-if="!userLoading" />

    <!-- Content -->
    <main
      v-if="!userLoading"
      :class="[$route.name === 'chat' || $route.name === 'chats' ? '' : 'px-4 py-8 overflow-y-auto']"
    >
      <router-view v-if="status === 200" @load-user="setUserInfo" @api-error="apiError" />
      <forbidden v-else-if="status === 403" />
      <not-found v-else-if="status === 404" />
      <server-error v-else-if="status === 500" />
    </main>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import Alerts from "./components/Interface/Alerts.vue";
import Modal from "./components/Interface/Modal.vue";
import TheHeader from "./components/Home/TheHeader.vue";
import Loading from "./components/Interface/Loading";
import Forbidden from "./components/ErrorPages/Forbidden.vue";
import NotFound from "./components/ErrorPages/NotFound.vue";
import ServerError from "./components/ErrorPages/ServerError.vue";

export default {
  name: 'App',
  data() {
    return {
      chatSocket: null,
      guest: {
        username: 'Гость',
        avatar: '/media/avatars/user.png'
      },
      user: this.guest,
      newMessageSound: new Audio(`${this.host}/media/sounds/message.mp3`)
    }
  },
  computed: mapGetters(["status", "userLoading"]),
  components: {
    Alerts, Modal, TheHeader, Loading, Forbidden, NotFound, ServerError
  },
  methods: {
    ...mapActions(["loadUser"]),
    ...mapMutations(["createAlert", "updateStatus"]),
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
        <div class="flex hover:bg-gray-100 p-2 rounded w-full">
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
            <p class="text-gray-500 break-all">${message.text}</p>
          </div>
        </div>`

      this.createAlert({
        level: "simple",
        url: `/chat/${message.sentFrom.username}/`,
        title: title,
      });
      this.newMessageSound.currentTime = 0
      this.newMessageSound.play()
    },
    openChatSocket() {
      this.chatSocket = new WebSocket(this.webSocketHost + '/ws')
      this.chatSocket.onopen = this.chatSocketOnOpen
      this.chatSocket.onmessage = this.chatSocketOnMessage
    },
    async apiError(error) {
      this.updateStatus(error.response.status);
    }
  },
  async mounted() {
    await this.loadUser();
    // await this.setUserInfo();
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
.grecaptcha-badge {
  opacity: 0
}
</style>