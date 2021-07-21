<template>
  <section
      class="bg-gray-50 dark:bg-main-dark mx-auto px-3 lg:px-12 py-16 mt-8"
      style="max-width: 1400px;"
  >
    <alert v-if="alerts.length" :alerts="alerts" />
    <form :action="action" style="max-width: 700px;" class="mx-auto" @submit.prevent="submitForm">
      <h2
          class="text-3xl font-semibold mb-8"
      >Сменить пароль</h2>
      <div
          v-for="(input, index) in inputs"
          :key="index"
          class="flex flex-col justify-center my-3"
      >
        <label :for="input.name">{{ input.placeholder }}</label>
        <input
            type="password"
            :name="input.name"
            :id="input.name"
            :placeholder="input.placeholder"
            v-model="body[input.name]"
            class="py-1 px-2 w-full border border-main rounded dark:bg-main"
            required
        >
      </div>
      <div class="flex flex-col sm:flex-row justify-end mt-10">
        <router-link :to="{ name: 'editProfile' }" class="mx-1 my-1 sm:my-0 inline-flex justify-center rounded-md border font-semibold border-main shadow-sm cursor-pointer px-4 py-2 bg-white text-base text-gray-700 hover:bg-gray-50 mt-0 w-auto text-sm dark:bg-red-500 dark:text-gray-50 dark:hover:bg-red-600">
          Назад
        </router-link>
        <button
            class="mx-1 my-1 sm:my-0 inline-flex justify-center rounded-md border font-semibold border-transparent shadow-sm cursor-pointer px-4 py-2 bg-main text-base text-white hover:bg-main-dark w-auto text-sm dark:bg-gray-100 dark:text-black dark:hover:bg-gray-300"
            type="submit"
        >Сохранить</button>
      </div>
    </form>
  </section>
</template>

<script>
import Alert from '@/components/Alert'

export default {
  data() {
    return {
      alerts: [],
      action: this.host + '/account/change-password/',
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
  components: {
    Alert
  },
  methods: {
    submitForm() {
      this.sendRequest(this.action, 'POST', JSON.stringify(this.body)).then(json => {
        if (json.type === 'alert') for (let alert of json.alerts) this.$emit('create-alert', alert)
        else {
          document.cookie = 'access=; Max-Age=0; path=/'
          document.cookie = 'refresh=; Max-Age=0; path=/'

          this.$emit('load-user')
          this.$emit('create-alert', {
            level: 'success',
            title: json.title
          })
          this.$router.push('/')
        }

        this.body = {}
      })
    }
  }
}
</script>