<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  backTo?: string
  maxWidth?: '2xl' | '4xl' | '5xl'
}>(), {
  maxWidth: '5xl',
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const displayName = computed(() => {
  const meta = user.value?.user_metadata as Record<string, unknown> | undefined
  const name = (meta?.full_name as string | undefined)
    || (meta?.name as string | undefined)
    || (meta?.pseudo as string | undefined)

  return name || user.value?.email || ''
})

const maxWidthClass = computed(() => {
  switch (props.maxWidth) {
    case '2xl':
      return 'max-w-2xl'
    case '4xl':
      return 'max-w-4xl'
    default:
      return 'max-w-5xl'
  }
})

async function handleLogout() {
  await supabase.auth.signOut()
  await navigateTo('/login')
}
</script>

<template>
  <header class="border-b border-gray-200 bg-white">
    <div
      class="mx-auto flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
      :class="maxWidthClass"
    >
      <div class="min-w-0">
        <NuxtLink v-if="backTo" :to="backTo" class="text-sm text-gray-500 hover:text-gray-700">
          ← Retour
        </NuxtLink>
        <p v-else class="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
          Collab Tracker
        </p>
        <h1 class="truncate text-xl font-bold text-gray-900 sm:text-2xl">{{ title }}</h1>
        <p v-if="$slots.default" class="text-sm text-gray-500">
          <slot />
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2 self-start sm:self-auto">
        <slot name="actions" />
        <span v-if="displayName" class="hidden text-sm font-medium text-gray-700 sm:inline">
          {{ displayName }}
        </span>
        <button
          type="button"
          class="rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 hover:text-gray-800"
          @click="handleLogout"
        >
          Déconnexion
        </button>
      </div>
    </div>
  </header>
</template>
