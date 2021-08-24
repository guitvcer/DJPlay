<template>
  <div
      :class="[display === 'chat' ? 'hidden ' : '', 'md:block w-full md:w-80 border-r dark:border-main-dark2']"
      style="height: 700px"
  >
    <chat-search />
    <chat-list :chats="chats" @load-chat="$emit('load-chat')" />
  </div>
</template>

<script>
import ChatList from '@/components/Chat/ChatList'
import ChatSearch from '@/components/Chat/ChatSearch'

export default {
  components: {
    ChatList, ChatSearch
  },
  props: {
    display: {
      type: String,
      required: true
    },
    chats: {
      type: Array,
      required: true
    }
  }
}
</script>