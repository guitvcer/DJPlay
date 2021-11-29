<template>
  <div id="messages" class="py-4 px-2 overflow-y-auto h-full" style="max-height: calc(100% - 81px);">
    <message
      v-if="chat.messages.length"
      v-for="(message, index) in chat.messages"
      :key="index"
      :message="message"
      :index="index"
    />
    <chat-small-text v-else>Начало общения</chat-small-text>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ChatSmallText from "./ChatSmallText.vue";
import Message from "./Message.vue";
import { scrollToEnd } from "../../scripts/chat/index";

export default {
  components: { ChatSmallText, Message },
  computed: mapGetters(["chat"]),
  mounted: scrollToEnd,
}
</script>