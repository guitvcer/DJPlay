<template>
  <div class="mx-4 lg:mx-12">
    <div class="mb-5">
      <h3 class="font-bold text-xl">Основная информация</h3>
      <hr class="mb-2">
      <profile-field
          v-for="(field, index) in mainInformation"
          :key="index"
          :fieldName="field.fieldName"
          :fieldValue="field.fieldValue"
      />
    </div>
    <div class="mb-5">
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
    user: {
      type: Object,
      required: true
    }
  },
  components: {
    ProfileField
  },
  data() {
    return {
      mainInformation: [
        {
          fieldName: 'Был(-а) онлайн',
          fieldValue: this.user.last_online
        },
        {
          fieldName: 'Имя пользователя',
          fieldValue: this.user.username
        },
        {
          fieldName: 'Эл.почта',
          fieldValue: this.user.email
        },
        {
          fieldName: 'Друзья',
          fieldValue: this.user.friends
        }
      ],
      additionalInformation: [
        {
          fieldName: 'Просмотры',
          fieldValue: this.user.views
        },
        {
          fieldName: 'Пол',
          fieldValue: this.user.gender
        },
        {
          fieldName: 'Дата рождения',
          fieldValue: this.user.birthday
        },
        {
          fieldName: 'Дата регистрации',
          fieldValue: this.user.date_joined.toLocaleString()
        },
        {
          fieldName: 'Настоящее имя',
          fieldValue: this.user.firstName
        },
        {
          fieldName: 'Настоящяя фамилия',
          fieldValue: this.user.lastName
        }
      ]
    }
  }
}
</script>