<template>
  <section
      class="bg-gray-50 dark:bg-main-dark mx-auto px-3 lg:px-12 py-16 mt-8"
      style="max-width: 1400px;"
  >
    <alert v-if="alerts.length" :alerts="alerts" />
    <form :action="action" style="max-width: 700px;" class="mx-auto" @submit.prevent="submitForm">
      <h2
          class="text-3xl font-semibold mb-8"
      >Удалить профиль</h2>
      <div
          class="flex flex-col justify-center my-3"
      >
        <label for="password">Пароль</label>
        <input
            type="password"
            name="password"
            id="password"
            placeholder="Пароль"
            v-model="password"
            class="py-1 px-2 w-full border border-main rounded dark:bg-main"
            required
        >
      </div>
      <div class="flex flex-col sm:flex-row justify-end my-10">
        <router-link :to="{ name: 'editProfile' }" class="mx-1 my-1 sm:my-0 inline-flex justify-center rounded-md border font-semibold border-main shadow-sm cursor-pointer px-4 py-2 bg-white text-base text-gray-700 hover:bg-gray-50 mt-0 w-auto text-sm dark:bg-red-500 dark:text-gray-50 dark:hover:bg-red-600">
          Назад
        </router-link>
        <button
            class="mx-1 my-1 sm:my-0 inline-flex justify-center rounded-md border font-semibold border-transparent shadow-sm cursor-pointer px-4 py-2 bg-main text-base text-white hover:bg-main-dark w-auto text-sm dark:bg-gray-100 dark:text-black dark:hover:bg-gray-300"
            type="submit"
        >Удалить</button>
      </div>
    </form>
  </section>
</template>

<script>
import Alert from '@/components/Alert'

export default {
  components: {
    Alert
  },
  data() {
    return {
      alerts: [],
      action: this.host + '/account/delete/',
      password: ''
    }
  },
  methods: {
    submitForm() {
      this.sendRequest(this.action, 'DELETE', JSON.stringify({
        password: this.password
      })).then(json => {
        if (json.type === 'alert') this.alerts.push(json)
        else {
          this.$emit('create-alert', {
            level: 'success',
            title: 'Вы успешно удалили свой аккаунт.'
          })

          document.cookie = 'access=; Max-Age=0; path=/'
          document.cookie = 'refresh=; Max-Age=0; path=/'

          this.$emit('load-user')
          this.$router.push('/')
        }

        this.password = ''
      })
    }
  }
}
</script>