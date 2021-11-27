<template>
  <div
    :class="[display === 'chats' ? 'hidden ' : '', 'w-full md:flex flex-col justify-between h-full']"
  >
    <chat-small-text v-if="!chat" class="mt-20">
      Выберите чат, чтобы написать.
    </chat-small-text>

    <div v-if="chat" class="w-full h-full" style="max-height: calc(100% - 55px);">
      <the-chat-header :interlocutor="interlocutor" @unselectChat="$emit('unselectChat')" />
      <messages ref="messages" :messages="chat.messages" />
    </div>

    <send-message-form v-if="chat" @submit-message="submitMessage" />
  </div>
</template>

<script>
import ChatSmallText from "./ChatSmallText.vue";
import SendMessageForm from "./SendMessageForm.vue";
import Messages from "./Messages.vue";
import TheChatHeader from "./TheChatHeader";

export default {
  components: {
    ChatSmallText,
    SendMessageForm,
    Messages,
    TheChatHeader,
  },
  props: {
    display: {
      type: String,
      required: true,
    },
    chat: {
      required: true,
    },
  },
  data() {
    return {
      interlocutor: null,
    }
  },
  methods: {
    setInterlocutor() {
      const username = document.getElementById("username").innerHTML;

      if (this.chat["user1"]["username"] === username) {
        this.interlocutor = this.chat["user2"];
      } else {
        this.interlocutor = this.chat["user1"];
      }
    },
    submitMessage(messageText) {
      this.$emit("submit-message", messageText);
    },
  },
  watch: {
    chat() {
      if (this.chat) {
        this.setInterlocutor();
      }
    },
  },
}
</script>