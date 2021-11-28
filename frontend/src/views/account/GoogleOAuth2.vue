<script>
import { mapMutations } from "vuex";
import api from "../../api/index";

export default {
  async mounted() {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    if (code) {
      await api.account.googleAuth(code);
    }

    await this.$router.push('/');
  },
  methods: mapMutations(["createAlert"]),
}
</script>