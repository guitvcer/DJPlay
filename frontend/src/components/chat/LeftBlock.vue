<template>
  <div
    :class="[show === CHAT ? 'hidden ' : '', 'md:block w-full md:w-80 border-r dark:border-main-dark2 h-full']"
  >
    <chat-list />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ChatList from "./ChatList.vue";
import { CHAT } from "../../scripts/chat/constants";

export default {
  data() {
    return { CHAT }
  },
  components: { ChatList },
  computed: mapGetters(["show"]),
}
</script>