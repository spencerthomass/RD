import { ref } from 'vue'

export interface Toast { id: number; message: string; kind: 'success' | 'error' }
export const toasts = ref<Toast[]>([])
let next = 1

export function toast(message: string, kind: Toast['kind'] = 'success') {
  const id = next++
  toasts.value.push({ id, message, kind })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 4000)
}
