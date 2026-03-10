import db from '@/lib/db'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ShootForm from '@/components/admin/ShootForm'
import type { Shoot, ShootImage } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: { id: string }
}

export default function EditShootPage({ params }: Props) {
  const shoot = db.prepare('SELECT * FROM shoots WHERE id = ?').get(params.id) as Shoot | undefined

  if (!shoot) notFound()

  const images = db
    .prepare('SELECT * FROM images WHERE shoot_id = ? ORDER BY sort_order ASC')
    .all(params.id) as ShootImage[]

  return (
    <div className="px-6 md:px-10 py-12">
      <div className="mb-10">
        <Link
          href="/admin/dashboard"
          className="text-[11px] tracking-widest uppercase text-black/30 hover:text-black transition-colors duration-150"
        >
          Back to Shoots
        </Link>
        <div className="flex items-center justify-between mt-6">
          <h1 className="text-[11px] tracking-[0.2em] uppercase text-black/40">
            Edit Shoot
          </h1>
          <Link
            href={`/work/${shoot.slug}`}
            target="_blank"
            className="text-[11px] tracking-widest uppercase text-black/30 hover:text-black transition-colors duration-150"
          >
            View
          </Link>
        </div>
      </div>

      <ShootForm mode="edit" shoot={shoot} initialImages={images} />
    </div>
  )
}
