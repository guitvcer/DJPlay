<template>
  <div class="mx-4 lg:mx-12 select-text">
    <p v-if="extraText">{{ extraText }}</p>
    <div class="mb-5" v-if="user">
      <h3 class="font-bold text-xl">Основная информация</h3>
      <hr class="mb-2">
      <profile-field
          v-for="(field, index) in mainInformation"
          :key="index"
          :fieldName="field.fieldName"
          :fieldValue="field.fieldValue"
      />
    </div>
    <div class="mb-5" v-if="user">
      <h3 class="font-bold text-xl">Дополнительная информация</h3>
      <hr class="mb-2">
      <profile-field
          v-for="(field, index) in additionalInformation"
          :key="index"
          :fieldName="field.fieldName"
          :fieldValue="field.fieldValue"
      />
    </div>
  </div>
</template>

<script>
import ProfileField from '@/components/Profile/ProfileField'

export default {
  props: {
    user: Object,
    extraText: String
  },
  components: {
    ProfileField
  },
  data() {
    return {
      mainInformation: [],
      additionalInformation: []
    }
  },
  mounted() {
    if (this.user) {
      this.mainInformation = [
        {
          fieldName: 'Был(-а) онлайн',
          fieldValue: this.$props.user.last_online
        },
        {
          fieldName: 'Имя пользователя',
          fieldValue: this.$props.user.username
        },
        {
          fieldName: 'Эл. почта',
          fieldValue: this.$props.user.email
        },
        {
          fieldName: 'Друзья',
          fieldValue: this.$props.user.friends
        }
      ]
      this.additionalInformation = [
        {
          fieldName: 'Просмотры',
          fieldValue: this.$props.user.views
        },
        {
          fieldName: 'Пол',
          fieldValue: (this.$props.user.gender === null) ? 'Не указано' : (
              this.$props.user.gender === 'M' ? 'Мужской' : 'Женский'
          )
        },
        {
          fieldName: 'Дата рождения',
          fieldValue: this.$props.user.birthday
        },
        {
          fieldName: 'Дата регистрации',
          fieldValue: this.$props.user.date_joined
        },
        {
          fieldName: 'Настоящее имя',
          fieldValue: this.$props.user.first_name
        },
        {
          fieldName: 'Настоящяя фамилия',
          fieldValue: this.$props.user.last_name
        }
      ]
    }
  }
}
</script>