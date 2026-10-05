<template>
  <DataTable :columns="columns" :rows="groups" row-key="guid" :loading="loading" :error="error"
    search-placeholder="Search groups…" empty-text="No groups yet." @refresh="load">
    <template #toolbar>
      <button type="button" class="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        @click="addOpen = true"><PlusIcon class="h-4 w-4" /> Add group</button>
    </template>
    <template #actions="{ row }">
      <Menu as="div" class="relative inline-block text-left">
        <MenuButton class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Row actions">
          <EllipsisVerticalIcon class="h-5 w-5" />
        </MenuButton>
        <MenuItems class="absolute right-0 z-20 mt-1 w-40 rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-slate-800">
          <MenuItem v-slot="{ active }"><button type="button" class="block w-full px-4 py-2 text-left text-sm" :class="active && 'bg-slate-100 dark:bg-slate-700'" @click="editGuid = row.guid">Edit</button></MenuItem>
          <MenuItem v-slot="{ active }"><button type="button" class="block w-full px-4 py-2 text-left text-sm text-red-600" :class="active && 'bg-red-50 dark:bg-red-950'" @click="toDelete = row">Delete…</button></MenuItem>
        </MenuItems>
      </Menu>
    </template>
  </DataTable>

  <AddGroup v-if="addOpen" @add_group_close="addOpen = false" @group_added="addOpen = false; load()" />
  <EditGroup v-if="editGuid" :uuid="editGuid" @edit_group_close="editGuid = ''" @group_updated="editGuid = ''; load()" />
  <ConfirmDialog :open="!!toDelete" danger title="Delete group" confirm-label="Delete"
    :message="`Delete group “${toDelete?.name}”? This cannot be undone.`" @cancel="toDelete = null" @confirm="doDelete" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { EllipsisVerticalIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { Group, GroupApi } from '@/api'
import { useUserStore } from '@/stores/sctgDeskStore'
import { getGroups } from '@/utilities/api'
import AddGroup from '@/components/AddGroup.vue'
import EditGroup from '@/components/EditGroup.vue'
import DataTable, { type Column } from '@/ui/DataTable.vue'
import ConfirmDialog from '@/ui/ConfirmDialog.vue'
import { toast } from '@/ui/toast'

const groups = ref<Group[]>([])
const loading = ref(false)
const error = ref('')
const addOpen = ref(false)
const editGuid = ref('')
const toDelete = ref<Group | null>(null)

const columns: Column[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'note', label: 'Note', sortable: true },
  { key: 'guid', label: 'GUID', hideBelow: 'lg', class: 'font-mono text-xs' },
]

async function load() {
  loading.value = true
  error.value = ''
  try { groups.value = await getGroups() } catch (e: any) { error.value = e?.message || 'Request failed' }
  finally { loading.value = false }
}
onMounted(load)

async function doDelete() {
  const g = toDelete.value
  toDelete.value = null
  if (!g) return
  try {
    await new GroupApi(useUserStore().api_configuration).groupDelete([], g.guid)
    toast(`Deleted group ${g.name}`)
    load()
  } catch { toast('Delete failed', 'error') }
}
</script>
