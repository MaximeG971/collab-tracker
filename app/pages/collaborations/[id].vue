<script setup lang="ts">
import type { CollaborationWithStatus, Deliverable, DeliverableType, Platform } from '~/types'
import {
  COLLABORATION_STATUSES,
  DELIVERABLE_TYPES,
  DELIVERABLE_TYPE_LABELS,
  PLATFORMS,
  PLATFORM_LABELS,
  STATUS_LABELS,
} from '~/types'

const route = useRoute()
const { fetchCollaborationById, deleteCollaboration } = useCollaborations()
const {
  fetchDeliverablesByCollaborationId,
  createDeliverable,
  updateDeliverablesStatusByCollaborationId,
} = useDeliverables()

const collaboration = ref<CollaborationWithStatus | null>(null)
const deliverables = ref<Deliverable[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const bulkStatus = ref<CollaborationWithStatus['computed_status']>('to_contact')
const bulkStatusSaving = ref(false)

const newDeliverableType = ref<DeliverableType>('reel')
const newDeliverablePlatform = ref<Platform>('instagram')
const newDeliverableDeadline = ref('')
const addingDeliverable = ref(false)
const addDeliverableError = ref<string | null>(null)

const deletingCollaboration = ref(false)

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
  bulkStatus.value = collaborationResult.data.computed_status ?? 'to_contact'
  loading.value = false
}

async function handleBulkStatusChange() {
  if (!collaboration.value || !bulkStatus.value) {
    return
  }

  bulkStatusSaving.value = true

  const { error: updateError } = await updateDeliverablesStatusByCollaborationId({
    collaborationId: collaboration.value.id,
    status: bulkStatus.value,
  })

  bulkStatusSaving.value = false

  if (updateError) {
    error.value = updateError
    return
  }

  await loadCollaboration()
}

async function handleAddDeliverable() {
  if (!collaboration.value) {
    return
  }

  addingDeliverable.value = true
  addDeliverableError.value = null

  const { error: createError } = await createDeliverable({
    collaborationId: collaboration.value.id,
    type: newDeliverableType.value,
    platform: newDeliverablePlatform.value,
    deadlineDate: newDeliverableDeadline.value || null,
  })

  addingDeliverable.value = false

  if (createError) {
    addDeliverableError.value = createError
    return
  }

  newDeliverableDeadline.value = ''
  await loadCollaboration()
}

async function handleDeleteCollaboration() {
  if (!collaboration.value) {
    return
  }

  if (!confirm('Supprimer définitivement cette collaboration et ses livrables ?')) {
    return
  }

  deletingCollaboration.value = true
  const { error: deleteError } = await deleteCollaboration(collaboration.value.id)
  deletingCollaboration.value = false

  if (deleteError) {
    error.value = deleteError
    return
  }

  await navigateTo('/collaborations')
}

onMounted(() => {
  loadCollaboration()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <LayoutAppHeader
      :title="collaboration?.title ?? 'Détail collaboration'"
      back-to="/collaborations"
      max-width="4xl"
    >
      <template v-if="collaboration">{{ collaboration.brand_name ?? 'Marque inconnue' }}</template>

      <template #actions>
        <NuxtLink
          v-if="collaboration"
          :to="`/collaborations/${collaboration.id}/edit`"
          class="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Modifier
        </NuxtLink>
        <button
          v-if="collaboration"
          type="button"
          class="rounded-full border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          :disabled="deletingCollaboration"
          @click="handleDeleteCollaboration"
        >
          {{ deletingCollaboration ? 'Suppression...' : 'Supprimer' }}
        </button>
      </template>
    </LayoutAppHeader>

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

          <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-xl bg-gray-50 p-4">
              <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Statut global</p>
              <select
                v-model="bulkStatus"
                class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                :disabled="bulkStatusSaving"
                @change="handleBulkStatusChange"
              >
                <option v-for="status in COLLABORATION_STATUSES" :key="status" :value="status">
                  {{ STATUS_LABELS[status] }}
                </option>
              </select>
              <p class="mt-1 text-[11px] text-gray-400">Applique ce statut à tous les livrables.</p>
            </div>
            <div class="rounded-xl bg-gray-50 p-4">
              <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Échéance</p>
              <p class="mt-1 text-sm font-semibold text-gray-900">{{ formatDisplayDate(collaboration.deadline_date) }}</p>
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
              @changed="loadCollaboration"
            />
          </div>

          <div class="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-4">
            <p class="text-sm font-semibold text-gray-900">Ajouter un livrable</p>
            <form class="mt-3 grid gap-3 sm:grid-cols-4" @submit.prevent="handleAddDeliverable">
              <select
                v-model="newDeliverableType"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option v-for="type in DELIVERABLE_TYPES" :key="type" :value="type">
                  {{ DELIVERABLE_TYPE_LABELS[type] }}
                </option>
              </select>

              <select
                v-model="newDeliverablePlatform"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option v-for="platform in PLATFORMS" :key="platform" :value="platform">
                  {{ PLATFORM_LABELS[platform] }}
                </option>
              </select>

              <input
                v-model="newDeliverableDeadline"
                type="date"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />

              <button
                type="submit"
                :disabled="addingDeliverable"
                class="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {{ addingDeliverable ? 'Ajout...' : '+ Ajouter' }}
              </button>
            </form>
            <p v-if="addDeliverableError" class="mt-2 text-xs text-red-600">
              {{ addDeliverableError }}
            </p>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>
