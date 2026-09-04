import type { DeliverableType, Platform } from '~/types'

export function useDeliverables() {
  const supabase = useSupabaseClient()

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

  return {
    createDeliverable,
  }
}
