<template>
  <form :action="this.action" method="post" @submit.prevent="submitForm">
    <div class="px-4 py-12">
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
    </div>
    <div class="bg-gray-50 dark:bg-main-dark py-3 px-6 flex flex-row-reverse">
      <button
          type="submit"
          class="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-main text-base text-white hover:bg-main-dark ml-3 w-auto text-sm dark:bg-gray-100 dark:text-black"
      >Войти</button>
      <button
          type="button"
          class="inline-flex justify-center rounded-md border border-main shadow-sm px-4 py-2 bg-white text-base text-gray-700 hover:bg-gray-50 mt-0 ml-3 w-auto text-sm dark:bg-red-500 dark:text-gray-50"
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
      body: {
        username: '',
        password: ''
      },
      action: this.host + '/account/authorization'
    }
  },
  methods: {
    submitForm() {
      fetch(this.action, {
        method: 'POST',
        body: JSON.stringify(this.body),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        if (response.ok) {
          return response.json().then(data => {
            this.$emit('sent', [
              {
                title: 'Вы успешно вошли в аккаунт.',
                level: 'success'
              }
            ])

            document.cookie = `access=${data.access}`
            document.cookie = `refresh=${data.refresh}`
          })
        }

        return response.json().then(error => {
          this.$emit('sent', [
            {
              title: error.non_field_errors[0],
              level: 'danger'
            }
          ])
        })
      })

      this.body.username = ''
      this.body.password = ''
    }
  }
}
</script>