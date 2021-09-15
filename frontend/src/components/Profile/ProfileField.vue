<template>
  <div class="block sm:flex mb-2 sm:mb-0">
    <h4 class="w-full sm:w-6/12 flex-shrink-0">{{ field.fieldName }}</h4>
    <p
      v-if="field.fieldName === 'Просмотры'"
      class="font-bold w-full sm:w-6/12 flex-shrink-0 break-words"
    >
      <router-link :to="$route.path + 'views/'">{{ getFieldValue }}</router-link>
    </p>
    <p
      v-else-if="field.fieldName === 'Друзья'"
      class="font-bold w-full sm:w-6/12 flex-shrink-0 break-words"
    >
      <router-link :to="$route.path + 'friends/'">{{ getFieldValue }}</router-link>
    </p>
    <p
      v-else
      class="font-bold w-full sm:w-6/12 flex-shrink-0"
      style="word-wrap: break-word"
    >{{ getFieldValue }}</p>
  </div>
</template>

<script>
import { DateTime } from 'luxon'

export default {
  props: {
    field: {
      type: Object,
      required: true,
    },
  },
  computed: {
    getFieldValue() {
      if (this.field.fieldValue === null) return 'Не указано'

      if (typeof this.field.fieldValue === 'string') {
        if (this.field.fieldValue === '') return 'Не указано'
        else if (this.field.fieldName === 'Был(-а) онлайн' ||
            this.field.fieldName === 'Был онлайн' ||
            this.field.fieldName === 'Была онлайн'
        ) return this.timeAgo.format(Date.parse(this.field.fieldValue))
        else if (this.field.fieldName === 'Дата рождения' || this.field.fieldName === 'Дата регистрации') {
          const date = DateTime.fromISO(this.field.fieldValue).setLocale('ru').toFormat('d MMMM y') + ' г.'

          if (this.field.fieldName === 'Дата регистрации') {
            return date + ' ' + DateTime.fromISO(this.field.fieldValue).setLocale('ru').toFormat('H:m')
          } else return date
        } else this.field.fieldValue.substr(0, 48)
      }

      return this.field.fieldValue
    }
  }
}
</script>