<template>
  <section
    :class="[
      !loading ? 'bg-gray-50 dark:bg-main-dark ' : 'flex justify-center ',
      'mx-auto px-4 md:px-12 py-8 md:py-16'
    ]"
    style="max-width: 1200px;"
  >
    <loading v-if="loading" />
    <div class="md:flex justify-between" v-if="!loading">
      <the-search @sent="loadList" />
      <h2 class="text-2xl md:text-3xl pl-3 md:pl-0 pt-3 md:pt-0 font-semibold">Найдено: {{ usersList.length }}</h2>
    </div>
    <div class="md:flex flex-wrap mt-8" v-if="usersList.length && !loading">
      <user-list-item v-for="(user, index) in usersList" :key="index" :user="user" />
    </div>
  </section>
</template>

<script>
import api from "../../api/index";
import TheSearch from "../../components/UsersList/TheSearch.vue";
import UserListItem from "../../components/UsersList/UserListItem.vue";
import Loading from "../../components/Interface/Loading.vue";

export default {
  components: { TheSearch, UserListItem, Loading },
  data() {
    return {
      usersList: [],
      loading: true,
    }
  },
  methods: {
    loadList(usersList) {
      this.usersList = usersList;
    },
    async loadUsersList() {
      this.usersList = await api.account.getUsersList();
      this.loading = false;
    },
    focusToSearch(event) {
      if (event.code === "Slash") {
        try {
          const search = document.getElementById("usersListSearch");

          if (document.activeElement !== search) {
            event.preventDefault();
          }

          search.focus();
        } catch (e) {}
      }
    }
  },
  async mounted() {
    await this.loadUsersList();
    document.addEventListener("keydown", this.focusToSearch);
    document.title = "Пользователи DJPlay";
  }
}
</script>