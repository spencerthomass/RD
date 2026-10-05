<template>
  <DataTable :columns="columns" :rows="peers" row-key="guid" :loading="loading" :error="error" clickable
    search-placeholder="Search by ID, user, OS, IP…" empty-text="No devices have registered yet."
    @refresh="load" @row-click="selected = $event">
    <template #filters>
      <select v-model="statusFilter" aria-label="Status filter"
        class="rounded-lg border-slate-300 py-2 text-sm dark:border-slate-600 dark:bg-slate-900">
        <option value="all">All statuses</option>
        <option value="online">Online</option>
        <option value="offline">Offline</option>
      </select>
    </template>
    <template #cell-id="{ row }">
      <span class="font-mono font-medium">{{ row.id }}</span>
    </template>
    <template #cell-status="{ row }">
      <StatusBadge :tone="isOnline(row) ? 'green' : 'gray'">{{ isOnline(row) ? 'Online' : 'Offline' }}</StatusBadge>
    </template>
    <template #actions="{ row }">
      <button type="button" class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700" title="Copy ID"
        @click="copy(row.id)"><ClipboardDocumentIcon class="h-5 w-5" /></button>
    </template>
  </DataTable>

  <!-- Detail drawer -->
  <TransitionRoot :show="!!selected" as="template">
    <Dialog as="div" class="relative z-40" @close="selected = null">
      <div class="fixed inset-0 bg-slate-900/40" aria-hidden="true" />
      <DialogPanel v-if="selected" class="fixed inset-y-0 right-0 w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl dark:bg-slate-800">
        <div class="flex items-start justify-between">
          <div>
            <DialogTitle class="font-mono text-xl font-semibold">{{ selected.id }}</DialogTitle>
            <p class="text-sm text-slate-500">{{ selected.info.hostname || 'Unnamed device' }}</p>
          </div>
          <button type="button" class="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Close" @click="selected = null">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        <div class="mt-4"><StatusBadge :tone="isOnline(selected) ? 'green' : 'gray'">{{ isOnline(selected) ? 'Online' : 'Offline' }}</StatusBadge></div>
        <dl class="mt-6 divide-y divide-slate-100 text-sm dark:divide-slate-700">
          <div v-for="[k, v] in details(selected)" :key="k" class="flex justify-between gap-4 py-2">
            <dt class="text-slate-500">{{ k }}</dt><dd class="text-right font-medium">{{ v || '—' }}</dd>
          </div>
        </dl>
        <button type="button" class="mt-6 w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          @click="copy(selected.id)">Copy device ID</button>
      </DialogPanel>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot } from '@headlessui/vue'
import { ClipboardDocumentIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { Peer, PeerApi } from '@/api'
import { useUserStore } from '@/stores/sctgDeskStore'
import DataTable, { type Column } from '@/ui/DataTable.vue'
import StatusBadge from '@/ui/StatusBadge.vue'
import { toast } from '@/ui/toast'

const userStore = useUserStore()
const allPeers = ref<Peer[]>([])
const loading = ref(false)
const error = ref('')
const selected = ref<Peer | null>(null)
const statusFilter = ref<'all' | 'online' | 'offline'>('all')

/** Heartbeats arrive every few seconds; treat a device as online if seen in the last 3 minutes. */
const ONLINE_WINDOW_MS = 3 * 60 * 1000
function lastSeen(p: Peer): number {
  // server stores SQLite UTC timestamps ("YYYY-MM-DD HH:MM:SS")
  const t = Date.parse(String(p.last_online).replace(' ', 'T') + (/[zZ]|[+-]\d\d:?\d\d$/.test(String(p.last_online)) ? '' : 'Z'))
  return Number.isNaN(t) ? 0 : t
}
const isOnline = (p: Peer) => Date.now() - lastSeen(p) < ONLINE_WINDOW_MS
function ago(p: Peer) {
  const t = lastSeen(p)
  if (!t) return ''
  const s = Math.max(0, Math.round((Date.now() - t) / 1000))
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`
  return `${Math.floor(s / 86400)} d ago`
}

const peers = computed(() => allPeers.value.filter(p =>
  statusFilter.value === 'all' || (statusFilter.value === 'online') === isOnline(p)))

const columns: Column[] = [
  { key: 'id', label: 'Device ID', sortable: true },
  { key: 'status', label: 'Status', sortable: true, value: p => (isOnline(p) ? 'Online' : 'Offline') },
  { key: 'hostname', label: 'Hostname', sortable: true, value: p => p.info.hostname },
  { key: 'username', label: 'User', sortable: true, value: p => p.info.username, hideBelow: 'lg' },
  { key: 'os', label: 'OS', sortable: true, value: p => p.info.os, hideBelow: 'lg' },
  { key: 'ip', label: 'IP', sortable: true, value: p => p.info.ip, hideBelow: 'lg' },
  { key: 'last_online', label: 'Last seen', sortable: true, value: p => ago(p) },
]

function details(p: Peer): [string, string | null | undefined][] {
  return [['Hostname', p.info.hostname], ['User', p.info.username], ['OS', p.info.os], ['IP', p.info.ip],
    ['CPU', p.info.cpu], ['Memory', p.info.memory], ['Client version', p.info.version],
    ['Last seen', `${p.last_online} (${ago(p)})`], ['GUID', p.guid]]
}

async function copy(text: string) {
  try { await navigator.clipboard.writeText(text); toast('Copied to clipboard') }
  catch { toast('Could not copy', 'error') }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const r = await new PeerApi(userStore.api_configuration).peers()
    if (r.data.msg !== 'success') throw new Error(r.data.msg || 'Unexpected response')
    allPeers.value = r.data.data
  } catch (e: any) {
    error.value = e?.message || 'Request failed'
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>
