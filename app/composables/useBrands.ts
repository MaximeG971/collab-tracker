import type { Brand } from '~/types'

export function useBrands() {
  const supabase = useSupabaseClient()

  const brands = ref<Brand[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function getAuthenticatedUserId() {
    const { data, error: authError } = await supabase.auth.getUser()

    if (authError || !data.user) {
      return { userId: null, error: authError?.message ?? 'Utilisateur non connecté.' }
    }

    return { userId: data.user.id, error: null }
  }

  async function fetchBrands() {
    loading.value = true
    error.value = null

    const { data, error: fetchError } = await supabase
      .from('brands')
      .select('*')
      .order('name')

    loading.value = false

    if (fetchError) {
      error.value = fetchError.message
      return
    }

    brands.value = (data ?? []) as Brand[]
  }

  async function findOrCreateBrand(name: string): Promise<{ data: Brand | null; error: string | null }> {
    const trimmedName = name.trim()
    if (!trimmedName) {
      return { data: null, error: 'Le nom de la marque est requis.' }
    }

    const { userId, error: authError } = await getAuthenticatedUserId()
    if (!userId) {
      return { data: null, error: authError }
    }

    const { data: existing, error: findError } = await supabase
      .from('brands')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', trimmedName)
      .maybeSingle()

    if (findError) {
      return { data: null, error: findError.message }
    }

    if (existing) {
      return { data: existing as Brand, error: null }
    }

    const { data, error: createError } = await supabase
      .from('brands')
      .insert({
        name: trimmedName,
        user_id: userId,
      })
      .select('*')
      .single()

    if (createError) {
      return { data: null, error: createError.message }
    }

    return { data: data as Brand, error: null }
  }

  return {
    brands,
    loading,
    error,
    fetchBrands,
    findOrCreateBrand,
  }
}
