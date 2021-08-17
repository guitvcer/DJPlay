<template>
  <div class="fixed px-2 right-0 top-5 w-full md:w-auto alert-wrapper" style="z-index: 999999; min-width: 300px;">
    <div
        role="alert"
        v-for="(alert, index) in alerts"
        :key="index"
        :class="'py-4 px-4 leading-normal rounded border-l-4 w-full flex justify-between my-1 dark:text-black ' + alert.level"
    >
      <div class="flex items-center w-full">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" v-if="alert.level === 'simple'">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" v-else-if="alert.level === 'danger'">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" v-else-if="alert.level === 'success'">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" v-else-if="alert.level === 'warning'">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
        </svg>
        <p class="flex flex-col justify-start items-center text-left mr-2" v-html="alert.title" />
      </div>
      <button @click="alerts.splice(index, 1)">
        <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" fill-rule="evenodd"></path></svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    alerts: {
      type: Array,
      required: true
    }
  },
  methods: {
    closeAlert(event) {
      this.alerts.splice(event.index, 1)
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
  }
}
</style>