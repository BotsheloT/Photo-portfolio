import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

// PATCH /api/images/reorder
// Body: { imageIds: number[] } — ordered list of image IDs (index = new sort_order)
export async function PATCH(request: NextRequest) {
  const token = cookies().get('admin_session')?.value
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { imageIds } = (await request.json()) as { imageIds: number[] }

  if (!Array.isArray(imageIds)) {
    return NextResponse.json({ error: 'imageIds must be an array' }, { status: 400 })
  }

  const update = db.prepare('UPDATE images SET sort_order = ? WHERE id = ?')
  const updateMany = db.transaction((ids: number[]) => {
    ids.forEach((id, index) => update.run(index, id))
  })

  updateMany(imageIds)

  return NextResponse.json({ ok: true })
}
