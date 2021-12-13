<template>
  <router-link
    :to="{ name: 'profile', params: { username: party[color].username } }"
    :class="[
      !['draw', ''].includes(party['result']) ? (
        party[party['result']].id === party[color].id ? 'border-green-600' : 'border-red-700'
      ) : '',
      ' w-1/3 pt-2 rounded border hover:bg-main-dark dark:hover:bg-main-dark2'
    ]"
  >
    <img :src="party[color].avatar" :alt="party[color].username" class="w-8 m-auto">
    <strong class="block text-center">{{ party[color].username }}</strong>
  </router-link>
</template>

<script>
export default {
  props: {
    party: {
      type: Object,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
  },
}
</script>