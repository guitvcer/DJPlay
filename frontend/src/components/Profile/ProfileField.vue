<template>
  <div class="block sm:flex mb-2 sm:mb-0">
    <h4 class="w-full sm:w-6/12 flex-shrink-0">{{ fieldName }}</h4>
    <p
      v-if="fieldName === 'Просмотры'"
      class="font-bold w-full sm:w-6/12 flex-shrink-0"
      style="word-wrap: break-word"
    >
      <router-link :to="$route.path + 'views/'">
        {{ getFieldValue }}
      </router-link>
    </p>
    <p
      v-else-if="fieldName === 'Друзья'"
      class="font-bold w-full sm:w-6/12 flex-shrink-0"
      style="word-wrap: break-word"
    >
      <router-link :to="$route.path + 'friends/'">
        {{ getFieldValue }}
      </router-link>
    </p>
    <p class="font-bold w-full sm:w-6/12 flex-shrink-0" style="word-wrap: break-word" v-else>{{ getFieldValue }}</p>
  </div>
</template>

<script>
import { DateTime } from 'luxon'

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

      if (typeof this.fieldValue === 'string') {
        if (this.fieldValue === '') return 'Не указано'
        else if (this.fieldName === 'Был(-а) онлайн') return this.timeAgo.format(Date.parse(this.fieldValue))
        else if (this.fieldName === 'Дата рождения' || this.fieldName === 'Дата регистрации') {
          return DateTime.fromISO(this.fieldValue).setLocale('ru').toFormat('d MMMM y') + ' г.'
        }
        else this.fieldValue.substr(0, 48)
      }

      return this.fieldValue
    }
  }
}
</script>