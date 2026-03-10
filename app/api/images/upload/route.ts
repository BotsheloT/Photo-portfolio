import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { uploadToCloudinary } from '@/lib/cloudinary'
import {
  extractDominantHue,
  generateBlurDataUrl,
  getImageDimensions,
} from '@/lib/colours'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
// Allow large image uploads
export const maxDuration = 60

// POST /api/images/upload
// Body: FormData with fields:
//   file     — the image file
//   shootId  — the shoot to attach to
export async function POST(request: NextRequest) {
  const token = cookies().get('admin_session')?.value
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const shootId = formData.get('shootId') as string | null

  if (!file || !shootId) {
    return NextResponse.json({ error: 'file and shootId are required' }, { status: 400 })
  }

  const shoot = db.prepare('SELECT * FROM shoots WHERE id = ?').get(shootId)
  if (!shoot) {
    return NextResponse.json({ error: 'Shoot not found' }, { status: 404 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // Determine current max sort_order for this shoot
  const maxOrder = (
    db
      .prepare('SELECT MAX(sort_order) AS m FROM images WHERE shoot_id = ?')
      .get(shootId) as { m: number | null }
  ).m ?? -1

  // Extract metadata in parallel
  const [dominantHue, blurDataUrl, dimensions] = await Promise.all([
    extractDominantHue(buffer),
    generateBlurDataUrl(buffer),
    getImageDimensions(buffer),
  ])

  // Build a unique public_id for Cloudinary
  const sanitizedName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/gi, '-')
  const publicId = `${shootId}-${sanitizedName}-${Date.now()}`

  const { url, publicId: storedPublicId } = await uploadToCloudinary(buffer, publicId)

  // If this is the first image for the shoot, mark it as thumbnail
  const existingImages = db
    .prepare('SELECT id FROM images WHERE shoot_id = ?')
    .all(shootId) as { id: number }[]
  const isThumbnail = existingImages.length === 0 ? 1 : 0

  const result = db
    .prepare(
      `INSERT INTO images
         (shoot_id, filename, cloudinary_url, blur_data_url, is_thumbnail, dominant_hue, sort_order, width, height)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      parseInt(shootId),
      storedPublicId,
      url,
      blurDataUrl,
      isThumbnail,
      dominantHue,
      maxOrder + 1,
      dimensions.width,
      dimensions.height
    )

  const image = db.prepare('SELECT * FROM images WHERE id = ?').get(result.lastInsertRowid)

  return NextResponse.json(image, { status: 201 })
}
