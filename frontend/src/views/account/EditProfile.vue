<template>
  <section
    :class="[!loading ? 'bg-gray-50 dark:bg-main-dark ' : 'flex justify-center ', 'mx-auto px-0 lg:px-12 py-16 mt-8']"
    style="max-width: 1400px;"
  >
    <loading v-if="loading" class="m-auto" />
    <form
      v-if="!loading"
      :action="this.baseURL + '/api' + action"
      @submit.prevent="submitForm"
      class="block lg:flex justify-around"
    >
      <edit-profile-avatar @submit="submitForm" />
      <edit-profile-table />
    </form>
  </section>
</template>

<script>
import { mapActions, mapMutations } from "vuex";
import api from "../../api/index";
import EditProfileAvatar from "../../components/edit_profile/EditProfileAvatar.vue";
import EditProfileTable from "../../components/edit_profile/EditProfileTable.vue";
import Loading from "../../components/interface/Loading.vue";
import { isAuthenticated } from "../../utilities";

export default {
  data() {
    return {
      action: "/account/edit/",
      loading: true,
    }
  },
  components: { EditProfileAvatar, EditProfileTable, Loading },
  methods: {
    ...mapActions(["loadUser"]),
    ...mapMutations(["createAlert"]),
    async submitForm(event) {
      const editProfileData = new FormData(event.target);

      if (!event.target.avatar.files[0]) {
        editProfileData.append("clearAvatar", event.target.avatar.dataset.clear);
      }

      await api.account.editProfile(this.action, editProfileData);
    },
  },
  async mounted() {
    if (await isAuthenticated()) {
      await this.loadUser();
      this.loading = false;
      document.title = "Изменить профиль";
    } else {
      this.createAlert({
        title: "Вы не авторизованы.",
        level: "danger",
      });
      await this.$router.push('/');
    }
  },
}
</script>