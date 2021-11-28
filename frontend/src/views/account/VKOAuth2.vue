<script>
import { mapMutations } from "vuex";
import api from "../../api/index";

export default {
  async mounted() {
    const code = new URL(window.location.href).searchParams.get("code")

    if (code) {
      await api.account.vkAuth(code);
    }

    await this.$router.push('/');
  },
  methods: mapMutations(["createAlert"]),
}
</script>