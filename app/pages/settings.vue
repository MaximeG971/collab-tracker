<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const username = ref('')
const saving = ref(false)
const message = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none'

watch(
  user,
  (value) => {
    const meta = value?.user_metadata as Record<string, unknown> | undefined
    username.value = (meta?.username as string | undefined) ?? ''
  },
  { immediate: true }
)

async function handleSubmit() {
  saving.value = true
  message.value = null
  errorMessage.value = null

  const { error } = await supabase.auth.updateUser({
    data: { username: username.value.trim() || null },
  })

  saving.value = false

  if (error) {
    errorMessage.value = error.message
    return
  }

  // @nuxtjs/supabase ne rafraîchit pas automatiquement l'état réactif
  // useSupabaseUser() sur un simple updateUser() (événement USER_UPDATED) —
  // on force donc un refresh de session pour que le header affiche le
  // nouveau username immédiatement, sans devoir se reconnecter.
  await supabase.auth.refreshSession()

  message.value = 'Nom d\'utilisateur enregistré.'
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <LayoutAppHeader title="Réglages" back-to="/" max-width="2xl" />

    <main class="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900">Profil</h2>
        <p class="mt-1 text-sm text-gray-500">
          Ce nom s'affiche à la place de ton email dans l'application.
        </p>

        <form class="mt-4 space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
            <input
              v-model="username"
              type="text"
              placeholder="Ex. Cassy"
              :class="inputClass"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input
              :value="user?.email"
              type="email"
              disabled
              class="mt-1 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-500"
            />
            <p class="mt-1 text-xs text-gray-400">L'email n'est pas modifiable depuis cette page.</p>
          </div>

          <p v-if="message" class="text-sm text-green-600">{{ message }}</p>
          <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

          <button
            type="submit"
            :disabled="saving"
            class="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </form>
      </section>
    </main>
  </div>
</template>
