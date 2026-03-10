import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { uniqueSlug } from '@/lib/slugify'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

// GET /api/shoots
// Query params:
//   page (default 1), limit (default 20) — for the colour-sorted home page thumbnail feed
//   category=personal|collabs           — for category page lists (returns shoot cards, not hue-sorted)
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const category = searchParams.get('category')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(40, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
  const offset = (page - 1) * limit

  if (category) {
    // Category page: return shoots with thumbnail, sorted by creation date
    const rows = db
      .prepare(
        `SELECT
           s.id, s.name, s.slug, s.category, s.description, s.created_at,
           i.cloudinary_url AS thumbnail_url,
           i.blur_data_url  AS thumbnail_blur,
           i.dominant_hue
         FROM shoots s
         LEFT JOIN images i ON i.shoot_id = s.id AND i.is_thumbnail = 1
         WHERE s.category = ?
         ORDER BY s.created_at DESC`
      )
      .all(category)

    return NextResponse.json({ shoots: rows })
  }

  // Home page: return thumbnails sorted by dominant_hue (colour wheel)
  const rows = db
    .prepare(
      `SELECT
         s.id   AS shoot_id,
         s.slug,
         i.cloudinary_url,
         i.blur_data_url,
         i.dominant_hue
       FROM shoots s
       JOIN images i ON i.shoot_id = s.id AND i.is_thumbnail = 1
       WHERE i.cloudinary_url IS NOT NULL
       ORDER BY
         CASE WHEN i.dominant_hue IS NULL THEN 1 ELSE 0 END,
         i.dominant_hue ASC
       LIMIT ? OFFSET ?`
    )
    .all(limit, offset)

  const total = (
    db
      .prepare(
        `SELECT COUNT(*) AS n
         FROM shoots s
         JOIN images i ON i.shoot_id = s.id AND i.is_thumbnail = 1
         WHERE i.cloudinary_url IS NOT NULL`
      )
      .get() as { n: number }
  ).n

  return NextResponse.json({
    thumbnails: rows,
    total,
    hasMore: offset + rows.length < total,
  })
}

// POST /api/shoots — create a new shoot (admin only)
export async function POST(request: NextRequest) {
  const token = cookies().get('admin_session')?.value
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, category, description } = body

  if (!name || !category) {
    return NextResponse.json({ error: 'name and category are required' }, { status: 400 })
  }
  if (!['personal', 'collabs'].includes(category)) {
    return NextResponse.json({ error: 'category must be personal or collabs' }, { status: 400 })
  }

  const slug = uniqueSlug(name)

  const result = db
    .prepare(
      'INSERT INTO shoots (name, slug, category, description) VALUES (?, ?, ?, ?)'
    )
    .run(name, slug, category, description ?? null)

  const shoot = db.prepare('SELECT * FROM shoots WHERE id = ?').get(result.lastInsertRowid)

  return NextResponse.json(shoot, { status: 201 })
}
