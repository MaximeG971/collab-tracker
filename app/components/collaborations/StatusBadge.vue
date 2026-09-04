<script setup lang="ts">
import type { CollaborationStatus } from '~/types'
import { STATUS_LABELS } from '~/types'

const props = defineProps<{
  status: CollaborationStatus | null
  isLate?: boolean
}>()

const label = computed(() =>
  props.status ? STATUS_LABELS[props.status] : 'Sans livrable'
)

const colorClasses = computed(() => {
  if (props.isLate) {
    return 'bg-red-100 text-red-800'
  }

  switch (props.status) {
    case 'published':
      return 'bg-green-100 text-green-800'
    case 'scheduled':
      return 'bg-blue-100 text-blue-800'
    case 'to_validate':
    case 'to_create':
      return 'bg-amber-100 text-amber-800'
    default:
      return 'bg-gray-100 text-gray-700'
  }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
    :class="colorClasses"
  >
    <span v-if="isLate" aria-hidden="true">⚠</span>
    {{ label }}
  </span>
</template>
