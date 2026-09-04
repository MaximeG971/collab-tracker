<script setup lang="ts">
import type { Deliverable } from '~/types'
import { DELIVERABLE_TYPE_LABELS, PLATFORM_LABELS } from '~/types'
import { ref, watch } from 'vue'

const props = defineProps<{
  deliverable: Deliverable
}>()

const { updateDeliverableDeadlineById } = useDeliverables()

const deadlineValue = ref(toInputDateValue(props.deliverable.deadline_date))
const saving = ref(false)
const message = ref<string | null>(null)

function formatDisplayDate(value: string | null) {
	if (!value) {
		return 'Pas d\'échéance'
	}

	const [year, month, day] = value.split('-').map(Number)
	const parsedDate = new Date(year, month - 1, day)

	return new Intl.DateTimeFormat('fr-FR', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
	}).format(parsedDate)
}

function toInputDateValue(value: string | null) {
	return value ? value.slice(0, 10) : ''
}

watch(
  () => props.deliverable.deadline_date,
  (value) => {
    deadlineValue.value = toInputDateValue(value)
  }
)

async function saveDeadline() {
	saving.value = true
	message.value = null

	const { error } = await updateDeliverableDeadlineById({
		deliverableId: props.deliverable.id,
		deadlineDate: deadlineValue.value || null,
	})

	saving.value = false

	if (error) {
		message.value = error
		return
	}

	message.value = 'Échéance enregistrée.'
}
</script>

<template>
	<article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
		<div class="flex items-start justify-between gap-3">
			<div class="min-w-0 flex-1">
				<p class="text-sm font-semibold text-gray-900">
					{{ DELIVERABLE_TYPE_LABELS[deliverable.type] }}
				</p>
				<p class="mt-1 text-sm text-gray-500">
					{{ PLATFORM_LABELS[deliverable.platform] }}
					<span> · {{ formatDisplayDate(deliverable.deadline_date) }}</span>
				</p>
				<div class="mt-3">
					<label class="block text-xs font-medium uppercase tracking-wide text-gray-500">Échéance</label>
					<div class="mt-1 flex items-center gap-2">
						<input
							v-model="deadlineValue"
							type="date"
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
						/>
						<button
							type="button"
							class="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
							:disabled="saving"
							@click="saveDeadline"
						>
							{{ saving ? '...' : 'OK' }}
						</button>
					</div>
					<p v-if="message" class="mt-1 text-xs text-gray-500">
						{{ message }}
					</p>
				</div>
			</div>
			<CollaborationsStatusBadge :status="deliverable.status" />
		</div>
	</article>
</template>
