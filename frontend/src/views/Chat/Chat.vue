<template>
  <section
    :class="[
      !loading ? 'bg-gray-50 dark:bg-main-dark h-5/6' : 'justify-center',
      ' flex mx-auto rounded h-full'
    ]"
    style="max-width: 1200px"
  >
    <loading v-if="loading" />
    <left-block v-if="!loading" :display="display" :chats="chats" @load-chat="loadChat" />
    <right-block
      v-if="!loading"
      ref="rightBlock"
      :display="display"
      :chat="chat"
      @unselectChat="unselectChat"
      @submit-message="submitMessage"
    />
  </section>
</template>

<script>
import axios from 'axios'
import Loading from '@/components/Interface/Loading'
import LeftBlock from '@/components/Chat/LeftBlock'
import RightBlock from '@/components/Chat/RightBlock'

export default {
  components: {
    Loading, LeftBlock, RightBlock
  },
  data() {
    return {
      chats: null,
      chat: null,
      loading: true,
      display: 'chats',
      chatSocket: null
    }
  },
  methods: {
    async loadChats() {
      await axios
        .get(`${this.host}/chat/`)
        .then(response => {
          this.chats = response.data
          this.loading = false
        })
        .catch(error => this.$emit('api-error', error))
    },
    async loadChat() {
      setTimeout(async () => {
        await axios
          .get(`${this.host}/chat/${this.$route.params.username}`)
          .then(response => {
            this.chat = response.data
            this.display = 'chat'
          })
          .catch(error => this.$emit('api-error', error))

        const url = `${this.webSocketHost}/chat/ws/${this.interlocutor.username}/${this.getCookie('access')}/`
        this.chatSocket = new WebSocket(url)
        this.chatSocket.onmessage = this.chatSocketOnMessage
      }, 10)
    },
    unselectChat() {
      this.$router.push('/chat/')
      this.chat = null
      this.display = 'chats'

      try {
        this.chatSocket.close()
      } catch (e) {}
    },
    setEventForEscape() {
      document.addEventListener('keyup', event => {
        if (event.keyCode == '27') this.unselectChat()
      })
    },
    submitMessage(messageText) {
      this.chatSocket.send(JSON.stringify({
        text: messageText
      }))
    },
    chatSocketOnMessage(e) {
      const newMessage = JSON.parse(e.data).message

      for (const message of this.chat.messages) {
        if (message.id === newMessage.id) return
      }

      this.chat.messages.push(newMessage)
      this.loadChats()
    }
  },
  async mounted() {
    if (!this.isAuthenticated()) {
      this.$emit('create-alert', {
        title: 'Вы не авторизованы.',
        level: 'danger'
      })
      await this.$router.push('/')
    } else {
      document.title = 'Сообщения'

      await this.loadChats()
      this.setEventForEscape()

      if (this.$route.params.username) {
        await this.loadChat()
        document.title = `Сообщения - ${this.interlocutor.username}`
      }
    }
  },
  computed: {
    interlocutor() {
      const username = document.getElementById('username').innerHTML

      if (this.chat.user1.username === username) return this.chat['user2']
      else return this.chat['user1']
    }
  }
}
</script>