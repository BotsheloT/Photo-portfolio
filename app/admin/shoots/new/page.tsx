import Link from 'next/link'
import ShootForm from '@/components/admin/ShootForm'

export default function NewShootPage() {
  return (
    <div className="px-6 md:px-10 py-12">
      <div className="mb-10">
        <Link
          href="/admin/dashboard"
          className="text-[11px] tracking-widest uppercase text-black/30 hover:text-black transition-colors duration-150"
        >
          Back to Shoots
        </Link>
        <h1 className="text-[11px] tracking-[0.2em] uppercase mt-6 mb-0 text-black/40">
          New Shoot
        </h1>
      </div>

      <ShootForm mode="create" />
    </div>
  )
}
