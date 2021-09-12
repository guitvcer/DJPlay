<template>
  <header id="header" class="bg-gray-50 dark:bg-main-dark border-b-2 border-main-light dark:border-main">
    <div
      class="container mx-auto flex justify-between items-center h-full py-3 px-6 md:px-10 lg:px-20"
      style="max-width: 1750px"
    >
      <!-- Logo -->
      <div class="h-full">
        <router-link to="/" tabindex="1">
          <h1 class="bg-main dark:bg-main-dark2 text-white text-4xl px-8 py-3 font-monoton rounded border-red">DJPLAY</h1>
        </router-link>
      </div>

      <!-- User Dropdown -->
      <dropdown
        :user="user"
        @create-alert="createAlert"
        @load-user="$emit('load-user')"
        tabindex="2"
      />
    </div>
  </header>
</template>

<script>
import Dropdown from '@/components/Interface/Dropdown'

export default {
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  components: {
    Dropdown
  },
  methods: {
    createAlert(alert) {
      this.$emit('create-alert', alert)
    }
  }
}
</script>