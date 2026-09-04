export const COLLABORATION_STATUSES = [
  'to_contact',
  'validated',
  'product_received',
  'to_create',
  'to_validate',
  'scheduled',
  'published',
] as const

export type CollaborationStatus = (typeof COLLABORATION_STATUSES)[number]

export const DELIVERABLE_TYPES = ['reel', 'story', 'post', 'video', 'other'] as const
export const PLATFORMS = ['instagram', 'tiktok', 'youtube', 'other'] as const

export type DeliverableType = (typeof DELIVERABLE_TYPES)[number]
export type Platform = (typeof PLATFORMS)[number]

export type Brand = {
  id: string
  user_id: string
  name: string
  created_at: string
}

export type CreateCollaborationInput = {
  brandName: string
  title: string
  deliverableType: DeliverableType
  deliverablePlatform: Platform
  notes?: string
}

export type CollaborationWithStatus = {
  id: string
  user_id: string
  brand_id: string | null
  title: string
  notes: string | null
  created_at: string
  updated_at: string
  computed_status: CollaborationStatus | null
  is_late: boolean
  brand_name: string | null
}

export const STATUS_LABELS: Record<CollaborationStatus, string> = {
  to_contact: 'À contacter',
  validated: 'Validée',
  product_received: 'Produit reçu',
  to_create: 'À créer',
  to_validate: 'À valider',
  scheduled: 'Programmée',
  published: 'Publiée',
}
