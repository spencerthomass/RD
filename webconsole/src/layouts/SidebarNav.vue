<template>
  <nav class="flex h-full flex-col" aria-label="Main">
    <div class="mb-6 flex items-center gap-3 px-2">
      <img class="h-8 w-8" :src="$require('@/assets/sctg.svg')" alt="" />
      <span class="font-semibold text-white">Desk Console</span>
    </div>
    <ul class="space-y-1">
      <li v-for="item in items" :key="item.to">
        <router-link :to="{ name: item.to }" @click="$emit('navigate')"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          active-class="!bg-indigo-600 !text-white">
          <component :is="item.icon" class="h-5 w-5" />
          {{ item.label }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>
<script setup lang="ts">
import { $require } from '@/utilities/viteHelper.js'
import { BookOpenIcon, ComputerDesktopIcon, Cog6ToothIcon, HomeIcon, UserGroupIcon, UsersIcon } from '@heroicons/vue/24/outline'
defineEmits<{ (e: 'navigate'): void }>()
const items = [
  { to: 'dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: 'devices', label: 'Devices', icon: ComputerDesktopIcon },
  { to: 'users', label: 'Users', icon: UsersIcon },
  { to: 'groups', label: 'Groups', icon: UserGroupIcon },
  { to: 'address-books', label: 'Address books', icon: BookOpenIcon },
  { to: 'settings', label: 'Settings', icon: Cog6ToothIcon },
]
</script>
