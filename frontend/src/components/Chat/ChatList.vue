<template>
  <div class="px-1 mt-2">
    <chat-list-item
      v-for="(chat, index) in chats"
      :key="index"
      :chat="chat"
      @load-chat="$emit('load-chat')"
    />
  </div>
</template>

<script>
import ChatListItem from '@/components/Chat/ChatListItem'

export default {
  components: {
    ChatListItem
  },
  props: {
    chats: {
      type: Array,
      required: true
    }
  }
}
</script>