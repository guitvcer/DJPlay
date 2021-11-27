<template>
  <div class="mx-4 lg:mx-12 select-text lg:w-3/5 xl:w-2/5">
    <div class="mb-5">
      <h3 class="font-bold text-xl">Основная информация</h3>
      <hr class="mb-2">

      <edit-profile-input
        v-for="(field, index) in mainInformation"
        :key="index"
        :field="field"
        @input="mainInformation[field.name] = field.value"
        @change="mainInformation[field.name] = field.value"
      />
    </div>

    <div class="mb-5">
      <h3 class="font-bold text-xl">Дополнительная информация</h3>
      <hr class="mb-2">

      <edit-profile-input
        v-for="(field, index) in additionalInformation"
        :key="index"
        :field="field"
        @input="additionalInformation[field.name] = field.value"
        @change="additionalInformation[field.name] = field.value"
      />
    </div>
  </div>
</template>

<script>
import EditProfileInput from "./EditProfileInput.vue";

export default {
  props: {
    user: {
      type: Object,
      required: true,
    }
  },
  components: { EditProfileInput },
  data() {
    return {
      mainInformation: [
        {
          type: "text",
          name: "username",
          required: true,
          placeholder: "Имя пользователя",
          max_length: 48,
          value: this.user.username,
        },
        {
          type: "email",
          name: "email",
          required: true,
          placeholder: "Эл. почта",
          max_length: 64,
          value: this.user.email,
        }
      ],
      additionalInformation: [
        {
          type: "date",
          name: "birthday",
          placeholder: "Дата рождения",
          value: this.user["birthday"],
        },
        {
          type: "text",
          name: "firstName",
          placeholder: "Имя",
          max_length: 64,
          value: this.user["firstName"],
        },
        {
          type: "text",
          name: "lastName",
          placeholder: "Фамилия",
          max_length: 64,
          value: this.user["lastName"]
        },
        {
          type: "select",
          options: [
            { value: 'M', title: "Мужской" },
            { value: 'F', title: "Женский" },
            { value: '', title: "Не указано" },
          ],
          name: "gender",
          placeholder: "Пол",
          value: this.user["gender"],
        },
        {
          type: "checkbox",
          name: "isPrivate",
          placeholder: "Приватный аккаунт?",
          value: this.user["isPrivate"],
        },
      ],
    }
  },
}
</script>