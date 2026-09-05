<script setup lang="ts">
import type { Deliverable } from '~/types'
import { DELIVERABLE_TYPE_LABELS, PLATFORM_LABELS } from '~/types'

const { collaborations, fetchCollaborations } = useCollaborations()
const { fetchDeliverables } = useDeliverables()

const loading = ref(true)
const error = ref<string | null>(null)
const deliverables = ref<Deliverable[]>([])

const currentMonth = ref(startOfMonth(new Date()))
const selectedDateKey = ref(dateKey(new Date()))
const isMobileDayModalOpen = ref(false)

const collaborationById = computed(() => {
    return new Map(
        collaborations.value.map((collaboration) => [
            collaboration.id,
            collaboration,
        ]),
    )
})

const visibleMonthDays = computed(() => {
    return buildCalendarDays(currentMonth.value)
})

const deliverablesByDay = computed(() => {
    const map = new Map<string, Deliverable[]>()

    for (const deliverable of deliverables.value) {
        if (!deliverable.deadline_date) {
            continue
        }

        const key = dateKey(parseDateOnly(deliverable.deadline_date))
        const existing = map.get(key) ?? []

        map.set(key, [...existing, deliverable])
    }

    return map
})

const selectedDayDeliverables = computed(() => {
    return deliverablesByDay.value.get(selectedDateKey.value) ?? []
})

const overdueDeliverables = computed(() => {
    const todayKey = dateKey(new Date())

    return deliverables.value.filter((deliverable) => {
        if (!deliverable.deadline_date || deliverable.status === 'published') {
            return false
        }

        return (
            dateKey(parseDateOnly(deliverable.deadline_date)) < todayKey
        )
    })
})

function dateKey(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function parseDateOnly(value: string) {
    const [year, month, day] = value.split('-').map(Number)

    return new Date(year, month - 1, day)
}

function startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, amount: number) {
    return new Date(
        date.getFullYear(),
        date.getMonth() + amount,
        1,
    )
}

function buildCalendarDays(month: Date) {
    const firstDay = startOfMonth(month)

    // Convertit dimanche = 0 en lundi = 0
    const startOffset = (firstDay.getDay() + 6) % 7

    const start = new Date(firstDay)
    start.setDate(firstDay.getDate() - startOffset)

    return Array.from({ length: 42 }, (_, index) => {
        const day = new Date(start)
        day.setDate(start.getDate() + index)

        const key = dateKey(day)

        return {
            date: day,
            key,
            isCurrentMonth: day.getMonth() === month.getMonth(),
            isToday: key === dateKey(new Date()),
            isSelected: key === selectedDateKey.value,
            items: deliverablesByDay.value.get(key) ?? [],
        }
    })
}

function formatMonthTitle(date: Date) {
    return new Intl.DateTimeFormat('fr-FR', {
        month: 'long',
        year: 'numeric',
    }).format(date)
}

function formatDayLabel(date: Date) {
    return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'short',
        day: '2-digit',
    }).format(date)
}

function formatReadableDate(value: string) {
    const parsedDate = parseDateOnly(value)

    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(parsedDate)
}

function isLate(deliverable: Deliverable) {
    if (!deliverable.deadline_date || deliverable.status === 'published') {
        return false
    }

    return (
        dateKey(parseDateOnly(deliverable.deadline_date)) <
        dateKey(new Date())
    )
}

function goToPreviousMonth() {
    currentMonth.value = addMonths(currentMonth.value, -1)
    selectedDateKey.value = dateKey(startOfMonth(currentMonth.value))
}

function goToNextMonth() {
    currentMonth.value = addMonths(currentMonth.value, 1)
    selectedDateKey.value = dateKey(startOfMonth(currentMonth.value))
}

function goToToday() {
    const today = new Date()

    currentMonth.value = startOfMonth(today)
    selectedDateKey.value = dateKey(today)
}

function selectDate(key: string) {
    selectedDateKey.value = key
    isMobileDayModalOpen.value = true
}

function closeMobileDayModal() {
    isMobileDayModalOpen.value = false
}

async function loadCalendar() {
    loading.value = true
    error.value = null

    const [collaborationsResult, deliverablesResult] =
        await Promise.all([
            fetchCollaborations(),
            fetchDeliverables(),
        ])

    if (collaborationsResult.error) {
        error.value = collaborationsResult.error
        loading.value = false
        return
    }

    if (deliverablesResult.error) {
        error.value = deliverablesResult.error
        loading.value = false
        return
    }

    deliverables.value = deliverablesResult.data

    if (!deliverablesByDay.value.has(selectedDateKey.value)) {
        const firstDate = visibleMonthDays.value.find(
            (day) => day.isCurrentMonth,
        )

        if (firstDate) {
            selectedDateKey.value = firstDate.key
        }
    }

    loading.value = false
}

onMounted(() => {
    loadCalendar()
})

watch(
    () => currentMonth.value,
    () => {
        if (!deliverablesByDay.value.has(selectedDateKey.value)) {
            const firstDate = visibleMonthDays.value.find(
                (day) => day.isCurrentMonth,
            )

            if (firstDate) {
                selectedDateKey.value = firstDate.key
            }
        }
    },
)
</script>

<template>
    <div class="flex min-h-screen flex-col bg-gray-50">
        <LayoutAppHeader title="Mes collaborations">
            Vue Calendrier — vue d'ensemble des échéances par jour.

            <template #actions>
                <NuxtLink to="/collaborations/new"
                    class="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                    + Nouvelle
                </NuxtLink>
            </template>
        </LayoutAppHeader>

        <LayoutAppNav />

        <main class="flex min-h-0 w-full flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
            <!-- En-tête du calendrier -->
            <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 class="text-lg font-semibold text-gray-900">
                    {{ formatMonthTitle(currentMonth) }}
                </h2>

                <div class="flex items-center gap-2">
                    <button type="button"
                        class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        aria-label="Mois précédent" @click="goToPreviousMonth">
                        ←
                    </button>

                    <button type="button"
                        class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        @click="goToToday">
                        Aujourd’hui
                    </button>

                    <button type="button"
                        class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        aria-label="Mois suivant" @click="goToNextMonth">
                        →
                    </button>
                </div>
            </div>

            <!-- Chargement -->
            <div v-if="loading" class="py-12 text-center text-sm text-gray-500">
                Chargement...
            </div>

            <!-- Erreur -->
            <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Impossible de charger le calendrier : {{ error }}
            </div>

            <!-- Calendrier -->
            <div v-else class="grid min-h-0 flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                <!-- Grille calendrier -->
                <section class="rounded-3xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
                    <!-- Jours de la semaine -->
                    <div
                        class="mb-3 grid grid-cols-7 gap-1.5 text-center text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:mb-4 sm:gap-2 sm:text-xs">
                        <span>Lun</span>
                        <span>Mar</span>
                        <span>Mer</span>
                        <span>Jeu</span>
                        <span>Ven</span>
                        <span>Sam</span>
                        <span>Dim</span>
                    </div>

                    <!-- Jours -->
                    <div class="grid grid-cols-7 gap-1.5 sm:gap-2">
                        <button v-for="day in visibleMonthDays" :key="day.key" type="button"
                            class="group flex min-h-24 flex-col rounded-2xl border p-1.5 text-left transition sm:min-h-32 sm:p-2 lg:min-h-36"
                            :class="[
                                day.isCurrentMonth
                                    ? 'bg-white'
                                    : 'bg-gray-50 text-gray-400',
                                day.isToday
                                    ? 'border-blue-400 ring-2 ring-blue-100'
                                    : 'border-gray-200',
                                day.isSelected
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'hover:border-blue-300 hover:bg-blue-50/40',
                            ]" @click="selectDate(day.key)">
                            <!-- En-tête du jour -->
                            <div class="mb-1.5 flex items-center justify-between gap-1 sm:mb-2 sm:gap-2">
                                <span class="text-xs font-semibold sm:text-sm" :class="day.isToday
                                        ? 'text-blue-700'
                                        : 'text-gray-900'
                                    ">
                                    {{ formatDayLabel(day.date) }}
                                </span>

                                <span v-if="day.items.length"
                                    class="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1.5 text-[10px] font-semibold text-white sm:h-6 sm:min-w-6 sm:px-2 sm:text-xs">
                                    {{ day.items.length }}
                                </span>
                            </div>

                            <!-- Livrables du jour -->
                            <div class="space-y-1.5 overflow-hidden sm:space-y-2">
                                <article v-for="deliverable in day.items.slice(0, 3)" :key="deliverable.id"
                                    class="rounded-xl border border-gray-200 bg-gray-50 p-1.5 sm:p-2">
                                    <p class="truncate text-[10px] font-semibold text-gray-900 sm:text-xs">
                                        {{
                                            collaborationById.get(
                                                deliverable.collaboration_id,
                                            )?.brand_name ?? 'Marque inconnue'
                                        }}
                                    </p>

                                    <p class="truncate text-[10px] text-gray-500 sm:text-xs">
                                        {{
                                            collaborationById.get(
                                                deliverable.collaboration_id,
                                            )?.title ?? 'Collaboration'
                                        }}
                                    </p>
                                </article>

                                <p v-if="day.items.length > 3" class="text-[10px] text-gray-500 sm:text-xs">
                                    + {{ day.items.length - 3 }} autre(s)
                                </p>
                            </div>
                        </button>
                    </div>
                </section>

                <!-- Sidebar desktop -->
                <aside class="flex min-h-0 flex-col gap-4">
                    <!-- Jour sélectionné -->
                    <section class="hidden rounded-3xl border border-gray-200 bg-white p-4 shadow-sm xl:block">
                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <p class="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Jour sélectionné
                                </p>

                                <h3 class="text-lg font-semibold text-gray-900">
                                    {{
                                        formatReadableDate(
                                            selectedDateKey,
                                        )
                                    }}
                                </h3>
                            </div>

                            <span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                {{ selectedDayDeliverables.length }}
                                échéance(s)
                            </span>
                        </div>

                        <div v-if="selectedDayDeliverables.length === 0"
                            class="mt-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
                            Rien prévu ce jour-là.
                        </div>

                        <div v-else class="mt-4 space-y-3">
                            <NuxtLink v-for="deliverable in selectedDayDeliverables" :key="deliverable.id"
                                :to="`/collaborations/${deliverable.collaboration_id}`"
                                class="block rounded-2xl border border-gray-200 bg-gray-50 p-3 transition hover:border-blue-300 hover:bg-blue-50/40">
                                <div class="flex items-start justify-between gap-3">
                                    <div class="min-w-0 flex-1">
                                        <p class="truncate text-sm font-semibold text-gray-900">
                                            {{
                                                collaborationById.get(
                                                    deliverable.collaboration_id,
                                                )?.brand_name ??
                                                'Marque inconnue'
                                            }}
                                        </p>

                                        <p class="truncate text-sm text-gray-500">
                                            {{
                                                collaborationById.get(
                                                    deliverable.collaboration_id,
                                                )?.title ??
                                                'Collaboration'
                                            }}
                                        </p>
                                    </div>

                                    <CollaborationsStatusBadge :status="deliverable.status"
                                        :is-late="isLate(deliverable)" />
                                </div>

                                <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                    <span class="rounded-full bg-white px-2.5 py-1 font-medium text-gray-700">
                                        {{
                                            DELIVERABLE_TYPE_LABELS[
                                            deliverable.type
                                            ]
                                        }}
                                    </span>

                                    <span class="rounded-full bg-white px-2.5 py-1 font-medium text-gray-700">
                                        {{
                                            PLATFORM_LABELS[
                                            deliverable.platform
                                            ]
                                        }}
                                    </span>
                                </div>
                            </NuxtLink>
                        </div>
                    </section>

                    <!-- Livrables en retard -->
                    <section class="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <p class="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    En retard
                                </p>

                                <h3 class="text-lg font-semibold text-gray-900">
                                    À rattraper
                                </h3>
                            </div>

                            <span class="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                                {{ overdueDeliverables.length }}
                            </span>
                        </div>

                        <div v-if="overdueDeliverables.length === 0" class="mt-4 text-sm text-gray-500">
                            Aucun livrable en retard.
                        </div>

                        <div v-else class="mt-4 space-y-2">
                            <NuxtLink v-for="deliverable in overdueDeliverables.slice(
                                0,
                                4,
                            )" :key="deliverable.id" :to="`/collaborations/${deliverable.collaboration_id}`"
                                class="block rounded-2xl border border-red-100 bg-red-50 p-3 transition hover:border-red-300">
                                <p class="text-sm font-semibold text-gray-900">
                                    {{
                                        collaborationById.get(
                                            deliverable.collaboration_id,
                                        )?.brand_name ?? 'Marque inconnue'
                                    }}
                                </p>

                                <p class="text-sm text-gray-600">
                                    {{
                                        collaborationById.get(
                                            deliverable.collaboration_id,
                                        )?.title ?? 'Collaboration'
                                    }}
                                </p>

                                <p class="mt-1 text-xs text-red-700">
                                    Échéance dépassée le
                                    {{
                                        formatReadableDate(
                                            deliverable.deadline_date ?? '',
                                        )
                                    }}
                                </p>
                            </NuxtLink>
                        </div>
                    </section>
                </aside>
            </div>

            <!-- Vue jour mobile -->
            <div v-if="isMobileDayModalOpen" class="fixed inset-0 z-50 flex items-end bg-black/40 xl:hidden"
                @click.self="closeMobileDayModal">
                <div class="max-h-[80vh] w-full overflow-y-auto rounded-t-3xl bg-white p-4 shadow-xl">
                    <div class="mb-3 flex items-center justify-between gap-3">
                        <div>
                            <p class="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Jour sélectionné
                            </p>

                            <h3 class="text-lg font-semibold text-gray-900">
                                {{
                                    formatReadableDate(
                                        selectedDateKey,
                                    )
                                }}
                            </h3>
                        </div>

                        <button type="button"
                            class="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200"
                            @click="closeMobileDayModal">
                            Fermer
                        </button>
                    </div>

                    <div v-if="selectedDayDeliverables.length === 0"
                        class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
                        Rien prévu ce jour-là.
                    </div>

                    <div v-else class="space-y-3">
                        <NuxtLink v-for="deliverable in selectedDayDeliverables" :key="deliverable.id"
                            :to="`/collaborations/${deliverable.collaboration_id}`"
                            class="block rounded-2xl border border-gray-200 bg-gray-50 p-3"
                            @click="closeMobileDayModal">
                            <div class="flex items-start justify-between gap-3">
                                <div class="min-w-0 flex-1">
                                    <p class="truncate text-sm font-semibold text-gray-900">
                                        {{
                                            collaborationById.get(
                                                deliverable.collaboration_id,
                                            )?.brand_name ??
                                            'Marque inconnue'
                                        }}
                                    </p>

                                    <p class="truncate text-sm text-gray-500">
                                        {{
                                            collaborationById.get(
                                                deliverable.collaboration_id,
                                            )?.title ??
                                            'Collaboration'
                                        }}
                                    </p>
                                </div>

                                <CollaborationsStatusBadge :status="deliverable.status"
                                    :is-late="isLate(deliverable)" />
                            </div>

                            <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                <span class="rounded-full bg-white px-2.5 py-1 font-medium text-gray-700">
                                    {{
                                        DELIVERABLE_TYPE_LABELS[
                                        deliverable.type
                                        ]
                                    }}
                                </span>

                                <span class="rounded-full bg-white px-2.5 py-1 font-medium text-gray-700">
                                    {{
                                        PLATFORM_LABELS[
                                        deliverable.platform
                                        ]
                                    }}
                                </span>
                            </div>
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>