'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  // Only render the nav for authenticated sub-pages
  if (pathname === '/admin') return null

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin')
  }

  const linkClass = (path: string) =>
    `text-[11px] tracking-widest uppercase transition-colors duration-150 ${
      pathname.startsWith(path) ? 'text-black' : 'text-black/40 hover:text-black'
    }`

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/5">
      <div className="px-6 py-3.5 flex items-center justify-between">
        <span className="text-[11px] tracking-widest uppercase text-black/30">Admin</span>

        <nav className="flex items-center gap-8">
          <Link href="/admin/dashboard" className={linkClass('/admin/dashboard')}>
            Shoots
          </Link>
          <Link href="/admin/info" className={linkClass('/admin/info')}>
            Info
          </Link>
          <Link
            href="/"
            target="_blank"
            className="text-[11px] tracking-widest uppercase text-black/30 hover:text-black transition-colors duration-150"
          >
            View Site
          </Link>
          <button
            onClick={handleLogout}
            className="text-[11px] tracking-widest uppercase text-black/30 hover:text-black transition-colors duration-150"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  )
}
