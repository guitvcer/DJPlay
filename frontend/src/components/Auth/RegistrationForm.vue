<template>
  <form :action="this.action" method="post" @submit.prevent="submitForm">
    <div class="px-4 py-12">
      <h3 class="text-center text-4xl font-semibold">Регистрация</h3>
      <div class="flex flex-col mt-12">
        <input
          type="text"
          name="username"
          id="username"
          placeholder="Имя пользователя"
          class="border border-main my-1 rounded px-2 py-2 dark:bg-main"
          required
          v-model="body.username"
        >
        <input
          type="password"
          name="password1"
          id="password1"
          placeholder="Пароль"
          class="border border-main my-1 rounded px-2 py-2 dark:bg-main"
          required
          v-model="body.password1"
        >
        <input
          type="password"
          name="password2"
          id="password2"
          placeholder="Пароль (повторно)"
          class="border border-main my-1 rounded px-2 py-2 dark:bg-main"
          required
          v-model="body.password2"
        >
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Эл. почта"
          class="border border-main my-1 rounded px-2 py-2 dark:bg-main"
          required
          v-model="body.email"
        >
      </div>
    </div>
    <div class="bg-gray-50 dark:bg-main-dark py-3 px-6 flex flex-row-reverse">
      <button
        type="submit"
        class="inline-flex justify-center rounded-md border font-semibold border-transparent shadow-sm cursor-pointer px-4 py-2 bg-main text-base text-white hover:bg-main-dark ml-3 w-auto text-sm dark:bg-gray-100 dark:text-black dark:hover:bg-gray-300"
      >Зарегистрироваться</button>
      <button
        type="button"
        class="inline-flex justify-center rounded-md border font-semibold border-main shadow-sm cursor-pointer px-4 py-2 bg-white text-base text-gray-700 hover:bg-gray-50 mt-0 ml-3 w-auto text-sm dark:bg-red-500 dark:text-gray-50 dark:hover:bg-red-600"
        @click="$emit('close-modal')"
        ref="cancelButtonRef"
      >Отмена</button>
    </div>
  </form>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      body: {
        username: '',
        password1: '',
        password2: '',
        email: ''
      },
      action: this.host + '/account/registration'
    }
  },
  methods: {
    async submitForm() {
      await axios
        .post(this.action, this.body)
        .then(response => {
          this.$emit('create-alert', {
            title: 'Вы успешно вошли в аккаунт',
            level: 'success'
          })
          this.$emit('close-modal')

          document.cookie = `access=${response.data.access}; path=/`
          document.cookie = `refresh=${response.data.refresh}; path=/`

          this.$emit('load-user')
        })
        .catch(error => {
          if (error.response.status === 400) {
            for (const field in error.response.data) {

              this.$emit('create-alert', {
                title: this.parseErrors(error.response.data, field),
                level: 'danger'
              })
            }
          }
        })

      this.body.username = ''
      this.body.password1 = ''
      this.body.password2 = ''
      this.body.email = ''
    }
  }
}
</script>