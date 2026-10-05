<template>
  <DataTable :columns="columns" :rows="users" row-key="guid" :loading="loading" :error="error"
    :selectable="isAdmin" search-placeholder="Search by name, email, group…" empty-text="No users yet."
    @refresh="load">
    <template #toolbar>
      <button v-if="isAdmin" type="button" class="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        @click="addOpen = true"><PlusIcon class="h-4 w-4" /> Add user</button>
    </template>
    <template #bulk="{ rows }">
      <button type="button" class="rounded-lg bg-white px-3 py-1 text-slate-800 ring-1 ring-slate-300" @click="bulkEnable(rows, true)">Activate</button>
      <button type="button" class="rounded-lg bg-white px-3 py-1 text-slate-800 ring-1 ring-slate-300" @click="bulkEnable(rows, false)">Deactivate</button>
      <button type="button" class="rounded-lg bg-red-600 px-3 py-1 text-white" @click="askDelete(rows)">Delete</button>
    </template>
    <template #cell-name="{ row }">
      <div class="flex items-center gap-3">
        <img :src="generateAvatar(row.name)" class="h-8 w-8 rounded-full" alt="" />
        <div class="min-w-0"><div class="font-medium">{{ row.name }}</div><div class="truncate text-xs text-slate-500">{{ row.email }}</div></div>
      </div>
    </template>
    <template #cell-status="{ row }">
      <StatusBadge :tone="row.status == 1 ? 'green' : 'gray'">{{ row.status == 1 ? 'Active' : 'Inactive' }}</StatusBadge>
    </template>
    <template #cell-role="{ row }">
      <StatusBadge :tone="row.is_admin ? 'indigo' : 'gray'">{{ row.is_admin ? 'Admin' : 'User' }}</StatusBadge>
    </template>
    <template v-if="isAdmin" #actions="{ row }">
      <Menu as="div" class="relative inline-block text-left">
        <MenuButton class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Row actions">
          <EllipsisVerticalIcon class="h-5 w-5" />
        </MenuButton>
        <MenuItems class="absolute right-0 z-20 mt-1 w-44 rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-slate-800">
          <MenuItem v-slot="{ active }"><button type="button" class="block w-full px-4 py-2 text-left text-sm" :class="active && 'bg-slate-100 dark:bg-slate-700'" @click="edit(row)">Edit</button></MenuItem>
          <MenuItem v-slot="{ active }"><button type="button" class="block w-full px-4 py-2 text-left text-sm" :class="active && 'bg-slate-100 dark:bg-slate-700'" @click="bulkEnable([row], row.status != 1)">{{ row.status == 1 ? 'Deactivate' : 'Activate' }}</button></MenuItem>
          <MenuItem v-slot="{ active }"><button type="button" class="block w-full px-4 py-2 text-left text-sm text-red-600" :class="active && 'bg-red-50 dark:bg-red-950'" @click="askDelete([row])">Delete…</button></MenuItem>
        </MenuItems>
      </Menu>
    </template>
  </DataTable>

  <AddUser v-if="addOpen" @add_user_close="addOpen = false" @user_added="addOpen = false; load()" />
  <EditUser v-if="editing" :username="editing.name" :uuid="editing.guid" @update_user_close="editing = null; load()" />
  <ConfirmDialog :open="!!toDelete.length" danger title="Delete users" confirm-label="Delete"
    :message="`Permanently delete ${toDelete.length} user${toDelete.length > 1 ? 's' : ''}${toDelete.length === 1 ? ' (' + toDelete[0].name + ')' : ''}? This cannot be undone.`"
    @cancel="toDelete = []" @confirm="doDelete" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { EllipsisVerticalIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { DeleteUserRequest, EnableUserRequest, UserApi, UserListResponse } from '@/api'
import { useUserStore } from '@/stores/sctgDeskStore'
import { getUsers } from '@/utilities/api'
import { generateAvatar } from '@/utilities/avatar'
import AddUser from '@/components/AddUser.vue'
import EditUser from '@/components/EditUser.vue'
import DataTable, { type Column } from '@/ui/DataTable.vue'
import StatusBadge from '@/ui/StatusBadge.vue'
import ConfirmDialog from '@/ui/ConfirmDialog.vue'
import { toast } from '@/ui/toast'

const userStore = useUserStore()
const isAdmin = computed(() => !!userStore.user?.admin)
const users = ref<UserListResponse[]>([])
const loading = ref(false)
const error = ref('')
const addOpen = ref(false)
const editing = ref<UserListResponse | null>(null)
const toDelete = ref<UserListResponse[]>([])

const columns: Column[] = [
  { key: 'name', label: 'User', sortable: true, value: u => `${u.name} ${u.email}` },
  { key: 'status', label: 'Status', sortable: true, value: u => (u.status == 1 ? 'Active' : 'Inactive') },
  { key: 'role', label: 'Role', sortable: true, value: u => (u.is_admin ? 'Admin' : 'User') },
  { key: 'group_name', label: 'Group', sortable: true, hideBelow: 'lg' },
  { key: 'note', label: 'Note', hideBelow: 'lg' },
]

async function load() {
  loading.value = true
  error.value = ''
  try { users.value = await getUsers() } catch (e: any) { error.value = e?.message || 'Request failed' }
  finally { loading.value = false }
}
onMounted(load)

function edit(u: UserListResponse) { editing.value = u }

async function bulkEnable(rows: UserListResponse[], activate: boolean) {
  try {
    const req = { rows: rows.map(r => r.guid), disable: activate } as EnableUserRequest // NB: server stores this value as the new status (1 = active), so `disable: true` activates
    const r = await new UserApi(userStore.api_configuration).userEnable(req)
    if (r.data.msg !== 'success') throw new Error()
    toast(`${activate ? 'Activated' : 'Deactivated'} ${rows.length} user${rows.length > 1 ? 's' : ''}`)
    load()
  } catch { toast('Action failed', 'error') }
}

function askDelete(rows: UserListResponse[]) { toDelete.value = rows }
async function doDelete() {
  const rows = toDelete.value
  toDelete.value = []
  try {
    const req: DeleteUserRequest = { rows: rows.map(r => r.guid) }
    const r = await new UserApi(userStore.api_configuration).userDelete(req)
    if (r.data.msg !== 'success') throw new Error()
    toast(`Deleted ${rows.length} user${rows.length > 1 ? 's' : ''}`)
    load()
  } catch { toast('Delete failed', 'error') }
}
</script>
