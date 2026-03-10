import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

// GET /api/info — returns the info page content (public)
export async function GET() {
  const row = db
    .prepare('SELECT value FROM site_content WHERE key = ?')
    .get('info') as { value: string } | undefined

  if (!row) return NextResponse.json({})

  return NextResponse.json(JSON.parse(row.value))
}

// PUT /api/info — update info page content (admin only)
export async function PUT(request: NextRequest) {
  const token = cookies().get('admin_session')?.value
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const value = JSON.stringify(body)

  db.prepare(
    'INSERT INTO site_content (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run('info', value)

  return NextResponse.json(body)
}
