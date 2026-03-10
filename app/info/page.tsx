import db from '@/lib/db'
import type { Metadata } from 'next'
import type { SiteInfo } from '@/types'

export const metadata: Metadata = {
  title: 'Info — Botshelo',
}

export const revalidate = 60

export default function InfoPage() {
  const row = db
    .prepare('SELECT value FROM site_content WHERE key = ?')
    .get('info') as { value: string } | undefined

  const info: SiteInfo = row
    ? JSON.parse(row.value)
    : { name: '', bio: '', email: '', instagram: '', location: '' }

  return (
    <div className="pt-[60px] px-6 md:px-10 py-16 md:py-24">
      <div className="max-w-prose">
        <h1 className="text-[11px] tracking-[0.2em] uppercase mb-12 text-black/40">Info</h1>

        {info.name && (
          <p className="text-3xl md:text-4xl font-light tracking-tight mb-10">{info.name}</p>
        )}

        {info.bio && (
          <div className="mb-12 space-y-4">
            {info.bio.split('\n\n').map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-black/80">
                {para}
              </p>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {info.location && (
            <p className="text-xs tracking-wide text-black/50">{info.location}</p>
          )}

          {info.email && (
            <p className="text-xs tracking-wide">
              <a
                href={`mailto:${info.email}`}
                className="text-black hover:text-accent transition-colors duration-150 underline underline-offset-4 decoration-black/20 hover:decoration-accent"
              >
                {info.email}
              </a>
            </p>
          )}

          {info.instagram && (
            <p className="text-xs tracking-wide">
              <a
                href={`https://instagram.com/${info.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-accent transition-colors duration-150 underline underline-offset-4 decoration-black/20 hover:decoration-accent"
              >
                @{info.instagram.replace('@', '')}
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
