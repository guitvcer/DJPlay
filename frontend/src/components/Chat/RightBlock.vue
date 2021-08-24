<template>
  <div
    :class="[display === 'chats' ? 'hidden ' : '', 'w-full md:flex flex-col justify-between']"
    style="height: 700px"
  >
    <select-chat v-if="!chat" />

    <div v-if="chat" class="w-full h-full" style="max-height: calc(100% - 55px)">
      <the-chat-header :interlocutor="interlocutor" @unselectChat="$emit('unselectChat')" />
      <messages ref="messages" :messages="chat.messages" />
    </div>
    <send-message-form v-if="chat" @submit-message="submitMessage" />
  </div>
</template>

<script>
import SelectChat from '@/components/Chat/SelectChat'
import SendMessageForm from '@/components/Chat/SendMessageForm'
import Messages from '@/components/Chat/Messages'
import TheChatHeader from '@/components/Chat/TheChatHeader'

export default {
  components: {
    SelectChat,
    SendMessageForm,
    Messages,
    TheChatHeader
  },
  props: {
    display: {
      type: String,
      required: true
    },
    chat: {
      required: true
    }
  },
  data() {
    return {
      interlocutor: null
    }
  },
  methods: {
    setInterlocutor() {
      const username = document.getElementById('username').innerHTML

      if (this.chat['user1']['username'] === username) this.interlocutor = this.chat['user2']
      else this.interlocutor = this.chat['user1']
    },
    submitMessage(messageText) {
      this.$emit('submit-message', messageText)
    }
  },
  watch: {
    chat() {
      if (this.chat) {
        // this.$refs.messages.scrollToEnd()
        this.setInterlocutor()
      }
    }
  }
}
</script>