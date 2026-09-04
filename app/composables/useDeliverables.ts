import type { Deliverable, DeliverableType, Platform } from '~/types'
import type { CollaborationStatus } from '~/types'

export function useDeliverables() {
  const supabase = useSupabaseClient()

  async function fetchDeliverables(): Promise<{ data: Deliverable[]; error: string | null }> {
    const { data, error } = await supabase
      .from('deliverables')
      .select('*')
      .order('deadline_date', { ascending: true, nullsFirst: false })

    if (error) {
      return { data: [], error: error.message }
    }

    return { data: (data ?? []) as Deliverable[], error: null }
  }

  async function fetchDeliverablesByCollaborationId(
    collaborationId: string
  ): Promise<{ data: Deliverable[]; error: string | null }> {
    const { data, error } = await supabase
      .from('deliverables')
      .select('*')
      .eq('collaboration_id', collaborationId)
      .order('created_at', { ascending: true })

    if (error) {
      return { data: [], error: error.message }
    }

    return { data: (data ?? []) as Deliverable[], error: null }
  }

  async function createDeliverable(input: {
    collaborationId: string
    type: DeliverableType
    platform: Platform
  }): Promise<{ error: string | null }> {
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return { error: 'Utilisateur non connecté.' }
    }

    const { error: createError } = await supabase.from('deliverables').insert({
      collaboration_id: input.collaborationId,
      type: input.type,
      platform: input.platform,
      status: 'to_contact',
    })

    if (createError) {
      return { error: createError.message }
    }

    return { error: null }
  }

  async function updateDeliverablesStatusByCollaborationId(input: {
    collaborationId: string
    status: CollaborationStatus
  }): Promise<{ updatedCount: number; error: string | null }> {
    const { data, error } = await supabase
      .from('deliverables')
      .update({ status: input.status })
      .eq('collaboration_id', input.collaborationId)
      .select('id')

    if (error) {
      return { updatedCount: 0, error: error.message }
    }

    return { updatedCount: data?.length ?? 0, error: null }
  }

  async function updateDeliverableDeadlineById(input: {
    deliverableId: string
    deadlineDate: string | null
  }): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('deliverables')
      .update({ deadline_date: input.deadlineDate })
      .eq('id', input.deliverableId)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  }

  return {
    fetchDeliverables,
    fetchDeliverablesByCollaborationId,
    createDeliverable,
    updateDeliverablesStatusByCollaborationId,
    updateDeliverableDeadlineById,
  }
}
