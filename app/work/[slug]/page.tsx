import db from '@/lib/db'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Shoot, ShootImage } from '@/types'

interface Props {
  params: { slug: string }
}

export const revalidate = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const shoot = db
    .prepare('SELECT name FROM shoots WHERE slug = ?')
    .get(params.slug) as Pick<Shoot, 'name'> | undefined
  return { title: shoot ? `${shoot.name} — Botshelo` : 'Not found' }
}

export default function ShootPage({ params }: Props) {
  const shoot = db
    .prepare('SELECT * FROM shoots WHERE slug = ?')
    .get(params.slug) as Shoot | undefined

  if (!shoot) notFound()

  const images = db
    .prepare(
      'SELECT * FROM images WHERE shoot_id = ? ORDER BY sort_order ASC'
    )
    .all(shoot.id) as ShootImage[]

  return (
    <div className="pt-[60px]">
      {/* Header */}
      <div className="px-6 md:px-10 pt-16 pb-12">
        <div className="mb-2">
          <Link
            href={`/work/${shoot.category}`}
            className="text-[11px] tracking-widest uppercase text-black/40 hover:text-accent transition-colors duration-150"
          >
            {shoot.category === 'personal' ? 'Personal' : 'Collabs'}
          </Link>
        </div>
        <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-6">{shoot.name}</h1>
        {shoot.description && (
          <p className="text-sm leading-relaxed text-black/70 max-w-prose whitespace-pre-line">
            {shoot.description}
          </p>
        )}
      </div>

      {/* Gallery */}
      {images.length > 0 && (
        <div className="columns-1 md:columns-2 gap-px px-px pb-px">
          {images.map((image, i) => {
            const hasSize = image.width && image.height
            return (
              <div key={image.id} className="break-inside-avoid mb-px block">
                {image.cloudinary_url && (
                  hasSize ? (
                    <Image
                      src={image.cloudinary_url}
                      alt=""
                      width={image.width!}
                      height={image.height!}
                      className="w-full h-auto opacity-0 transition-opacity duration-700"
                      placeholder={image.blur_data_url ? 'blur' : 'empty'}
                      blurDataURL={image.blur_data_url ?? undefined}
                      priority={i < 2}
                      onLoad={(e) => {
                        ;(e.target as HTMLImageElement).style.opacity = '1'
                      }}
                    />
                  ) : (
                    <div className="relative aspect-[3/2]">
                      <Image
                        src={image.cloudinary_url}
                        alt=""
                        fill
                        className="object-cover opacity-0 transition-opacity duration-700"
                        placeholder={image.blur_data_url ? 'blur' : 'empty'}
                        blurDataURL={image.blur_data_url ?? undefined}
                        priority={i < 2}
                        onLoad={(e) => {
                          ;(e.target as HTMLImageElement).style.opacity = '1'
                        }}
                      />
                    </div>
                  )
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
