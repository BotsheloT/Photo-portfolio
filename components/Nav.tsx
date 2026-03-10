'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

export default function Nav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [workOpen, setWorkOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Don't render the public nav on any admin route
  if (pathname.startsWith('/admin')) return null

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setWorkOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
    setWorkOpen(false)
  }, [pathname])

  const isWork = pathname.startsWith('/work')
  const isInfo = pathname === '/info'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white">
      <div className="px-6 py-5 flex items-center justify-between">
        {/* Wordmark */}
        <Link
          href="/"
          className="text-[11px] tracking-[0.2em] uppercase transition-colors duration-150 hover:text-accent"
        >
          Botshelo
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10" aria-label="Main navigation">
          {/* WORK with dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setWorkOpen((o) => !o)}
              aria-expanded={workOpen}
              className={`nav-link ${isWork ? 'nav-link-active' : 'nav-link-hover'}`}
            >
              Work
            </button>

            {workOpen && (
              <div className="absolute top-full right-0 mt-3 bg-white border border-black/10 min-w-[120px]">
                <Link
                  href="/work/personal"
                  className={`block px-5 py-3 nav-link ${
                    pathname === '/work/personal' ? 'nav-link-active' : 'nav-link-hover'
                  }`}
                  onClick={() => setWorkOpen(false)}
                >
                  Personal
                </Link>
                <Link
                  href="/work/collabs"
                  className={`block px-5 py-3 nav-link ${
                    pathname === '/work/collabs' ? 'nav-link-active' : 'nav-link-hover'
                  }`}
                  onClick={() => setWorkOpen(false)}
                >
                  Collabs
                </Link>
              </div>
            )}
          </div>

          <Link href="/info" className={`nav-link ${isInfo ? 'nav-link-active' : 'nav-link-hover'}`}>
            Info
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden nav-link nav-link-hover"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          className="md:hidden px-6 pb-6 flex flex-col gap-5 border-t border-black/5"
          aria-label="Mobile navigation"
        >
          <Link
            href="/work/personal"
            className={`nav-link pt-5 ${pathname === '/work/personal' ? 'nav-link-active' : 'nav-link-hover'}`}
          >
            Personal
          </Link>
          <Link
            href="/work/collabs"
            className={`nav-link ${pathname === '/work/collabs' ? 'nav-link-active' : 'nav-link-hover'}`}
          >
            Collabs
          </Link>
          <Link
            href="/info"
            className={`nav-link ${isInfo ? 'nav-link-active' : 'nav-link-hover'}`}
          >
            Info
          </Link>
        </nav>
      )}
    </header>
  )
}
