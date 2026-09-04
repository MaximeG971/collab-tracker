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
    <div class="mx-auto flex max-w-lg items-center gap-1 px-4 py-3">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="rounded-lg px-3 py-1.5 text-sm font-medium transition"
        :class="
          isActive(link.to)
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        "
      >
        {{ link.label }}
      </NuxtLink>
    </div>
  </nav>
</template>
