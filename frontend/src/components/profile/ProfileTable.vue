<template>
  <div class="mx-4 lg:mx-12 select-text lg:w-6/12">
    <p v-if="extraText" class="mb-5">{{ extraText }}</p>

    <div class="mb-5" v-if="user">
      <h3 class="font-bold text-xl">Основная информация</h3>
      <hr class="mb-2">
      <profile-field
        v-for="(field, index) in mainInformation"
        :key="index"
        :field="field"
      />
    </div>

    <div class="mb-5" v-if="user">
      <h3 class="font-bold text-xl">Дополнительная информация</h3>
      <hr class="mb-2">
      <profile-field
        v-for="(field, index) in additionalInformation"
        :key="index"
        :field="field"
      />
    </div>
  </div>
</template>

<script>
import ProfileField from "./ProfileField.vue";

export default {
  props: {
    user: Object,
    extraText: String,
  },
  components: { ProfileField },
  data() {
    return {
      mainInformation: null,
      additionalInformation: null,
    }
  },
  mounted() {
    if (this.user) {
      this.mainInformation = [
        {
          fieldName: (this.user.isOnline) ? "Статус" : (
              this.user["gender"] === "M" ? "Был" : (this.user.gender === "F" ? "Была" : "Был(-а)")) + " онлайн",
          fieldValue: (this.user.isOnline) ? "Онлайн" : this.user["lastOnline"],
        },
        {
          fieldName: "Имя пользователя",
          fieldValue: this.user.username,
        },
        {
          fieldName: "Эл. почта",
          fieldValue: this.user.email,
        },
        {
          fieldName: "Друзья",
          fieldValue: this.user["friends"],
        }
      ]
      this.additionalInformation = [
        {
          fieldName: "Просмотры",
          fieldValue: this.user["views"],
        },
        {
          fieldName: "Пол",
          fieldValue: (this.user["gender"] === "" || this.user["gender"] == null) ? "Не указано" : (
              this.user["gender"] === "M" ? "Мужской" : "Женский"
          ),
        },
        {
          fieldName: "Дата рождения",
          fieldValue: this.user["birthday"],
        },
        {
          fieldName: "Дата регистрации",
          fieldValue: this.user["dateJoined"],
        },
        {
          fieldName: "Настоящее имя",
          fieldValue: this.user["firstName"],
        },
        {
          fieldName: "Настоящяя фамилия",
          fieldValue: this.user["lastName"],
        },
      ]
    }
  },
}
</script>