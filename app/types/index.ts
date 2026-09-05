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
export const PLATFORMS = ['instagram', 'tiktok', 'youtube', 'ugc', 'other'] as const

export type DeliverableType = (typeof DELIVERABLE_TYPES)[number]
export type Platform = (typeof PLATFORMS)[number]

export const DELIVERABLE_TYPE_LABELS: Record<DeliverableType, string> = {
  reel: 'Reel',
  story: 'Story',
  post: 'Post',
  video: 'Vidéo',
  other: 'Autre',
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  ugc: 'UGC',
  other: 'Autre',
}

export type Brand = {
  id: string
  user_id: string
  name: string
  created_at: string
}

export type CreateCollaborationInput = {
  brandName: string
  title: string
  deadlineDate?: string | null
  notes?: string
}

export type UpdateCollaborationInput = {
  id: string
  title: string
  notes?: string
  deadlineDate?: string | null
}

export type CreateDeliverableInput = {
  collaborationId: string
  type: DeliverableType
  platform: Platform
  deadlineDate?: string | null
}

export type CollaborationWithStatus = {
  id: string
  user_id: string
  brand_id: string | null
  title: string
  notes: string | null
  deadline_date: string | null
  created_at: string
  updated_at: string
  computed_status: CollaborationStatus | null
  is_late: boolean
  brand_name: string | null
}

export type Deliverable = {
  id: string
  collaboration_id: string
  type: DeliverableType
  platform: Platform
  status: CollaborationStatus
  deadline_date: string | null
  publish_date: string | null
  created_at: string
  updated_at: string
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
