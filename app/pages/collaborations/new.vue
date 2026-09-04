<script setup lang="ts">
import type { DeliverableType, Platform } from '~/types'

const { brands, fetchBrands } = useBrands()
const { createCollaboration, saving } = useCollaborations()

const brandName = ref('')
const title = ref('')
const deliverableType = ref<DeliverableType>('reel')
const deliverablePlatform = ref<Platform>('instagram')
const notes = ref('')
const errorMessage = ref('')

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none'

onMounted(() => {
  fetchBrands()
})

async function handleSubmit() {
  errorMessage.value = ''

  const { collaborationId, error } = await createCollaboration({
    brandName: brandName.value,
    title: title.value,
    deliverableType: deliverableType.value,
    deliverablePlatform: deliverablePlatform.value,
    notes: notes.value,
  })

  if (error || !collaborationId) {
    errorMessage.value = error ?? 'Création impossible.'
    return
  }

  await navigateTo('/collaborations')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="border-b border-gray-200 bg-white">
      <div class="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <NuxtLink
          to="/collaborations"
          class="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Retour
        </NuxtLink>
        <h1 class="text-xl font-bold text-gray-900">Nouvelle collaboration</h1>
      </div>
    </header>

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

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-sm font-medium text-gray-700">Type du premier livrable</label>
            <select v-model="deliverableType" :class="inputClass">
              <option value="reel">Reel</option>
              <option value="story">Story</option>
              <option value="post">Post</option>
              <option value="video">Vidéo</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Plateforme</label>
            <select v-model="deliverablePlatform" :class="inputClass">
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="other">Autre</option>
            </select>
          </div>
        </div>

        <p class="text-xs text-gray-500">
          Le statut initial du livrable sera « À contacter ».
        </p>

        <div>
          <label class="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            v-model="notes"
            rows="3"
            placeholder="Brief, contacts, infos utiles..."
            :class="inputClass"
          />
        </div>

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
