<script setup lang="ts">
import type { CollaborationStatus, CollaborationWithStatus } from '~/types'

const props = withDefaults(defineProps<{
  title: string
  status: CollaborationStatus
  collaborations: CollaborationWithStatus[]
  highlighted?: boolean
  isUpdating?: boolean
  draggedCollaborationId?: string | null
}>(), {
  highlighted: false,
  isUpdating: false,
  draggedCollaborationId: null,
})

const emit = defineEmits<{
  dragstart: [event: DragEvent, collaborationId: string]
  dragend: []
  dragover: [status: CollaborationStatus]
  drop: [status: CollaborationStatus]
}>()
</script>

<template>
  <section
    class="flex h-full w-full flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition lg:w-72 lg:shrink-0"
    :class="highlighted ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200'"
    @dragover.prevent="emit('dragover', status)"
    @drop.prevent="emit('drop', status)"
  >
    <header class="border-b border-gray-200 px-4 py-4" :class="highlighted ? 'bg-blue-50/70' : ''">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span
              class="h-2.5 w-2.5 rounded-full"
              :class="highlighted ? 'bg-blue-600' : 'bg-gray-400'"
              aria-hidden="true"
            />
            <h3 class="text-sm font-semibold text-gray-900">{{ title }}</h3>
          </div>
          <p class="mt-1 text-xs text-gray-500">{{ collaborations.length }} collaboration(s)</p>
        </div>
        <CollaborationsStatusBadge :status="status" />
      </div>
    </header>

    <div class="flex flex-1 min-h-0 flex-col bg-gradient-to-b from-gray-50 to-white px-3 py-3" :class="highlighted ? 'bg-blue-50/40' : ''">
      <div
        v-if="collaborations.length === 0"
        class="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-3 py-6 text-center text-sm text-gray-500"
        :class="highlighted ? 'border-blue-300 bg-blue-50/60 text-blue-700' : ''"
      >
        {{ isUpdating ? 'Déplacement...' : 'Aucune collaboration' }}
      </div>

      <div v-else class="flex-1 space-y-3 overflow-y-auto pr-1">
        <CollaborationsCollaborationCard
          v-for="collaboration in collaborations"
          :key="collaboration.id"
          :collaboration="collaboration"
          :draggable="true"
          :is-dragging="props.draggedCollaborationId === collaboration.id"
          @dragstart="emit('dragstart', $event, collaboration.id)"
          @dragend="emit('dragend')"
        />
      </div>
    </div>
  </section>
</template>
