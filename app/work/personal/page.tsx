import db from '@/lib/db'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { ShootWithThumbnail } from '@/types'

export const metadata: Metadata = {
  title: 'Personal — Botshelo',
}

export const revalidate = 60

export default function PersonalPage() {
  const shoots = db
    .prepare(
      `SELECT
         s.id, s.name, s.slug, s.category, s.description, s.created_at,
         i.cloudinary_url AS thumbnail_url,
         i.blur_data_url  AS thumbnail_blur
       FROM shoots s
       LEFT JOIN images i ON i.shoot_id = s.id AND i.is_thumbnail = 1
       WHERE s.category = 'personal'
       ORDER BY s.created_at DESC`
    )
    .all() as ShootWithThumbnail[]

  return (
    <div className="pt-[60px] px-6 md:px-10 py-16">
      <h1 className="text-[11px] tracking-[0.2em] uppercase mb-12 text-black/40">Personal</h1>

      {shoots.length === 0 ? (
        <p className="text-[11px] tracking-widest uppercase text-black/30">No shoots yet</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {shoots.map((shoot) => (
            <Link key={shoot.id} href={`/work/${shoot.slug}`} className="group block">
              <div className="relative aspect-[2/3] overflow-hidden bg-neutral-100 mb-3">
                {shoot.thumbnail_url && (
                  <Image
                    src={shoot.thumbnail_url}
                    alt={shoot.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover opacity-0 transition-opacity duration-700"
                    placeholder={shoot.thumbnail_blur ? 'blur' : 'empty'}
                    blurDataURL={shoot.thumbnail_blur ?? undefined}
                    onLoad={(e) => {
                      ;(e.target as HTMLImageElement).style.opacity = '1'
                    }}
                  />
                )}
              </div>
              <p className="text-xs tracking-wide group-hover:text-accent transition-colors duration-150">
                {shoot.name}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
