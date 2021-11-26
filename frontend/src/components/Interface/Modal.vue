<template>
  <TransitionRoot as="template" :show="true">
    <Dialog as="div" static class="fixed z-10 inset-0 overflow-y-auto" @close="$emit('close-modal')">
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
              @close-modal="$emit('close-modal')"
              @load-user="$emit('load-user')"
            />
            <registration-form
              v-if="action === 'registration'"
              @close-modal="$emit('close-modal')"
              @load-user="$emit('load-user')"
            />
            <change-password-form
              v-if="action === 'changePassword'"
              @close-modal="$emit('close-modal')"
              @load-user="$emit('load-user')"
            />
            <delete-profile-form
              v-if="action === 'deleteProfile'"
              @close-modal="$emit('close-modal')"
              @load-user="$emit('load-user')"
            />
            <transform-pawn
              v-if="action === 'transformPawn'"
              @close-modal="$emit('close-modal')"
            />
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script>
import { Dialog, DialogOverlay, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import AuthorizationForm from '@/components/Auth/AuthorizationForm'
import RegistrationForm from '@/components/Auth/RegistrationForm'
import ChangePasswordForm from '@/components/EditProfile/ChangePasswordForm'
import DeleteProfileForm from '@/components/EditProfile/DeleteProfileForm'
import TransformPawn from '@/components/Chess/TransformPawn'

export default {
  components: {
    Dialog,
    DialogOverlay,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
    AuthorizationForm,
    RegistrationForm,
    ChangePasswordForm,
    DeleteProfileForm,
    TransformPawn,
  },
  props: {
    action: {
      type: String,
      required: true
    }
  },
}
</script>