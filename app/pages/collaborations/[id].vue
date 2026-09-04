<script setup lang="ts">
import type { CollaborationWithStatus, Deliverable } from '~/types'
import { STATUS_LABELS } from '~/types'

const route = useRoute()
const { fetchCollaborationById } = useCollaborations()
const { fetchDeliverablesByCollaborationId } = useDeliverables()

const collaboration = ref<CollaborationWithStatus | null>(null)
const deliverables = ref<Deliverable[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

function formatDisplayDate(value: string | null) {
  if (!value) {
    return 'Non renseignée'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

async function loadCollaboration() {
  loading.value = true
  error.value = null

  const collaborationId = String(route.params.id ?? '')

  if (!collaborationId) {
    error.value = 'Collaboration introuvable.'
    loading.value = false
    return
  }

  const [collaborationResult, deliverablesResult] = await Promise.all([
    fetchCollaborationById(collaborationId),
    fetchDeliverablesByCollaborationId(collaborationId),
  ])

  if (collaborationResult.error) {
    error.value = collaborationResult.error
    loading.value = false
    return
  }

  if (!collaborationResult.data) {
    error.value = 'Collaboration introuvable.'
    loading.value = false
    return
  }

  if (deliverablesResult.error) {
    error.value = deliverablesResult.error
    loading.value = false
    return
  }

  collaboration.value = collaborationResult.data
  deliverables.value = deliverablesResult.data
  loading.value = false
}

onMounted(() => {
  loadCollaboration()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="border-b border-gray-200 bg-white">
      <div class="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6 lg:px-8">
        <NuxtLink to="/collaborations" class="text-sm text-gray-500 hover:text-gray-700">
          ← Retour
        </NuxtLink>

        <div v-if="collaboration" class="min-w-0">
          <p class="text-sm text-gray-500">{{ collaboration.brand_name ?? 'Marque inconnue' }}</p>
          <h1 class="truncate text-xl font-bold text-gray-900 sm:text-2xl">{{ collaboration.title }}</h1>
        </div>

        <h1 v-else class="text-xl font-bold text-gray-900">Détail collaboration</h1>
      </div>
    </header>

    <main class="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div v-if="loading" class="py-12 text-center text-sm text-gray-500">
        Chargement...
      </div>

      <div
        v-else-if="error"
        class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        {{ error }}
      </div>

      <template v-else-if="collaboration">
        <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-gray-500">Marque</p>
              <p class="mt-1 text-lg font-semibold text-gray-900">
                {{ collaboration.brand_name ?? 'Marque inconnue' }}
              </p>
            </div>

            <CollaborationsStatusBadge
              :status="collaboration.computed_status"
              :is-late="collaboration.is_late"
            />
          </div>

          <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div class="rounded-xl bg-gray-50 p-4">
              <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Statut</p>
              <p class="mt-1 text-sm font-semibold text-gray-900">
                {{ collaboration.computed_status ? STATUS_LABELS[collaboration.computed_status] : 'Sans livrable' }}
              </p>
            </div>
            <div class="rounded-xl bg-gray-50 p-4">
              <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Créée le</p>
              <p class="mt-1 text-sm font-semibold text-gray-900">{{ formatDisplayDate(collaboration.created_at) }}</p>
            </div>
            <div class="rounded-xl bg-gray-50 p-4">
              <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Livrables</p>
              <p class="mt-1 text-sm font-semibold text-gray-900">{{ deliverables.length }}</p>
            </div>
          </div>

          <div v-if="collaboration.notes" class="mt-6">
            <p class="text-sm font-medium text-gray-500">Notes</p>
            <p class="mt-1 whitespace-pre-line text-sm text-gray-700">{{ collaboration.notes }}</p>
          </div>
        </section>

        <section class="mt-6">
          <div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <h2 class="text-lg font-semibold text-gray-900">Livrables</h2>
            <p class="text-sm text-gray-500">{{ deliverables.length }} élément(s)</p>
          </div>

          <div
            v-if="deliverables.length === 0"
            class="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500"
          >
            Aucun livrable pour cette collaboration.
          </div>

          <div v-else class="space-y-3">
            <CollaborationsDeliverableItem
              v-for="deliverable in deliverables"
              :key="deliverable.id"
              :deliverable="deliverable"
            />
          </div>
        </section>
      </template>
    </main>
  </div>
</template>
