<template>
  <section
    :class="[
      !loading ? 'bg-gray-50 dark:bg-main-dark ' : 'flex justify-center ',
      'block lg:flex justify-around mx-auto px-0 lg:px-12 py-16 mt-8'
    ]"
    style="max-width: 1400px"
  >
    <loading v-if="loading" />
    <profile-avatar
      :user="user"
      :profileViewAccess="profileViewAccess"
      v-if="!loading"
      @load-profile="setUserProfileInfo"
    />
    <profile-table v-if="profileViewAccess && !loading" :user="user" :extraText="extraText" />
    <profile-table v-else-if="!loading" :extraText="extraText" />
  </section>
</template>

<script>
import api from "../../api/index";
import ProfileAvatar from "../../components/profile/ProfileAvatar.vue";
import ProfileTable from "../../components/profile/ProfileTable.vue";
import Loading from "../../components/interface/Loading.vue";

export default {
  components: { ProfileAvatar, ProfileTable, Loading },
  data() {
    return {
      user: {},
      loading: true,
      profileViewAccess: false,
      extraText: '',
    }
  },
  methods: {
    async setUserProfileInfo() {
      const result = await api.account.getViewedUser();

      this.user = result.user;
      this.profileViewAccess = result.profileViewAccess;
      this.extraText = result.extraText;
      this.loading = false;
    },
  },
  mounted() {
    this.setUserProfileInfo()
  }
}
</script>