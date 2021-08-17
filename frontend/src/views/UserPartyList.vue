<template>
  <section :class="[!loading ? 'bg-gray-50 dark:bg-main-dark ' : 'flex justify-center ', 'block justify-around mx-auto px-4 md:px-12 py-8 md:py-16']" style="max-width: 1200px;">
    <loading v-if="loading" />
    <div v-if="!loading" class="flex justify-between w-full mb-16">
      <h2 class="text-3xl font-semibold">{{ title }}</h2>
      <select class="bg-white dark:bg-main border-2 border-main rounded" v-model="game">
        <option value="gomoku">Гомоку</option>
        <option value="chess">Шахматы</option>
      </select>
    </div>
    <user-party-list-table
        v-if="!loading && partyList.length > 0"
        :partyList="partyList"
        :movesList="movesList"
        :currentUsername="username"
    />
    <h3 v-else-if="partyList.length === 0 && !loading">Нет сыгранных партии</h3>
  </section>
</template>

<script>
import axios from 'axios'
import UserPartyListTable from "@/components/UserPartyList/UserPartyListTable";
import Loading from '@/components/Loading'

export default {
  components: {
    UserPartyListTable, Loading
  },
  data() {
    return {
      loading: true,
      partyList: [],
      movesList: [],
      title: null,
      game: 'gomoku'
    }
  },
  methods: {
    async loadUserPartyList() {
      let url = `${this.host}/account`

      if (this.$route.params.username)
        url += `/${this.$route.params.username}`

      url += `/party-list/${this.game}/`

      await axios
        .get(url)
        .then(response => {
          this.partyList = response.data
          this.loading = false

          if (this.$route.params.username) this.title = `Партии ${this.$route.params.username}`
          else this.title = `Ваши партии`

          document.title = this.title
        })
        .catch(error => {
          if (error.response.status === 404) this.$emit('api-error', error)
        })
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