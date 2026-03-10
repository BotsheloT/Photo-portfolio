import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { deleteFromCloudinary } from '@/lib/cloudinary'
import { cookies } from 'next/headers'

async function requireAdmin(): Promise<boolean> {
  const token = cookies().get('admin_session')?.value
  if (!token) return false
  return verifyToken(token)
}

// GET /api/shoots/[id] — returns shoot + all images (used by admin edit form)
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const shoot = db.prepare('SELECT * FROM shoots WHERE id = ?').get(params.id)
  if (!shoot) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const images = db
    .prepare('SELECT * FROM images WHERE shoot_id = ? ORDER BY sort_order ASC')
    .all(params.id)

  return NextResponse.json({ ...shoot, images })
}

// PUT /api/shoots/[id] — update shoot metadata (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, category, description } = body

  if (!name || !category) {
    return NextResponse.json({ error: 'name and category are required' }, { status: 400 })
  }
  if (!['personal', 'collabs'].includes(category)) {
    return NextResponse.json({ error: 'invalid category' }, { status: 400 })
  }

  db.prepare('UPDATE shoots SET name = ?, category = ?, description = ? WHERE id = ?').run(
    name,
    category,
    description ?? null,
    params.id
  )

  const shoot = db.prepare('SELECT * FROM shoots WHERE id = ?').get(params.id)
  return NextResponse.json(shoot)
}

// DELETE /api/shoots/[id] — delete shoot + all images (admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const images = db
    .prepare('SELECT filename FROM images WHERE shoot_id = ?')
    .all(params.id) as { filename: string }[]

  // Delete from Cloudinary
  await Promise.allSettled(images.map((img) => deleteFromCloudinary(img.filename)))

  // Delete from DB (CASCADE removes images)
  db.prepare('DELETE FROM shoots WHERE id = ?').run(params.id)

  return NextResponse.json({ ok: true })
}
