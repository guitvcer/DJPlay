<template>
  <div class="flex justify-center">
    <loading />
  </div>
</template>

<script>
import api from "../../api/index";
import Loading from "../../components/interface/Loading.vue";

export default {
  components: { Loading },
  async mounted() {
    const code = new URL(window.location.href).searchParams.get("code");

    if (code) {
      await api.account.vkAuth(code);
    }

    await this.$router.push('/');
  },
}
</script>