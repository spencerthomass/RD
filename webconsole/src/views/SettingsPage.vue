<template>
  <div class="max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
    <h2 class="text-lg font-semibold">Account</h2>
    <dl class="divide-y divide-slate-100 text-sm dark:divide-slate-700">
      <div class="flex justify-between py-2"><dt class="text-slate-500">Name</dt><dd>{{ user?.name }}</dd></div>
      <div class="flex justify-between py-2"><dt class="text-slate-500">Email</dt><dd>{{ user?.email || '—' }}</dd></div>
      <div class="flex justify-between py-2"><dt class="text-slate-500">Role</dt><dd>{{ user?.admin ? 'Administrator' : 'User' }}</dd></div>
    </dl>
    <p class="text-sm text-slate-500">More settings will appear here as the server API exposes them.</p>
  </div>
</template>
<script setup lang="ts">
import { useUserStore } from '@/stores/sctgDeskStore'
const user = useUserStore().user
</script>
