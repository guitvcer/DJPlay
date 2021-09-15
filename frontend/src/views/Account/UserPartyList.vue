<template>
  <section
    :class="[
      !loading ? 'bg-gray-50 dark:bg-main-dark ' : 'flex justify-center ',
      'block justify-around mx-auto px-4 md:px-12 py-8 md:py-16'
    ]"
    style="max-width: 1200px"
  >
    <loading v-if="loading" />
    <div v-if="!loading" class="flex justify-between w-full mb-16">
      <h2 class="text-3xl font-semibold">{{ title }} ({{ partyListLength }})</h2>
      <select class="bg-white dark:bg-main border-2 border-main rounded" v-model="game">
        <option value="gomoku">Гомоку</option>
      </select>
    </div>
    <user-party-list-table
      v-if="!loading && partyListLength > 0"
      :partyList="partyList"
      :currentUsername="username"
    />
    <paginator
      v-if="!loading && partyListLength > 0"
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
import axios from 'axios'
import UserPartyListTable from "@/components/UserPartyList/UserPartyListTable";
import Paginator from '@/components/Interface/Paginator'
import Loading from '@/components/Interface/Loading'

export default {
  components: {
    UserPartyListTable, Paginator, Loading
  },
  data() {
    return {
      loading: true,
      partyList: [],
      title: null,
      game: 'gomoku',
      page: new URL(window.location.href).searchParams.get('page'),
      partyListLength: null,
      nextPage: null,
      previousPage: null
    }
  },
  methods: {
    getUrl() {
      let url = `${this.host}/account`

      if (this.$route.params.username)
        url += `/${this.$route.params.username}`

      url += `/party-list/${this.game}/`

      return url
    },
    async loadUserPartyList() {
      let url = this.getUrl()

      if (this.page == null) this.page = 1
      else url += `?page=${this.page}`

      this.$router.push(`?page=${this.page}`)

      await axios
        .get(url)
        .then(response => {
          this.partyListLength = response.data.count
          this.nextPage = response.data.next
          this.previousPage = response.data.previous
          this.partyList = response.data.results
          this.loading = false

          if (this.$route.params.username) this.title = `Партии ${this.$route.params.username}`
          else this.title = `Ваши партии`

          document.title = this.title
        })
        .catch(error => {
          this.$emit('api-error', error)
        })
    },
    async loadFirstPage() {
      this.page = 1
      await this.loadUserPartyList()
    },
    async loadNextPage() {
      if (this.nextPage != null) {
        this.page = new URL(this.nextPage).searchParams.get('page')
        await this.loadUserPartyList()
      }
    },
    async loadPrevPage() {
      if (this.previousPage != null) {
        this.page = new URL(this.previousPage).searchParams.get('page')
        if (this.page == null) this.page = 1
        await this.loadUserPartyList()
      }
    },
    async loadLastPage() {
      this.page = Math.ceil(this.partyListLength / 15)
      await this.loadUserPartyList()
    }
  },
  mounted() {
    this.loadUserPartyList()
  },
  computed: {
    username() {
      if (this.$route.params.username) return this.$route.params.username
      else return document.querySelector('#username').innerHTML
    }
  },
  watch: {
    game() {
      this.loading = true
      this.loadUserPartyList()
    }
  }
}
</script>