<script setup lang="ts">
import type { CollaborationWithStatus } from '~/types'

const props = withDefaults(defineProps<{
  collaboration: CollaborationWithStatus
  draggable?: boolean
  isDragging?: boolean
}>(), {
  draggable: false,
  isDragging: false,
})

const emit = defineEmits<{
  dragstart: [event: DragEvent]
  dragend: []
}>()

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}
</script>

<template>
  <NuxtLink
    :to="`/collaborations/${collaboration.id}`"
    :draggable="props.draggable"
    @dragstart="emit('dragstart', $event)"
    @dragend="emit('dragend')"
    class="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
    :class="props.isDragging ? 'opacity-40 ring-2 ring-blue-200' : ''"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-gray-500">
          {{ collaboration.brand_name ?? 'Marque inconnue' }}
        </p>
        <h3 class="mt-0.5 truncate text-base font-semibold text-gray-900">
          {{ collaboration.title }}
        </h3>
        <p class="mt-1 text-xs text-gray-500">
          Créée le {{ formatDisplayDate(collaboration.created_at) }}
        </p>
      </div>
      <CollaborationsStatusBadge
        :status="collaboration.computed_status"
        :is-late="collaboration.is_late"
      />
    </div>
  </NuxtLink>
</template>
