<script setup lang="ts">
import type { CreateCollaborationInput } from '~/types'

const { brands, fetchBrands } = useBrands()
const { createCollaboration, saving } = useCollaborations()

const brandName = ref('')
const title = ref('')
const deadlineDate = ref('')
const notes = ref('')
const errorMessage = ref('')

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none'

onMounted(() => {
  fetchBrands()
})

async function handleSubmit() {
  errorMessage.value = ''

  const input: CreateCollaborationInput = {
    brandName: brandName.value,
    title: title.value,
    deadlineDate: deadlineDate.value || null,
    notes: notes.value,
  }

  const { collaborationId, error } = await createCollaboration(input)

  if (error || !collaborationId) {
    errorMessage.value = error ?? 'Création impossible.'
    return
  }

  await navigateTo(`/collaborations/${collaborationId}`)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <LayoutAppHeader title="Nouvelle collaboration" back-to="/collaborations" max-width="2xl" />

    <main class="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-sm font-medium text-gray-700">Marque</label>
          <input
            v-model="brandName"
            type="text"
            required
            list="brand-suggestions"
            placeholder="Ex. Sephora, Nike..."
            :class="inputClass"
          />
          <datalist id="brand-suggestions">
            <option v-for="brand in brands" :key="brand.id" :value="brand.name" />
          </datalist>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Titre</label>
          <input
            v-model="title"
            type="text"
            required
            placeholder="Ex. Campagne été 2026"
            :class="inputClass"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Échéance (optionnelle)</label>
          <input v-model="deadlineDate" type="date" :class="inputClass" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            v-model="notes"
            rows="3"
            placeholder="Brief, contacts, infos utiles..."
            :class="inputClass"
          />
        </div>

        <p class="text-xs text-gray-500">
          Tu pourras ajouter les livrables (Reel, Story, Post...) une fois la collaboration créée.
        </p>

        <p v-if="errorMessage" class="text-sm text-red-600">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          :disabled="saving"
          class="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {{ saving ? 'Création...' : 'Créer la collaboration' }}
        </button>
      </form>
    </main>
  </div>
</template>
