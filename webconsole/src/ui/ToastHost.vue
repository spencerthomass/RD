<template>
  <div class="pointer-events-none fixed bottom-4 right-4 z-998 flex flex-col gap-2" aria-live="polite">
    <div v-for="t in toasts" :key="t.id"
      class="pointer-events-auto rounded-lg px-4 py-3 text-sm text-white shadow-lg"
      :class="t.kind === 'error' ? 'bg-red-600' : 'bg-slate-800'">{{ t.message }}</div>
  </div>
</template>
<script setup lang="ts">
import { toasts } from './toast'
</script>
