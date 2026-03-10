import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { deleteFromCloudinary } from '@/lib/cloudinary'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

async function requireAdmin(): Promise<boolean> {
  const token = cookies().get('admin_session')?.value
  if (!token) return false
  return verifyToken(token)
}

// PUT /api/images/[id] — update is_thumbnail flag (admin only)
// Body: { isThumbnail: boolean }
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const image = db.prepare('SELECT * FROM images WHERE id = ?').get(params.id) as
    | { id: number; shoot_id: number }
    | undefined

  if (!image) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()

  if (typeof body.isThumbnail === 'boolean') {
    if (body.isThumbnail) {
      // Clear existing thumbnail for this shoot, then set new one
      db.prepare('UPDATE images SET is_thumbnail = 0 WHERE shoot_id = ?').run(image.shoot_id)
    }
    db.prepare('UPDATE images SET is_thumbnail = ? WHERE id = ?').run(
      body.isThumbnail ? 1 : 0,
      params.id
    )
  }

  const updated = db.prepare('SELECT * FROM images WHERE id = ?').get(params.id)
  return NextResponse.json(updated)
}

// DELETE /api/images/[id] — remove image (admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const image = db.prepare('SELECT * FROM images WHERE id = ?').get(params.id) as
    | { id: number; filename: string; is_thumbnail: number; shoot_id: number }
    | undefined

  if (!image) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Delete from Cloudinary
  await deleteFromCloudinary(image.filename).catch(() => null)

  db.prepare('DELETE FROM images WHERE id = ?').run(params.id)

  // If this was the thumbnail, promote the next image
  if (image.is_thumbnail) {
    const next = db
      .prepare('SELECT id FROM images WHERE shoot_id = ? ORDER BY sort_order ASC LIMIT 1')
      .get(image.shoot_id) as { id: number } | undefined

    if (next) {
      db.prepare('UPDATE images SET is_thumbnail = 1 WHERE id = ?').run(next.id)
    }
  }

  return NextResponse.json({ ok: true })
}
