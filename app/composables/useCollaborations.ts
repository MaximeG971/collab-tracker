import type { CollaborationWithStatus, CreateCollaborationInput } from '~/types'

export function useCollaborations() {
  const supabase = useSupabaseClient()
  const { findOrCreateBrand } = useBrands()
  const { createDeliverable } = useDeliverables()

  const collaborations = ref<CollaborationWithStatus[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const saving = ref(false)

  async function enrichCollaborationsWithBrands(rows: CollaborationWithStatus[]) {
    const brandIds = [...new Set(rows.map((collaboration) => collaboration.brand_id).filter(Boolean))]

    if (brandIds.length === 0) {
      return rows
    }

    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id, name')
      .in('id', brandIds as string[])

    if (brandsError) {
      throw new Error(brandsError.message)
    }

    const brandNameById = new Map((brands ?? []).map((brand) => [brand.id, brand.name]))

    return rows.map((collaboration) => ({
      ...collaboration,
      brand_name: collaboration.brand_id ? brandNameById.get(collaboration.brand_id) ?? null : null,
    }))
  }

  async function fetchCollaborations(): Promise<{ data: CollaborationWithStatus[]; error: string | null }> {
    loading.value = true
    error.value = null

    const { data, error: fetchError } = await supabase
      .from('collaborations_with_status')
      .select('*')
      .order('created_at', { ascending: false })

    loading.value = false

    if (fetchError) {
      error.value = fetchError.message
      loading.value = false
      return { data: [], error: fetchError.message }
    }

    try {
      const rows = await enrichCollaborationsWithBrands((data ?? []) as CollaborationWithStatus[])
      collaborations.value = rows
      loading.value = false
      return { data: rows, error: null }
    } catch (enrichError) {
      error.value = enrichError instanceof Error ? enrichError.message : 'Impossible de charger les marques.'
      loading.value = false
      return { data: [], error: error.value }
    }
  }

  async function fetchCollaborationById(
    collaborationId: string
  ): Promise<{ data: CollaborationWithStatus | null; error: string | null }> {
    const { data, error: fetchError } = await supabase
      .from('collaborations_with_status')
      .select('*')
      .eq('id', collaborationId)
      .maybeSingle()

    if (fetchError) {
      return { data: null, error: fetchError.message }
    }

    if (!data) {
      return { data: null, error: null }
    }

    try {
      const rows = await enrichCollaborationsWithBrands([data as CollaborationWithStatus])
      return { data: rows[0] ?? null, error: null }
    } catch (enrichError) {
      return {
        data: null,
        error: enrichError instanceof Error ? enrichError.message : 'Impossible de charger la collaboration.',
      }
    }
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
    fetchCollaborationById,
    createCollaboration,
  }
}
