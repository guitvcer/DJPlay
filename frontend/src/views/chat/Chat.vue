<template>
  <section
    :class="[
      !loading ? 'bg-gray-50 dark:bg-main-dark h-5/6' : 'justify-center',
      ' flex mx-auto rounded h-full'
    ]"
    style="max-width: 1200px;"
  >
    <loading v-if="loading" />
    <left-block v-if="!loading" />
    <right-block v-if="!loading" />
  </section>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import Loading from "../../components/interface/Loading.vue";
import LeftBlock from "../../components/chat/LeftBlock.vue";
import RightBlock from "../../components/chat/RightBlock.vue";
import { redirectIfNotAuthenticated } from "../../utilities";
import { setEventForEscape } from "../../scripts/chat";

export default {
  components: { Loading, LeftBlock, RightBlock },
  data() {
    return { loading: true }
  },
  computed: mapGetters(["chat", "chats", "interlocutor", "chatSocket", "show"]),
  methods: {
    ...mapActions(["loadChats", "loadChat", "unselectChat", "submitMessage"]),
    ...mapMutations(["createAlert"]),
  },
  async mounted() {
    await redirectIfNotAuthenticated();

    document.title = "Сообщения";

    await this.loadChats();
    this.loading = false;
    setEventForEscape();

    if (this.$route.params.username) {
      await this.loadChat(this.$route.params.username);
    }
  },
}
</script>