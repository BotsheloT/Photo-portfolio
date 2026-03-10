import db from '@/lib/db'
import Link from 'next/link'
import type { Shoot } from '@/types'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const shoots = db
    .prepare(
      `SELECT
         s.*,
         COUNT(i.id) AS image_count
       FROM shoots s
       LEFT JOIN images i ON i.shoot_id = s.id
       GROUP BY s.id
       ORDER BY s.created_at DESC`
    )
    .all() as (Shoot & { image_count: number })[]

  return (
    <div className="px-6 md:px-10 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-[11px] tracking-[0.2em] uppercase text-black/40">
          Shoots ({shoots.length})
        </h1>
        <Link
          href="/admin/shoots/new"
          className="text-[11px] tracking-widest uppercase border border-black px-5 py-2.5 hover:bg-black hover:text-white transition-colors duration-150"
        >
          New Shoot
        </Link>
      </div>

      {shoots.length === 0 ? (
        <p className="text-xs text-black/30">No shoots yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10">
              <th className="text-left text-[11px] tracking-widest uppercase text-black/40 pb-3 font-normal">
                Name
              </th>
              <th className="text-left text-[11px] tracking-widest uppercase text-black/40 pb-3 font-normal">
                Category
              </th>
              <th className="text-left text-[11px] tracking-widest uppercase text-black/40 pb-3 font-normal">
                Images
              </th>
              <th className="text-left text-[11px] tracking-widest uppercase text-black/40 pb-3 font-normal">
                Created
              </th>
              <th className="pb-3" />
            </tr>
          </thead>
          <tbody>
            {shoots.map((shoot) => (
              <tr key={shoot.id} className="border-b border-black/5">
                <td className="py-4 pr-6">
                  <span className="text-sm">{shoot.name}</span>
                </td>
                <td className="py-4 pr-6">
                  <span className="text-xs tracking-wider uppercase text-black/40">
                    {shoot.category}
                  </span>
                </td>
                <td className="py-4 pr-6">
                  <span className="text-xs text-black/50">{shoot.image_count}</span>
                </td>
                <td className="py-4 pr-6">
                  <span className="text-xs text-black/30">
                    {new Date(shoot.created_at).toLocaleDateString('en-ZA', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <Link
                    href={`/admin/shoots/${shoot.id}`}
                    className="text-[11px] tracking-widest uppercase text-black/40 hover:text-black transition-colors duration-150"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
