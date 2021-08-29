<template>
  <form :action="action" method="post" @submit.prevent="submitForm">
    <div class="px-4 py-12">
      <h3 class="text-center text-4xl font-semibold">Сменить пароль</h3>
      <div class="flex flex-col mt-12">
        <input
            v-for="(input, index) in inputs"
            :key="index"
            type="password"
            :name="input.name"
            :id="input.name"
            :placeholder="input.placeholder"
            v-model="body[input.name]"
            class="border border-main my-1 rounded px-2 py-2 dark:bg-main"
            required
        >
      </div>
    </div>
    <div class="bg-gray-50 dark:bg-main-dark py-3 px-6 flex flex-row-reverse">
      <button
          type="submit"
          class="inline-flex justify-center rounded-md border font-semibold border-transparent shadow-sm cursor-pointer px-4 py-2 bg-main text-base text-white hover:bg-main-dark ml-3 w-auto text-sm dark:bg-gray-100 dark:text-black dark:hover:bg-gray-300"
      >Сменить</button>
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
      action: this.host + '/account/change-password',
      body: {
        'oldpassword': '',
        'password1': '',
        'password2': ''
      },
      inputs: [
        {
          placeholder: 'Старый пароль',
          name: 'oldpassword'
        },
        {
          placeholder: 'Новый пароль',
          name: 'password1'
        },
        {
          placeholder: 'Новый пароль (повторно)',
          name: 'password2'
        }
      ]
    }
  },
  methods: {
    async submitForm() {
      await axios
        .patch(this.action, this.body)
        .then(response => {
          document.cookie = 'access=; Max-Age=0; path=/'
          document.cookie = 'refresh=; Max-Age=0; path=/'

          this.$emit('load-user')
          this.$emit('create-alert', {
            title: 'Вы успешно сменили пароль.',
            level: 'success'
          })
          this.$router.push('/')
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

      this.body = {}
    }
  }
}
</script>