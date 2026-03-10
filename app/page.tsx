import db from '@/lib/db'
import HomeGrid from '@/components/HomeGrid'
import type { Thumbnail } from '@/types'

const LIMIT = 20

export const revalidate = 60

export default function HomePage() {
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
       LIMIT ? OFFSET 0`
    )
    .all(LIMIT) as Thumbnail[]

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

  const hasMore = rows.length < total

  return (
    <div className="pt-[60px]">
      {rows.length === 0 ? (
        <div className="flex items-center justify-center h-screen">
          <p className="text-[11px] tracking-widest uppercase text-black/30">No work yet</p>
        </div>
      ) : (
        <HomeGrid initialThumbnails={rows} initialHasMore={hasMore} />
      )}
    </div>
  )
}
