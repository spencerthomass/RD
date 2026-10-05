<template>
  <div class="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
    <!-- Mobile sidebar -->
    <TransitionRoot :show="sidebarOpen" as="template">
      <Dialog as="div" class="relative z-40 lg:hidden" @close="sidebarOpen = false">
        <div class="fixed inset-0 bg-slate-900/60" aria-hidden="true" />
        <DialogPanel class="fixed inset-y-0 left-0 w-64 bg-slate-900 p-4">
          <SidebarNav @navigate="sidebarOpen = false" />
        </DialogPanel>
      </Dialog>
    </TransitionRoot>

    <!-- Desktop sidebar -->
    <aside class="fixed inset-y-0 hidden w-64 bg-slate-900 p-4 lg:block">
      <SidebarNav />
    </aside>

    <div class="lg:pl-64">
      <header class="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-700 dark:bg-slate-800/90">
        <button type="button" class="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-700 lg:hidden" @click="sidebarOpen = true" aria-label="Open menu">
          <Bars3Icon class="h-6 w-6" />
        </button>
        <h1 class="text-lg font-semibold">{{ route.meta.title }}</h1>
        <div class="flex-1" />
        <Menu as="div" class="relative">
          <MenuButton class="flex items-center gap-2 rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-700">
            <img class="h-8 w-8 rounded-full" :src="avatar" alt="" />
            <span class="hidden pr-2 text-sm font-medium sm:block">{{ userStore.user?.name }}</span>
          </MenuButton>
          <MenuItems class="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-slate-800">
            <div class="border-b border-slate-100 px-4 py-2 text-xs text-slate-500 dark:border-slate-700">
              {{ userStore.user?.email || userStore.user?.name }}
            </div>
            <MenuItem v-slot="{ active }">
              <router-link :to="{ name: 'settings' }" class="block px-4 py-2 text-sm" :class="active && 'bg-slate-100 dark:bg-slate-700'">Settings</router-link>
            </MenuItem>
            <MenuItem v-slot="{ active }">
              <button type="button" class="block w-full px-4 py-2 text-left text-sm" :class="active && 'bg-slate-100 dark:bg-slate-700'" @click="logout">Sign out</button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </header>

      <main class="mx-auto max-w-7xl p-4 sm:p-6">
        <router-view />
      </main>
      <footer class="px-6 pb-6 text-center text-xs text-slate-500">
        <template v-if="versions.serverVersion">Server v{{ versions.serverVersion }} · latest client v{{ versions.clientVersion }} · </template>derived from
        <a class="underline" href="https://github.com/sctg-development/sctgdesk-api-server">sctgdesk-api-server</a> (AGPL-3.0)
      </footer>
    </div>
    <ToastHost />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Dialog, DialogPanel, Menu, MenuButton, MenuItem, MenuItems, TransitionRoot } from '@headlessui/vue'
import { Bars3Icon } from '@heroicons/vue/24/outline'
import { LoginApi } from '@/api'
import { useUserStore } from '@/stores/sctgDeskStore'
import { useVersionsStore } from '@/stores/versionsStore'
import { generateAvatar } from '@/utilities/avatar'
import SidebarNav from './SidebarNav.vue'
import ToastHost from '@/ui/ToastHost.vue'
import { toast } from '@/ui/toast'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const versions = useVersionsStore()
const sidebarOpen = ref(false)
const avatar = generateAvatar(userStore.user?.name)

async function logout() {
  try {
    await new LoginApi(userStore.api_configuration).logout({ id: userStore.user.name, uuid: '' })
  } catch (e) {
    toast('Server could not be reached; signed out locally.', 'error')
  }
  userStore.user = null
  userStore.api_configuration = null
  router.push({ name: 'login' })
}
</script>
