<template>
    <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div class="w-full max-w-sm space-y-6">
            <h1 class="text-2xl font-bold text-gray-900">Connexion</h1>

            <form @submit.prevent="handleLogin" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <input v-model="email" type="email" required
                        class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700">Mot de passe</label>
                    <input v-model="password" type="password" required
                        class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
                </div>

                <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

                <button type="submit" :disabled="loading"
                    class="w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                    {{ loading ? 'Connexion...' : 'Se connecter' }}
                </button>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
    loading.value = true
    errorMessage.value = ''

    const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
    })

    loading.value = false

    if (error) {
        errorMessage.value = "Email ou mot de passe incorrect."
        return
    }

    await navigateTo('/')
}
</script>