<script setup lang="ts">
import type { CollaborationWithStatus } from '~/types'

defineProps<{
  collaboration: CollaborationWithStatus
}>()
</script>

<template>
  <NuxtLink
    :to="`/collaborations/${collaboration.id}`"
    class="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-gray-500">
          {{ collaboration.brand_name ?? 'Marque inconnue' }}
        </p>
        <h3 class="mt-0.5 truncate text-base font-semibold text-gray-900">
          {{ collaboration.title }}
        </h3>
      </div>
      <CollaborationsStatusBadge
        :status="collaboration.computed_status"
        :is-late="collaboration.is_late"
      />
    </div>
  </NuxtLink>
</template>
