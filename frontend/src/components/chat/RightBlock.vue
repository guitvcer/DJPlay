<template>
  <div
    :class="[display === 'chats' ? 'hidden ' : '', 'w-full md:flex flex-col justify-between h-full']"
  >
    <chat-small-text v-if="!chat" class="mt-20">
      Выберите чат, чтобы написать.
    </chat-small-text>

    <div v-if="chat" class="w-full h-full" style="max-height: calc(100% - 55px);">
      <the-chat-header />
      <messages />
    </div>

    <send-message-form v-if="chat" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ChatSmallText from "./ChatSmallText.vue";
import SendMessageForm from "./SendMessageForm.vue";
import Messages from "./Messages.vue";
import TheChatHeader from "./TheChatHeader.vue";

export default {
  components: {
    ChatSmallText, SendMessageForm, Messages, TheChatHeader,
  },
  computed: mapGetters(["chat"]),
}
</script>