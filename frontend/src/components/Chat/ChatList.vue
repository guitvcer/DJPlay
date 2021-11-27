<template>
  <div class="px-1 mt-2">
    <chat-list-item
      v-if="chats.length > 0"
      v-for="(chat, index) in chats"
      :key="index"
      :chat="chat"
      @load-chat="$emit('load-chat')"
    />
  </div>
</template>

<script>
import ChatListItem from "./ChatListItem.vue";

export default {
  components: { ChatListItem },
  props: {
    chats: {
      type: Array,
      required: true,
    },
  },
}
</script>