import type { CollaborationWithStatus, CreateCollaborationInput } from '~/types'

export function useCollaborations() {
  const supabase = useSupabaseClient()
  const { findOrCreateBrand } = useBrands()
  const { createDeliverable } = useDeliverables()

  const collaborations = ref<CollaborationWithStatus[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const saving = ref(false)

  async function fetchCollaborations() {
    loading.value = true
    error.value = null

    const { data, error: fetchError } = await supabase
      .from('collaborations_with_status')
      .select('*')
      .order('created_at', { ascending: false })

    loading.value = false

    if (fetchError) {
      error.value = fetchError.message
      return
    }

    const rows = (data ?? []) as CollaborationWithStatus[]
    const brandIds = [...new Set(rows.map((collaboration) => collaboration.brand_id).filter(Boolean))]

    if (brandIds.length === 0) {
      collaborations.value = rows
      return
    }

    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id, name')
      .in('id', brandIds as string[])

    if (brandsError) {
      error.value = brandsError.message
      return
    }

    const brandNameById = new Map((brands ?? []).map((brand) => [brand.id, brand.name]))

    collaborations.value = rows.map((collaboration) => ({
      ...collaboration,
      brand_name: collaboration.brand_id ? brandNameById.get(collaboration.brand_id) ?? null : null,
    }))
  }

  async function createCollaboration(
    input: CreateCollaborationInput
  ): Promise<{ collaborationId: string | null; error: string | null }> {
    saving.value = true

    const { data: authData, error: authError } = await supabase.auth.getUser()
    const userId = authData.user?.id ?? null

    if (authError || !userId) {
      saving.value = false
      return { collaborationId: null, error: 'Utilisateur non connecté.' }
    }

    const { data: brand, error: brandError } = await findOrCreateBrand(input.brandName)
    if (brandError || !brand) {
      saving.value = false
      return { collaborationId: null, error: brandError ?? 'Marque introuvable.' }
    }

    const { data: collaboration, error: collaborationError } = await supabase
      .from('collaborations')
      .insert({
        brand_id: brand.id,
        title: input.title.trim(),
        notes: input.notes?.trim() || null,
        user_id: userId,
      })
      .select('id')
      .single()

    if (collaborationError || !collaboration) {
      saving.value = false
      return {
        collaborationId: null,
        error: collaborationError?.message ?? 'Création impossible.',
      }
    }

    const { error: deliverableError } = await createDeliverable({
      collaborationId: collaboration.id,
      type: input.deliverableType,
      platform: input.deliverablePlatform,
    })

    saving.value = false

    if (deliverableError) {
      return { collaborationId: null, error: deliverableError }
    }

    return { collaborationId: collaboration.id, error: null }
  }

  return {
    collaborations,
    loading,
    error,
    saving,
    fetchCollaborations,
    createCollaboration,
  }
}
