<template>
  <section
    :class="[
      !loading ? 'bg-gray-50 dark:bg-main-dark h-5/6' : 'justify-center',
      ' flex mx-auto rounded h-full'
    ]"
    style="max-width: 1200px;"
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
import { mapMutations } from "vuex";
import api from "../../api/index";
import axios from 'axios'
import Loading from "../../components/interfaace/Loading.vue";
import LeftBlock from "../../components/chat/LeftBlock.vue";
import RightBlock from "../../components/chat/RightBlock.vue";

export default {
  components: { Loading, LeftBlock, RightBlock },
  data() {
    return {
      chats: null,
      chat: null,
      loading: true,
      display: "chats",
      chatSocket: null,
      interlocutor: null,
    }
  },
  methods: {
    ...mapMutations(["createAlert"]),
    async loadChats() {
      this.chats = await api.chat.getChats();
      this.loading = false;
    },
    async loadChat() {
      setTimeout(async () => {
        this.chat = await api.chat.getChat(this.$route.params.username);

        const username = document.getElementById("username").innerHTML;

        if (this.chat['user1'].username === username) {
          this.interlocutor = this.chat["user2"];
        } else {
          this.interlocutor = this.chat["user1"];
        }

        document.title = `Сообщения - ${this.interlocutor.username}`;

        this.chatSocket = new WebSocket(`${this.webSocketHost}/ws`);
        this.chatSocket.onopen = this.chatSocketOnOpen;
        this.chatSocket.onmessage = this.chatSocketOnMessage;
      }, 10)
    },
    unselectChat() {
      this.$router.push("/chat/");
      this.chat = null;
      this.display = "chats";

      try {
        this.chatSocket.close();
      } catch (e) {}
    },
    setEventForEscape() {
      document.addEventListener("keyup", event => {
        if (event.keyCode === 27) {
          this.unselectChat();
        }
      });
    },
    submitMessage(messageText) {
      messageText = messageText.trim();

      if (messageText === "") {
        this.createAlert({
          title: "Нельзя отправлять пустые сообщения.",
          level: "danger",
        });

        return;
      }

      this.chatSocket.send(JSON.stringify({
        messageText: messageText,
        chatId: this.chat.id,
      }));
    },
    chatSocketOnOpen() {
      this.chatSocket.send(JSON.stringify({
        access: this.getCookie("access"),
        chatId: this.chat.id,
      }));
    },
    chatSocketOnMessage(e) {
      const data = JSON.parse(e.data);

      if (data.status === 400 || !this.chat) {
        return;
      }

      const newMessage = data.message;

      for (const message of this.chat.messages) {
        if (message.id === newMessage.id) {
          return;
        }
      }

      this.chat.messages.push(newMessage);
      this.loadChats();
    },
  },
  async mounted() {
    if (!this.isAuthenticated()) {
      this.createAlert({
        title: "Вы не авторизованы.",
        level: "danger",
      });

      await this.$router.push('/');
    } else {
      document.title = "Сообщения"

      await this.loadChats();
      this.setEventForEscape();

      if (this.$route.params.username) {
        await this.loadChat();
      }
    }
  },
}
</script>