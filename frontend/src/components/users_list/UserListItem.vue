<template>
  <router-link
    :to="{name: 'profile', params: { username: user.username } }"
    class="py-2 md:p-4 px-3 rounded dark:hover:bg-main-dark2 mx-1 hover:bg-white flex w-full md:w-32 md:block items-center"
  >
    <div
      :style="'background-image: url(' + this.baseURL + user.avatar + '); background-size: 100% 100%'"
      class="w-12 h-12 md:w-24 md:h-24 rounded flex justify-end items-end"
    >
      <div v-if="user['isOnline']" class="rounded w-5 h-5 bg-green-500"></div>
    </div>
    <h3 class="md:pt-2 hover:underline text-lg ml-4 md:ml-0 truncate">
      {{ user.username }}
    </h3>
  </router-link>
</template>

<script>
export default {
  props: {
    user: {
      type: Object,
      required: true,
    }
  }
}
</script>