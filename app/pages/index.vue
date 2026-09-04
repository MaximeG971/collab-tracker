<script setup lang="ts">
const supabase = useSupabaseClient()

const { collaborations, loading, error, fetchCollaborations } = useCollaborations()

const lateCount = computed(
  () => collaborations.value.filter((c) => c.is_late).length
)

async function handleLogout() {
  await supabase.auth.signOut()
  await navigateTo('/login')
}

onMounted(() => {
  fetchCollaborations()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="border-b border-gray-200 bg-white">
      <div class="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
        <div>
          <h1 class="text-xl font-bold text-gray-900">Collab Tracker</h1>
          <p class="text-sm text-gray-500">Tes collaborations en un coup d'œil</p>
        </div>
        <button
          type="button"
          class="text-sm text-gray-500 hover:text-gray-700"
          @click="handleLogout"
        >
          Déconnexion
        </button>
      </div>
    </header>

    <LayoutAppNav />

    <main class="mx-auto max-w-lg px-4 py-6">
      <div v-if="loading" class="py-12 text-center text-sm text-gray-500">
        Chargement...
      </div>

      <div
        v-else-if="error"
        class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        Impossible de charger les collaborations : {{ error }}
      </div>

      <template v-else>
        <div class="mb-6 grid grid-cols-2 gap-3">
          <div class="rounded-xl border border-gray-200 bg-white p-4">
            <p class="text-2xl font-bold text-gray-900">{{ collaborations.length }}</p>
            <p class="text-sm text-gray-500">Collaborations</p>
          </div>
          <div class="rounded-xl border border-gray-200 bg-white p-4">
            <p class="text-2xl font-bold" :class="lateCount ? 'text-red-600' : 'text-gray-900'">
              {{ lateCount }}
            </p>
            <p class="text-sm text-gray-500">En retard</p>
          </div>
        </div>

        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Dernières collaborations</h2>
          <NuxtLink
            to="/collaborations"
            class="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Voir tout
          </NuxtLink>
        </div>

        <div v-if="collaborations.length === 0" class="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p class="text-sm text-gray-500">Aucune collaboration pour l'instant.</p>
          <NuxtLink
            to="/collaborations/new"
            class="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Créer une collaboration
          </NuxtLink>
        </div>

        <ul v-else class="space-y-3">
          <li v-for="collaboration in collaborations.slice(0, 5)" :key="collaboration.id">
            <CollaborationsCollaborationCard :collaboration="collaboration" />
          </li>
        </ul>
      </template>
    </main>
  </div>
</template>
