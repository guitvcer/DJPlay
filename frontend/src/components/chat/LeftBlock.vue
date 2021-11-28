<template>
  <div
    :class="[display === 'chat' ? 'hidden ' : '', 'md:block w-full md:w-80 border-r dark:border-main-dark2 h-full']"
  >
    <chat-list :chats="chats" @load-chat="$emit('load-chat')" />
  </div>
</template>

<script>
import ChatList from "./ChatList.vue";

export default {
  components: { ChatList },
  props: {
    display: {
      type: String,
      required: true,
    },
    chats: {
      type: Array,
      required: true,
    },
  },
}
</script>