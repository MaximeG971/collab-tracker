<script setup lang="ts">
import { COLLABORATION_STATUSES, STATUS_LABELS } from '~/types'
import type { CollaborationStatus } from '~/types'

const { collaborations, loading, error, fetchCollaborations } = useCollaborations()
const { updateDeliverablesStatusByCollaborationId } = useDeliverables()

const draggedCollaborationId = ref<string | null>(null)
const activeDropStatus = ref<CollaborationStatus | null>(null)
const isUpdating = ref(false)

const columns = computed(() =>
  COLLABORATION_STATUSES.map((status) => ({
    status,
    title: STATUS_LABELS[status],
    collaborations: collaborations.value.filter(
      (collaboration) => (collaboration.computed_status ?? 'to_contact') === status
    ),
  }))
)

function handleDragStart(event: DragEvent, collaborationId: string) {
  draggedCollaborationId.value = collaborationId

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', collaborationId)
  }
}

function handleDragEnd() {
  draggedCollaborationId.value = null
  activeDropStatus.value = null
}

async function handleDrop(targetStatus: CollaborationStatus) {
  const collaborationId = draggedCollaborationId.value
  activeDropStatus.value = null

  if (!collaborationId) {
    return
  }

  const current = collaborations.value.find((collaboration) => collaboration.id === collaborationId)
  const currentStatus = current?.computed_status ?? 'to_contact'

  if (currentStatus === targetStatus) {
    handleDragEnd()
    return
  }

  isUpdating.value = true

  const { error: updateError } = await updateDeliverablesStatusByCollaborationId({
    collaborationId,
    status: targetStatus,
  })

  isUpdating.value = false

  if (updateError) {
    error.value = updateError
    handleDragEnd()
    return
  }

  await fetchCollaborations()
  handleDragEnd()
}

onMounted(() => {
  fetchCollaborations()
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <header class="border-b border-gray-200 bg-white">
      <div class="flex w-full flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Vue Kanban</p>
          <h1 class="text-xl font-bold text-gray-900 sm:text-2xl">Mes collaborations</h1>
        </div>
        <NuxtLink
          to="/collaborations/new"
          class="inline-flex self-start rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 sm:self-auto"
        >
          + Nouvelle
        </NuxtLink>
      </div>
    </header>

    <LayoutAppNav />

    <main class="flex flex-1 min-h-0 w-full flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div class="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <p class="text-sm text-gray-500">
            Visualise l’avancement de tes collaborations par statut.
          </p>
        </div>
      </div>

      <div v-if="loading" class="py-12 text-center text-sm text-gray-500">
        Chargement...
      </div>

      <div
        v-else-if="error"
        class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        Impossible de charger les collaborations : {{ error }}
      </div>

      <div v-else class="flex-1 min-h-0 pb-4 lg:overflow-x-auto lg:overflow-y-hidden">
        <div class="flex min-h-full flex-col gap-4 lg:min-w-max lg:flex-row lg:items-stretch">
          <CollaborationsKanbanColumn
            v-for="column in columns"
            :key="column.status"
            :title="column.title"
            :status="column.status"
            :collaborations="column.collaborations"
            :highlighted="activeDropStatus === column.status"
            :is-updating="isUpdating"
            :dragged-collaboration-id="draggedCollaborationId"
            @dragstart="handleDragStart"
            @dragend="handleDragEnd"
            @dragover="activeDropStatus = $event"
            @drop="handleDrop"
          />
        </div>
      </div>
    </main>
  </div>
</template>
