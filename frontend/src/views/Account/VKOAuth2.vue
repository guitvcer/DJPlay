<script>
import axios from 'axios'

export default {
  async mounted() {
    const code = new URL(window.location.href).searchParams.get('code')

    if (code) {
      await axios
        .post(`${this.host}/api/account/social-authorization`, {
          code: code,
          vk_client_id: this.VK_CLIENT_ID,
          provider: 'VK'
        })
        .then(response => {
          document.cookie = `access=${response.data.access}; path=/`
          document.cookie = `refresh=${response.data.refresh}; path=/`

          this.$emit('load-user')
          this.$emit('create-alert', {
            title: 'Вы успешно авторизовались.',
            level: 'success'
          })
        })
        .catch(error => {
          if (error.response.status === 400) {
            this.$emit('create-alert', {
              title: 'Произошла ошибка. Попробуйте еще.',
              level: 'danger'
            })
          } else if (error.response.status === 404) {
            this.$emit('create-alert', {
              title: 'Ваш аккаунт удален.',
              level: 'danger'
            })
          } else this.$emit('api-error', error)
        })

      await this.$router.push('/')
    }
  }
}
</script>