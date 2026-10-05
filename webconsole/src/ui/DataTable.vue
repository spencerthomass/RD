<template>
  <div class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
    <!-- Toolbar -->
    <div class="flex flex-col gap-3 border-b border-slate-200 p-3 dark:border-slate-700 sm:flex-row sm:items-center">
      <div class="relative flex-1">
        <MagnifyingGlassIcon class="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
        <input v-model="search" type="search" :placeholder="searchPlaceholder" aria-label="Search"
          class="w-full rounded-lg border-slate-300 bg-slate-50 py-2 pl-10 pr-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100" />
      </div>
      <div class="flex items-center gap-2">
        <slot name="filters" />
        <button type="button" @click="$emit('refresh')" title="Refresh"
          class="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
          <ArrowPathIcon class="h-5 w-5" :class="{ 'animate-spin': loading }" />
        </button>
        <slot name="toolbar" />
      </div>
    </div>

    <!-- Bulk action bar -->
    <div v-if="selectable && selectedRows.length"
      class="flex items-center justify-between gap-3 border-b border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-900 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-100">
      <span>{{ selectedRows.length }} selected</span>
      <div class="flex items-center gap-2">
        <slot name="bulk" :rows="selectedRows" :clear="clearSelection" />
        <button type="button" class="underline" @click="clearSelection">Clear</button>
      </div>
    </div>

    <!-- Error / loading / empty -->
    <div v-if="error" class="p-8 text-center" role="alert">
      <p class="font-medium text-red-600 dark:text-red-400">Could not load data</p>
      <p class="mt-1 text-sm text-slate-500">{{ error }}</p>
      <button type="button" class="mt-3 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
        @click="$emit('refresh')">Try again</button>
    </div>
    <div v-else-if="loading && !rows.length" class="space-y-2 p-4" aria-busy="true">
      <div v-for="i in 5" :key="i" class="h-10 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
    </div>
    <div v-else-if="!pageRows.length" class="p-10 text-center text-sm text-slate-500">
      <slot name="empty">{{ search ? 'No results match your search.' : emptyText }}</slot>
    </div>

    <template v-else>
      <!-- Desktop table -->
      <div class="hidden overflow-x-auto md:block">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th v-if="selectable" class="w-10 px-4 py-3">
                <input type="checkbox" :checked="allPageSelected" @change="togglePage" aria-label="Select all"
                  class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              </th>
              <th v-for="c in columns" :key="c.key" scope="col" class="px-4 py-3 font-semibold"
                :class="[c.hideBelow === 'lg' ? 'hidden lg:table-cell' : '', c.class]"
                :aria-sort="sortKey === c.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined">
                <button v-if="c.sortable" type="button" class="inline-flex items-center gap-1 uppercase hover:text-slate-900 dark:hover:text-white"
                  @click="setSort(c.key)">
                  {{ c.label }}
                  <ChevronUpIcon v-if="sortKey === c.key && sortDir === 'asc'" class="h-3 w-3" />
                  <ChevronDownIcon v-else-if="sortKey === c.key" class="h-3 w-3" />
                </button>
                <span v-else>{{ c.label }}</span>
              </th>
              <th v-if="$slots.actions" class="w-12 px-4 py-3"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
            <tr v-for="row in pageRows" :key="row[rowKey]"
              class="hover:bg-slate-50 dark:hover:bg-slate-700/50"
              :class="[isSelected(row) ? 'bg-indigo-50/60 dark:bg-indigo-950/40' : '', clickable ? 'cursor-pointer' : '']"
              @click="clickable && $emit('row-click', row)">
              <td v-if="selectable" class="px-4 py-3" @click.stop>
                <input type="checkbox" :checked="isSelected(row)" @change="toggle(row)" aria-label="Select row"
                  class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              </td>
              <td v-for="c in columns" :key="c.key" class="px-4 py-3 text-slate-700 dark:text-slate-200"
                :class="[c.hideBelow === 'lg' ? 'hidden lg:table-cell' : '', c.class]">
                <slot :name="`cell-${c.key}`" :row="row" :value="cellValue(row, c)">{{ cellValue(row, c) }}</slot>
              </td>
              <td v-if="$slots.actions" class="px-4 py-3 text-right" @click.stop>
                <slot name="actions" :row="row" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile cards -->
      <ul class="divide-y divide-slate-100 dark:divide-slate-700 md:hidden">
        <li v-for="row in pageRows" :key="row[rowKey]" class="flex gap-3 p-4" @click="clickable && $emit('row-click', row)">
          <input v-if="selectable" type="checkbox" :checked="isSelected(row)" @click.stop @change="toggle(row)"
            aria-label="Select row" class="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
          <div class="min-w-0 flex-1 space-y-1">
            <div v-for="(c, i) in columns" :key="c.key" class="flex justify-between gap-3 text-sm">
              <span v-if="i > 0" class="shrink-0 text-slate-400">{{ c.label }}</span>
              <span class="min-w-0 truncate text-slate-700 dark:text-slate-200"
                :class="i === 0 ? 'font-semibold text-slate-900 dark:text-white' : 'text-right'">
                <slot :name="`cell-${c.key}`" :row="row" :value="cellValue(row, c)">{{ cellValue(row, c) }}</slot>
              </span>
            </div>
            <div v-if="$slots.actions" class="pt-1 text-right" @click.stop><slot name="actions" :row="row" /></div>
          </div>
        </li>
      </ul>

      <!-- Pagination -->
      <div class="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-700">
        <span>{{ rangeLabel }}</span>
        <div class="flex items-center gap-2">
          <select v-model.number="pageSize" aria-label="Rows per page"
            class="rounded-lg border-slate-300 py-1 pr-8 text-sm dark:border-slate-600 dark:bg-slate-900">
            <option v-for="n in [10, 25, 50, 100]" :key="n" :value="n">{{ n }} / page</option>
          </select>
          <button type="button" :disabled="page <= 1" @click="page--"
            class="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-40 dark:border-slate-600">Prev</button>
          <button type="button" :disabled="page >= pageCount" @click="page++"
            class="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-40 dark:border-slate-600">Next</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/20/solid'

export interface Column {
  key: string
  label: string
  sortable?: boolean
  /** value used for display default, search and sort */
  value?: (row: any) => string | number | null | undefined
  hideBelow?: 'lg'
  class?: string
}

const props = withDefaults(defineProps<{
  columns: Column[]
  rows: any[]
  rowKey?: string
  loading?: boolean
  error?: string
  selectable?: boolean
  clickable?: boolean
  searchPlaceholder?: string
  emptyText?: string
}>(), { rowKey: 'guid', searchPlaceholder: 'Search…', emptyText: 'Nothing here yet.' })

defineEmits<{ (e: 'refresh'): void; (e: 'row-click', row: any): void }>()

const search = ref('')
const sortKey = ref('')
const sortDir = ref<'asc' | 'desc'>('asc')
const page = ref(1)
const pageSize = ref(25)
const selected = ref(new Set<string>())

function cellValue(row: any, c: Column) {
  const v = c.value ? c.value(row) : row[c.key]
  return v === null || v === undefined || v === '' ? '—' : v
}
function rawValue(row: any, c: Column) {
  const v = c.value ? c.value(row) : row[c.key]
  return v ?? ''
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.rows
  return props.rows.filter(r => props.columns.some(c => String(rawValue(r, c)).toLowerCase().includes(q)))
})

const sorted = computed(() => {
  const c = props.columns.find(c => c.key === sortKey.value)
  if (!c) return filtered.value
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...filtered.value].sort((a, b) =>
    String(rawValue(a, c)).localeCompare(String(rawValue(b, c)), undefined, { numeric: true, sensitivity: 'base' }) * dir)
})

const pageCount = computed(() => Math.max(1, Math.ceil(sorted.value.length / pageSize.value)))
const pageRows = computed(() => sorted.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))
const rangeLabel = computed(() => {
  const total = sorted.value.length
  if (!total) return '0 results'
  const from = (page.value - 1) * pageSize.value + 1
  return `${from}–${Math.min(total, page.value * pageSize.value)} of ${total}`
})

watch([search, pageSize, () => props.rows], () => { page.value = 1 })
watch(() => props.rows, rows => {
  // drop selections that no longer exist
  const keys = new Set(rows.map(r => r[props.rowKey]))
  selected.value = new Set([...selected.value].filter(k => keys.has(k)))
})

function setSort(key: string) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'asc' }
}

const selectedRows = computed(() => props.rows.filter(r => selected.value.has(r[props.rowKey])))
const isSelected = (row: any) => selected.value.has(row[props.rowKey])
const allPageSelected = computed(() => pageRows.value.length > 0 && pageRows.value.every(isSelected))
function toggle(row: any) {
  const s = new Set(selected.value)
  s.has(row[props.rowKey]) ? s.delete(row[props.rowKey]) : s.add(row[props.rowKey])
  selected.value = s
}
function togglePage() {
  const s = new Set(selected.value)
  const all = allPageSelected.value
  pageRows.value.forEach(r => all ? s.delete(r[props.rowKey]) : s.add(r[props.rowKey]))
  selected.value = s
}
function clearSelection() { selected.value = new Set() }
</script>
