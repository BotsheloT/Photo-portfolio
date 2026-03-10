'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Thumbnail } from '@/types'

interface HomeGridProps {
  initialThumbnails: Thumbnail[]
  initialHasMore: boolean
}

export default function HomeGrid({ initialThumbnails, initialHasMore }: HomeGridProps) {
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>(initialThumbnails)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const res = await fetch(`/api/shoots?page=${page + 1}&limit=20`)
      const data = await res.json()
      setThumbnails((prev) => [...prev, ...data.thumbnails])
      setHasMore(data.hasMore)
      setPage((p) => p + 1)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '400px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px">
        {thumbnails.map((thumb) => (
          <Link
            key={thumb.shoot_id}
            href={`/work/${thumb.slug}`}
            className="block relative overflow-hidden aspect-[2/3] bg-neutral-100"
            tabIndex={0}
            aria-label={`View shoot`}
          >
            {thumb.cloudinary_url && (
              <Image
                src={thumb.cloudinary_url}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                className="object-cover opacity-0 transition-opacity duration-700"
                placeholder={thumb.blur_data_url ? 'blur' : 'empty'}
                blurDataURL={thumb.blur_data_url ?? undefined}
                onLoad={(e) => {
                  ;(e.target as HTMLImageElement).style.opacity = '1'
                }}
              />
            )}
          </Link>
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-px" aria-hidden="true" />

      {loading && (
        <p className="text-center py-12 text-[11px] tracking-widest uppercase text-black/30">
          Loading
        </p>
      )}
    </>
  )
}
