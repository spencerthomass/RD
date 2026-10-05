<template>
  <TransitionRoot appear :show="open" as="template">
    <Dialog as="div" class="relative z-50" @close="$emit('cancel')">
      <div class="fixed inset-0 bg-slate-900/50" aria-hidden="true" />
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">
          <DialogTitle class="text-lg font-semibold text-slate-900 dark:text-white">{{ title }}</DialogTitle>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300"><slot>{{ message }}</slot></p>
          <div class="mt-6 flex justify-end gap-2">
            <button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:text-slate-200" @click="$emit('cancel')">Cancel</button>
            <button type="button" class="rounded-lg px-4 py-2 text-sm font-medium text-white"
              :class="danger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'" @click="$emit('confirm')">{{ confirmLabel }}</button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot } from '@headlessui/vue'
withDefaults(defineProps<{ open: boolean; title: string; message?: string; confirmLabel?: string; danger?: boolean }>(),
  { confirmLabel: 'Confirm', danger: false })
defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>()
</script>
