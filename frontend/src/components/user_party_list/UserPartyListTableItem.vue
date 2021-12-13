<template>
  <router-link
    :to="{ name: (game === 'gomoku' ? 'gomokuParty' : 'chessParty'), params: { id: party['id'] } }"
    class="flex p-2 text-center bg-white hover:bg-gray-100 dark:bg-main-dark2 dark:hover:bg-main"
  >
    <div class="w-1/4">{{ getPartyPlayers(party, game) }}</div>
    <div class="w-1/4">{{ getPartyResult(party, game, user) }}</div>
    <div class="w-1/4">{{ party['movesCount'] }}</div>
    <div class="w-1/4">{{ parseDate(party['date']) }}</div>
  </router-link>
</template>

<script>
import { parseDate, getPartyResult, getPartyPlayers } from "../../scripts/account/profile";

export default {
  props: {
    party: {
      type: Object,
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
    game: {
      type: String,
      required: true,
    },
  },
  methods: { parseDate, getPartyResult, getPartyPlayers },
}
</script>