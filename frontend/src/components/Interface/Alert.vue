<template>
  <div class="fixed px-2 right-0 top-5 w-full md:w-auto alert-wrapper z-40" style="min-width: 300px">
    <div
      role="alert"
      v-for="(alert, index) in alerts"
      :key="index"
      :class="'p-1 leading-normal rounded border-l-4 w-full flex justify-between my-1 dark:text-black ' + alert.level"
    >
      <div class="flex items-center w-full pl-4">
        <information-circle-icon class="h-6 w-6 mr-2 flex-shrink-0" v-if="alert.level === 'simple'" />
        <exclamation-icon class="h-6 w-6 mr-2 flex-shrink-0" v-else-if="alert.level === 'danger'" />
        <badge-check-icon class="h-6 w-6 mr-2 flex-shrink-0" v-else-if="alert.level === 'success'" />
        <shield-exclamation-icon class="h-6 w-6 mr-2 flex-shrink-0" v-else-if="alert.level === 'warning'" />

        <router-link
          v-if="alert.url"
          @click="clearSimilarAlerts(alert.url)"
          :to="alert.url"
          class="flex flex-col justify-start items-center text-left mr-2 w-full"
          v-html="alert.title"
        />
        <p v-else class="flex flex-col justify-start items-center text-left mr-2 py-3" v-html="alert.title" />
      </div>
      <button @click="alerts.splice(index, 1)" class="pr-4">
        <x-icon class="w-4 h-4 fill-current" />
      </button>
    </div>
    <button
      v-if="alerts.length > 1"
      class="py-2 px-4 leading-normal rounded w-full flex justify-center my-1 bg-gray-50 hover:bg-gray-200 dark:text-black dark:text-gray-200 dark:bg-main-dark dark:hover:bg-main font-bold text-center"
      @click="alerts.splice(0, alerts.length)"
    >Очистить</button>
  </div>
</template>

<script>
import {
  BadgeCheckIcon,
  ExclamationIcon,
  InformationCircleIcon,
  ShieldExclamationIcon,
  XIcon
} from '@heroicons/vue/outline'

export default {
  props: {
    alerts: {
      type: Array,
      required: true
    }
  },
  components: {
    BadgeCheckIcon,
    ExclamationIcon,
    InformationCircleIcon,
    ShieldExclamationIcon,
    XIcon
  },
  methods: {
    clearSimilarAlerts(url) {
      let deletedAlertsCount = 0
      const alertsLength = this.alerts.length

      for (let index = 0; index < alertsLength; index++) {
        if (this.alerts[index - deletedAlertsCount].url === url) {
          this.alerts.splice(index - deletedAlertsCount, 1)
          deletedAlertsCount++
        }
      }
    }
  }
}
</script>

<style scoped>
.danger {
  background-color: #f7a7a3;
  border-color: #8f130c;
}
.success {
  background-color: #a8f0c6;
  border-color: #178344;
}
.simple {
  background-color: #ebebeb;
  border-color: #6c6c6c;
}
.warning {
  background-color: #ffd48a;
  border-color: #8a5700;
}

@media screen and (min-width: 1024px) {
  .alert-wrapper {
    top: 100px;
    max-width: 500px;
  }
}
</style>