<template>
  <TransitionRoot as="template" :show="openModal">
    <Dialog as="div" static class="fixed z-10 inset-0 overflow-y-auto" @close="updateOpenModal(false)">
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
            <authorization-form v-if="modalAction === 'authorization'" />
            <registration-form v-else-if="modalAction === 'registration'" />
            <change-password-form v-else-if="modalAction === 'changePassword'" />
            <delete-profile-form v-else-if="modalAction === 'deleteProfile'" />
            <transform-pawn v-else-if="modalAction === 'transformPawn'" />
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import { Dialog, DialogOverlay, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import AuthorizationForm from "../auth/AuthorizationForm.vue";
import RegistrationForm from "../auth/RegistrationForm.vue";
import ChangePasswordForm from "../edit_profile/ChangePasswordForm.vue";
import DeleteProfileForm from "../edit_profile/DeleteProfileForm.vue";
import TransformPawn from "../chess/TransformPawn.vue";

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
  computed: mapGetters(["openModal", "modalAction"]),
  methods: mapMutations(["updateOpenModal"]),
}
</script>