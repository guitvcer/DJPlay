<script>
import axios from 'axios'

export default {
  async mounted() {
    const access_token = window.location.hash.split("=")[1].split("&")[0]

    if (access_token) {
      await axios
        .post(`${this.host}/api/account/social-authorization`, {
          access_token: access_token,
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