<template>
  <div ref="messages" class="py-4 px-2 overflow-y-auto h-full" style="max-height: calc(100% - 81px);">
    <message
      v-if="messages.length"
      v-for="(message, index) in messages"
      :key="index"
      :message="message"
      :index="index"
    />
    <chat-small-text v-else>Начало общения</chat-small-text>
  </div>
</template>

<script>
import ChatSmallText from "./ChatSmallText.vue";
import Message from "./Message.vue";

export default {
  props: {
    messages: {
      type: Array,
      required: true,
    },
  },
  components: { ChatSmallText, Message },
  methods: {
    scrollToEnd() {
      this.$refs.messages.scrollTo(0, this.$refs.messages.scrollHeight);
    },
  },
  mounted() {
    this.scrollToEnd();
  },
}
</script>