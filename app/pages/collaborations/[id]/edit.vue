<script setup lang="ts">
import type { CollaborationWithStatus } from '~/types'

const route = useRoute()
const { fetchCollaborationById, updateCollaboration, saving } = useCollaborations()

const collaboration = ref<CollaborationWithStatus | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const title = ref('')
const deadlineDate = ref('')
const notes = ref('')

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none'

const collaborationId = String(route.params.id ?? '')

async function loadCollaboration() {
  loading.value = true
  error.value = null

  const { data, error: fetchError } = await fetchCollaborationById(collaborationId)

  if (fetchError || !data) {
    error.value = fetchError ?? 'Collaboration introuvable.'
    loading.value = false
    return
  }

  collaboration.value = data
  title.value = data.title
  deadlineDate.value = data.deadline_date ? data.deadline_date.slice(0, 10) : ''
  notes.value = data.notes ?? ''
  loading.value = false
}

async function handleSubmit() {
  if (!collaboration.value) {
    return
  }

  const { error: updateError } = await updateCollaboration({
    id: collaboration.value.id,
    title: title.value,
    notes: notes.value,
    deadlineDate: deadlineDate.value || null,
  })

  if (updateError) {
    error.value = updateError
    return
  }

  await navigateTo(`/collaborations/${collaboration.value.id}`)
}

onMounted(() => {
  loadCollaboration()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <LayoutAppHeader
      title="Modifier la collaboration"
      :back-to="`/collaborations/${collaborationId}`"
      max-width="2xl"
    />

    <main class="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <div v-if="loading" class="py-12 text-center text-sm text-gray-500">
        Chargement...
      </div>

      <div
        v-else-if="error && !collaboration"
        class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        {{ error }}
      </div>

      <form v-else class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-sm font-medium text-gray-700">Titre</label>
          <input v-model="title" type="text" required :class="inputClass" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Échéance</label>
          <input v-model="deadlineDate" type="date" :class="inputClass" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Notes</label>
          <textarea v-model="notes" rows="3" :class="inputClass" />
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <button
          type="submit"
          :disabled="saving"
          class="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </form>
    </main>
  </div>
</template>
