export interface Shoot {
  id: number
  name: string
  slug: string
  category: 'personal' | 'collabs'
  description: string | null
  created_at: string
}

export interface ShootImage {
  id: number
  shoot_id: number
  filename: string
  cloudinary_url: string | null
  blur_data_url: string | null
  is_thumbnail: boolean | number
  dominant_hue: number | null
  sort_order: number
  width: number | null
  height: number | null
}

export interface ShootWithThumbnail extends Shoot {
  thumbnail_url: string | null
  thumbnail_blur: string | null
  dominant_hue: number | null
}

export interface ShootWithImages extends Shoot {
  images: ShootImage[]
}

export interface Thumbnail {
  shoot_id: number
  slug: string
  cloudinary_url: string
  blur_data_url: string | null
  dominant_hue: number | null
}

export interface SiteInfo {
  name: string
  bio: string
  email: string
  instagram: string
  location: string
}
