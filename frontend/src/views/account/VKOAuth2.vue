<script>
import { mapMutations } from "vuex";
import axios from "axios";

export default {
  async mounted() {
    const code = new URL(window.location.href).searchParams.get("code")

    if (code) {
      await axios
        .post(`${this.host}/api/account/social-authorization`, {
          code: code,
          vk_client_id: process.env["VUE_APP_VK_OAUTH2_PUBLIC"],
          provider: "VK",
        })
        .then(response => {
          document.cookie = `access=${response.data.access}; path=/`;
          document.cookie = `refresh=${response.data.refresh}; path=/`;

          this.$emit("load-user");
          this.createAlert({
            title: "Вы успешно авторизовались.",
            level: "success",
          });
        })
        .catch(error => {
          if (error.response.status === 400) {
            this.createAlert({
              title: "Произошла ошибка. Попробуйте еще.",
              level: "danger",
            });
          } else if (error.response.status === 404) {
            this.createAlert({
              title: "Ваш аккаунт удален.",
              level: "danger",
            });
          } else {
            this.$emit("api-error", error);
          }
        })

      await this.$router.push('/');
    }
  },
  methods: mapMutations(["createAlert"]),
}
</script>