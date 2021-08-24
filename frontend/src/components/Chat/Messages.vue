<template>
  <div id="messages" class="py-4 px-2 overflow-y-auto h-full" style="max-height: calc(100% - 81px)">
    <message
      v-for="(message, index) in messages"
      :key="index"
      :message="message"
    />
  </div>
</template>

<script>
import Message from '@/components/Chat/Message'

export default {
  props: {
    messages: {
      type: Array,
      required: true
    }
  },
  components: {
    Message
  },
  methods: {
    scrollToEnd() {
      console.log('scrollToEnd()')
      try {
        const messages = document.getElementById('messages')
        messages.scrollTo(0, messages.scrollHeight)
      } catch (e) {
        console.log(e)
      }
    },
  }
}
</script>