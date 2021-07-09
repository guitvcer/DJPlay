<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" static class="fixed z-10 inset-0 overflow-y-auto" @close="$emit('close-form')" :open="open">
      <div class="items-end justify-center min-h-screen text-center flex items-center p-0">
        <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="ease-in duration-200"
            leave-from="opacity-100"
            leave-to="opacity-0"
        >
          <DialogOverlay class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <alert :alerts="alerts" v-if="alerts.length" class="z-index-50" />
        <span class="hidden inline-block align-middle h-screen" aria-hidden="true">&#8203;</span>
        <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-0 scale-95"
            enter-to="opacity-100 translate-y-0 scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0scale-100"
            leave-to="opacity-0 translate-y-0 scale-95"
        >
          <div
              class="inline-block bg-white dark:bg-main-dark2 rounded-lg text-left overflow-hidden shadow-xl transform transition-all my-8 max-w-lg w-full relative bottom-10 mx-4"
          >
            <authorization-form
                v-if="action === 'authorization'"
                @close-modal="open = false; $emit('close-form')"
                @sent="createAlert"
            />
            <registration-form
                v-if="action === 'registration'"
                @close-modal="open = false; $emit('close-form')"
                @sent="createAlert"
            />
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script>
import { Dialog, DialogOverlay, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import Alert from '@/components/Alert'
import AuthorizationForm from '@/components/Auth/AuthorizationForm'
import RegistrationForm from '@/components/Auth/RegistrationForm'

export default {
  components: {
    Dialog,
    DialogOverlay,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
    AuthorizationForm,
    RegistrationForm,
    Alert
  },
  props: {
    action: {
      type: String,
      required: true
    },
    open: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      alerts: []
    }
  },
  methods: {
    createAlert(alerts) {
      for (let alert of alerts) {
        if (alert.level === 'success') {
          this.$emit('close-form', alert)
        } else this.alerts.push(alert)
      }
    }
  }
}
</script>