<template>
  <div class="block sm:flex mb-2 sm:mb-0">
    <h4 class="w-full sm:w-6/12 flex-shrink-0">{{ field.fieldName }}</h4>
    <p
      v-if="field.fieldName === 'Просмотры'"
      class="font-bold w-full sm:w-6/12 flex-shrink-0 break-words"
    >
      <router-link :to="$route.path + 'views/'">{{ getFieldValue(field) }}</router-link>
    </p>
    <p
      v-else-if="field.fieldName === 'Друзья'"
      class="font-bold w-full sm:w-6/12 flex-shrink-0 break-words"
    >
      <router-link :to="$route.path + 'friends/'">{{ getFieldValue(field) }}</router-link>
    </p>
    <p
      v-else
      class="font-bold w-full sm:w-6/12 flex-shrink-0"
      style="word-wrap: break-word"
    >{{ getFieldValue(field) }}</p>
  </div>
</template>

<script>
import { getFieldValue } from "../../scripts/account/profile";

export default {
  props: {
    field: {
      type: Object,
      required: true,
    },
  },
  methods: { getFieldValue },
}
</script>