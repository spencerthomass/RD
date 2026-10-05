<template>
  <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium" :class="tones[tone]">
    <span class="h-1.5 w-1.5 rounded-full" :class="dots[tone]" />
    <slot />
  </span>
</template>
<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'green' | 'gray' | 'red' | 'indigo' | 'amber' }>(), { tone: 'gray' })
const tones = {
  green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  gray: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  red: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
}
const dots = { green: 'bg-emerald-500', gray: 'bg-slate-400', red: 'bg-red-500', indigo: 'bg-indigo-500', amber: 'bg-amber-500' }
</script>
