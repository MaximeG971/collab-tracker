<script setup lang="ts">
const route = useRoute()

const links = [
  { label: 'Liste', to: '/collaborations' },
  { label: 'Kanban', to: '/collaborations/kanban' },
  { label: 'Calendrier', to: '/collaborations/calendar' },
]

function isActive(path: string) {
  return route.path === path
}
</script>

<template>
  <nav class="border-b border-gray-200 bg-white">
    <div class="mx-auto flex max-w-5xl items-center gap-2 overflow-x-auto px-4 py-3 sm:justify-center">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition"
        :class="
          isActive(link.to)
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        "
      >
        {{ link.label }}
      </NuxtLink>
    </div>
  </nav>
</template>
