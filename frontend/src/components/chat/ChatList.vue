<template>
  <div class="px-1 mt-2">
    <chat-list-item
      v-if="chats.length > 0"
      v-for="(chat, index) in chats"
      :chat="chat"
      :key="index"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ChatListItem from "./ChatListItem.vue";

export default {
  components: { ChatListItem },
  computed: mapGetters(["chats"]),
}
</script>