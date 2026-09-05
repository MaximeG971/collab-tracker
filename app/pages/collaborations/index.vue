<script setup lang="ts">
const { collaborations, loading, error, fetchCollaborations } = useCollaborations()

onMounted(() => {
  fetchCollaborations()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <LayoutAppHeader title="Mes collaborations">
      <template #actions>
        <NuxtLink
          to="/collaborations/new"
          class="inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nouvelle
        </NuxtLink>
      </template>
    </LayoutAppHeader>

    <LayoutAppNav />

    <main class="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div v-if="loading" class="py-12 text-center text-sm text-gray-500">
        Chargement...
      </div>

      <div
        v-else-if="error"
        class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        Impossible de charger les collaborations : {{ error }}
      </div>

      <div
        v-else-if="collaborations.length === 0"
        class="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center"
      >
        <p class="text-sm text-gray-500">Aucune collaboration pour l'instant.</p>
        <NuxtLink
          to="/collaborations/new"
          class="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Créer ta première collaboration
        </NuxtLink>
      </div>

      <ul v-else class="space-y-3">
        <li v-for="collaboration in collaborations" :key="collaboration.id">
          <CollaborationsCollaborationCard :collaboration="collaboration" />
        </li>
      </ul>
    </main>
  </div>
</template>
