<template>
  <form :action="this.action" method="post" @submit.prevent="submitForm">
    <div class="px-4 pt-12">
      <h3 class="text-center text-4xl font-semibold">Вход в аккаунт</h3>
      <div class="flex flex-col mt-12">
        <input
          type="text"
          name="username"
          id="username"
          placeholder="Имя пользователя"
          class="border border-main my-1 rounded px-2 py-2 dark:bg-main"
          v-model="body.username"
          required
        >
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Пароль"
          class="border border-main my-1 rounded px-2 py-2 dark:bg-main"
          v-model="body.password"
          required
        >
      </div>
      <div class="flex justify-center py-4">
        <a
          :href="`https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${origin}/account/google-oauth2/&prompt=consent&response_type=code&client_id=${this.GOOGLE_CLIENT_ID}&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&access_type=offline`"
          class="rounded hover:bg-gray-50 dark:hover:bg-main-dark p-2 mx-0.5 border dark:border-main"
          title="Авторизация через Google"
        >
          <img :src="this.host + '/media/icons/google.svg'" alt="Google" class="w-8 h-8">
        </a>
        <a
          :href="`https://oauth.vk.com/authorize?client_id=${this.VK_CLIENT_ID}&redirect_uri=${origin}/account/vk-oauth2/&display=mobile&response_type=token&v=5.59`"
          class="rounded hover:bg-gray-50 dark:hover:bg-main-dark p-2 mx-0.5 border dark:border-main"
          title="Авторизация через VK"
        >
          <img :src="this.host + '/media/icons/vk.svg'" alt="VK" class="w-8 h-8">
        </a>
      </div>
      <div class="text-sm pb-4">
        Этот сайт защищен Google reCAPTCHA<br>
        <a
          href="https://policies.google.com/privacy"
          class="text-blue-500 hover:underline cursor-pointer"
        >Политика конфиденциальности</a> и
        <a
          href="https://policies.google.com/terms"
          class="text-blue-500 hover:underline cursor-pointer"
        >Условия использования.</a>
      </div>
    </div>
    <div class="bg-gray-50 dark:bg-main-dark py-3 px-6 flex flex-row-reverse">
      <button
        type="submit"
        class="inline-flex justify-center rounded-md border font-semibold border-transparent shadow-sm cursor-pointer px-4 py-2 bg-main text-base text-white hover:bg-main-dark ml-3 w-auto text-sm dark:bg-gray-100 dark:text-black dark:hover:bg-gray-300"
      >Войти</button>
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
import axios from 'axios'

export default {
  data() {
    return {
      body: {
        username: '',
        password: '',
        recaptcha: ''
      },
      action: this.host + '/account/authorization',
      origin: window.location.origin
    }
  },
  methods: {
    async submitForm() {
      this.body.recaptcha = await this.recaptcha('authorization')

      await axios
        .post(this.action, this.body)
        .then(response => {
          this.$emit('create-alert', {
            title: 'Вы успешно вошли в аккаунт.',
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
          } else this.$emit('api-error', error)
        })

      this.body.username = ''
      this.body.password = ''
      this.body.recaptcha = ''
    }
  }
}
</script>