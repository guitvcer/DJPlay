<template>
  <div v-if="userLoading" class="flex justify-center">
    <loading />
  </div>
  <div id="app" class="h-full" v-else>
    <the-header v-if="status === 200" />
    <alerts />
    <modal />

    <!-- Content -->
    <main
      :class="[$route.name === 'chat' || $route.name === 'chats' ? '' : 'px-4 py-8 overflow-y-auto']"
    >
      <router-view v-if="status === 200" />
      <forbidden v-else-if="status === 403" />
      <not-found v-else-if="status === 404" />
      <server-error v-else-if="status === 500" />
    </main>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import TimeAgo from "javascript-time-ago";
import ru from "javascript-time-ago/locale/ru";
import Alerts from "./components/interface/Alerts.vue";
import Modal from "./components/interface/Modal.vue";
import Loading from "./components/interface/Loading";
import TheHeader from "./components/home/TheHeader.vue";
import Forbidden from "./components/error_pages/Forbidden.vue";
import NotFound from "./components/error_pages/NotFound.vue";
import ServerError from "./components/error_pages/ServerError.vue";

export default {
  name: "App",
  computed: mapGetters(["status", "userLoading"]),
  components: {
    Alerts, Modal, TheHeader, Loading, Forbidden, NotFound, ServerError,
  },
  methods: {
    ...mapActions(["loadUser"]),
    ...mapMutations(["createAlert", "updateStatus"]),
  },
  async mounted() {
    TimeAgo.addDefaultLocale(ru);
    await this.loadUser(true);
  },
}
</script>

<style>
main {
  height: calc(100% - 98px);
}

@media screen and (max-width: 768px) {
  main {
    height: calc(100% - 90px);
  }
}
.grecaptcha-badge {
  opacity: 0;
}
</style>