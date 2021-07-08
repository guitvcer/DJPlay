<template>
  <div class="block sm:flex mb-2 sm:mb-0">
    <h4 class="w-full sm:w-6/12 flex-shrink-0">{{ fieldName }}</h4>
    <p class="font-bold w-full sm:w-6/12 flex-shrink-0" style="word-wrap: break-word;" v-if="fieldName === 'Просмотры'">
      <router-link :to="$route.path + 'views/'">
        {{ getFieldValue }}
      </router-link>
    </p>
    <p class="font-bold w-full sm:w-6/12 flex-shrink-0" style="word-wrap: break-word;" v-else-if="fieldName === 'Друзья'">
      <router-link :to="$route.path + 'friends/'">
        {{ getFieldValue }}
      </router-link>
    </p>
    <p class="font-bold w-full sm:w-6/12 flex-shrink-0" style="word-wrap: break-word;" v-else>{{ getFieldValue }}</p>
  </div>
</template>

<script>
export default {
  props: {
    fieldName: {
      type: String,
      required: true,
    },
    fieldValue: {
      required: true
    }
  },
  computed: {
    getFieldValue() {
      if (this.fieldValue === null) return 'Не указано'

      if (typeof this.fieldValue === 'string')
        return (this.fieldValue === '') ? 'Не указано' : this.fieldValue.substr(0, 48)

      return this.fieldValue
    }
  }
}
</script>