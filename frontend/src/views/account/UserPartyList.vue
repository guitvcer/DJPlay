<template>
  <section
    :class="[
      !loading ? 'bg-gray-50 dark:bg-main-dark ' : 'flex justify-center ',
      'block justify-around mx-auto px-4 md:px-12 py-8 md:py-16'
    ]"
    style="max-width: 1200px;"
  >
    <loading v-if="loading" />

    <div v-if="!loading" class="flex justify-between w-full mb-16">
      <h2 class="text-3xl font-semibold">{{ title }} ({{ partyListLength }})</h2>
      <select class="bg-white dark:bg-main border-2 border-main rounded" v-model="game">
        <option value="gomoku">Гомоку</option>
        <option value="chess">Шахматы</option>
      </select>
    </div>

    <user-party-list-table
      v-if="!loading && partyListLength > 0"
      :partyList="partyList"
      :game="game"
    />

    <paginator
      v-if="!loading && partyListLength > 0 && partyListLength !== partyList.length"
      class="mt-8"
      :page="page"
      :nextPage="nextPage"
      :previousPage="previousPage"
      @first="loadFirstPage"
      @next="loadNextPage"
      @prev="loadPrevPage"
      @last="loadLastPage"
    />

    <h3 v-else-if="partyListLength === 0 && !loading">Нет сыгранных партии</h3>
  </section>
</template>

<script>
import api from "../../api/index";
import UserPartyListTable from "../../components/user_party_list/UserPartyListTable.vue";
import Paginator from "../../components/interface/Paginator.vue";
import Loading from "../../components/interface/Loading.vue";

export default {
  components: { UserPartyListTable, Paginator, Loading },
  data() {
    return {
      loading: true,
      partyList: [],
      title: null,
      game: "gomoku",
      page: new URL(window.location.href).searchParams.get("page"),
      partyListLength: null,
      nextPage: null,
      previousPage: null,
    }
  },
  methods: {
    async loadUserPartyList() {
      this.loading = true;
      this.page = this.page ?? 1;

      await this.$router.push(`?page=${this.page}`);

      const result = await api.account.getUserPartyList(this.$route.params.username, this.game, this.page);

      this.partyListLength = result.data.count;
      this.nextPage = result.data.next;
      this.previousPage = result.data.previous;
      this.partyList = result.data.results;
      this.title = result.title;
      this.loading = false;

      document.title = result.title;
    },
    async loadFirstPage() {
      this.page = 1;
      await this.loadUserPartyList();
    },
    async loadNextPage() {
      if (this.nextPage != null) {
        this.page = new URL(this.nextPage).searchParams.get("page");
        await this.loadUserPartyList();
      }
    },
    async loadPrevPage() {
      if (this.previousPage != null) {
        this.page = new URL(this.previousPage).searchParams.get("page");
        if (this.page == null) this.page = 1;
        await this.loadUserPartyList();
      }
    },
    async loadLastPage() {
      this.page = Math.ceil(this.partyListLength / 15);
      await this.loadUserPartyList();
    }
  },
  mounted() {
    this.loadUserPartyList();
  },
  watch: {
    game() {
      this.loading = true;
      this.loadUserPartyList();
    }
  }
}
</script>