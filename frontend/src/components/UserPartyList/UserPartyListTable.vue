<template>
  <div class="w-full">
    <div class="flex bg-main border-main-dark2 rounded-t p-2 text-gray-200 text-center">
      <div class="w-1/4">Игроки</div>
      <div class="w-1/4">Результат</div>
      <div class="w-1/4">Ходы</div>
      <div class="w-1/4">Дата</div>
    </div>
    <user-party-list-table-item
      v-for="(party, index) in partyList"
      :key="index"
      :currentUsername="currentUsername"
      :party="party"
      :class="[index === partyList.length - 1 ? 'rounded-b' : '']"
    />
  </div>
</template>

<script>
import UserPartyListTableItem from "./UserPartyListTableItem.vue";

export default {
  components: { UserPartyListTableItem },
  props: {
    partyList: {
      type: Array,
      required: true,
    },
    currentUsername: {
      type: String,
      required: true,
    },
  },
}
</script>