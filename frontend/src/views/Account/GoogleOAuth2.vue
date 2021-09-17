<script>
import axios from 'axios'

export default {
  async mounted() {
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')

    if (code) {
      await axios
        .post(`${this.host}/account/social-authorization`, {
          'code': code,
          'google_client_id': this.GOOGLE_CLIENT_ID,
          'provider': 'Google'
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
    }

    await this.$router.push('/')
  }
}
</script>