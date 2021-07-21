<template>
  <form :action="action" method="post" @submit.prevent="submitForm">
    <div class="px-4 py-12">
      <h3 class="text-center text-4xl font-semibold">Удалить аккаунт</h3>
      <div class="flex flex-col mt-12">
        <input
            type="password"
            name="password"
            id="password"
            placeholder="Пароль"
            class="border border-main my-1 rounded px-2 py-2 dark:bg-main"
            v-model="password"
            required
        >
      </div>
    </div>
    <div class="bg-gray-50 dark:bg-main-dark py-3 px-6 flex flex-row-reverse">
      <button
          type="submit"
          class="inline-flex justify-center rounded-md border font-semibold border-transparent shadow-sm cursor-pointer px-4 py-2 bg-main text-base text-white hover:bg-main-dark ml-3 w-auto text-sm dark:bg-gray-100 dark:text-black dark:hover:bg-gray-300"
      >Удалить</button>
      <button
          type="button"
          class="inline-flex justify-center rounded-md border font-semibold border-main shadow-sm cursor-pointer px-4 py-2 bg-white text-base text-gray-700 hover:bg-gray-50 mt-0 ml-3 w-auto text-sm dark:bg-red-500 dark:text-gray-50 dark:hover:bg-red-600"
          ref="cancelButtonRef"
          @click="$emit('close-modal')"
      >Отмена</button>
    </div>
  </form>
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
        if (json.type === 'alert') for (let alert of json.alerts) this.$emit('create-alert', alert)
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