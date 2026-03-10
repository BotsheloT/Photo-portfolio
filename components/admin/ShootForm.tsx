'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import DraggableImageList from './DraggableImageList'
import type { Shoot, ShootImage } from '@/types'

interface ShootFormProps {
  mode: 'create' | 'edit'
  shoot?: Shoot
  initialImages?: ShootImage[]
}

export default function ShootForm({ mode, shoot, initialImages = [] }: ShootFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Form fields
  const [name, setName] = useState(shoot?.name ?? '')
  const [category, setCategory] = useState<'personal' | 'collabs'>(
    shoot?.category ?? 'personal'
  )
  const [description, setDescription] = useState(shoot?.description ?? '')

  // Images
  const [images, setImages] = useState<ShootImage[]>(
    [...initialImages].sort((a, b) => a.sort_order - b.sort_order)
  )

  // Upload state
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Upload images ──────────────────────────────────────────────────────────
  async function handleUpload(files: FileList) {
    if (!shoot?.id) return
    setUploading(true)
    setUploadError(null)

    const results: ShootImage[] = []

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('shootId', String(shoot.id))

      const res = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        results.push(await res.json())
      } else {
        const err = await res.json()
        setUploadError(`Failed to upload "${file.name}": ${err.error}`)
      }
    }

    setImages((prev) => {
      const updated = [...prev, ...results]
      // Ensure exactly one thumbnail
      if (results.length > 0 && !updated.some((img) => img.is_thumbnail)) {
        updated[0] = { ...updated[0], is_thumbnail: 1 }
      }
      return updated
    })

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Set thumbnail (local state only — persisted on Save) ──────────────────
  async function handleSetThumbnail(id: number) {
    // Persist immediately to keep it simple
    const res = await fetch(`/api/images/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isThumbnail: true }),
    })
    if (res.ok) {
      setImages((prev) =>
        prev.map((img) => ({ ...img, is_thumbnail: img.id === id ? 1 : 0 }))
      )
    }
  }

  // ── Remove image ───────────────────────────────────────────────────────────
  async function handleRemove(id: number) {
    setRemovingId(id)
    const res = await fetch(`/api/images/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setImages((prev) => {
        const next = prev.filter((img) => img.id !== id)
        // If removed image was the thumbnail, promote the first remaining
        if (prev.find((img) => img.id === id)?.is_thumbnail && next.length > 0) {
          next[0] = { ...next[0], is_thumbnail: 1 }
        }
        return next
      })
    }
    setRemovingId(null)
  }

  // ── Reorder (local state — persisted on Save) ─────────────────────────────
  function handleReorder(reordered: ShootImage[]) {
    setImages(reordered)
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  async function handleSave() {
    setSaveError(null)

    if (mode === 'create') {
      // Create shoot first, then redirect to edit page for image uploads
      const res = await fetch('/api/shoots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, description }),
      })
      if (!res.ok) {
        const err = await res.json()
        setSaveError(err.error ?? 'Failed to create shoot')
        return
      }
      const created = await res.json()
      startTransition(() => router.push(`/admin/shoots/${created.id}`))
      return
    }

    // Edit mode: save metadata + image order
    const [metaRes] = await Promise.all([
      fetch(`/api/shoots/${shoot!.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, description }),
      }),
      fetch('/api/images/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds: images.map((img) => img.id) }),
      }),
    ])

    if (!metaRes.ok) {
      const err = await metaRes.json()
      setSaveError(err.error ?? 'Failed to save')
      return
    }

    startTransition(() => router.refresh())
  }

  // ── Delete shoot ──────────────────────────────────────────────────────────
  async function handleDelete() {
    const res = await fetch(`/api/shoots/${shoot!.id}`, { method: 'DELETE' })
    if (res.ok) {
      startTransition(() => router.push('/admin/dashboard'))
    } else {
      setSaveError('Failed to delete shoot')
      setDeleteConfirm(false)
    }
  }

  return (
    <div className="max-w-2xl">
      {/* ── Metadata ────────────────────────────────────────────────────── */}
      <div className="space-y-6 mb-10">
        <div>
          <label className="block text-[11px] tracking-widest uppercase mb-2">Shoot Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-black/20 px-3 py-2.5 text-sm focus:outline-none focus:border-black"
            placeholder="e.g. Johannesburg Streets"
          />
        </div>

        <div>
          <label className="block text-[11px] tracking-widest uppercase mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as 'personal' | 'collabs')}
            className="w-full border border-black/20 px-3 py-2.5 text-sm focus:outline-none focus:border-black bg-white"
          >
            <option value="personal">Personal</option>
            <option value="collabs">Collabs</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] tracking-widest uppercase mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-black/20 px-3 py-2.5 text-sm focus:outline-none focus:border-black resize-none"
            placeholder="Optional shoot description..."
          />
        </div>
      </div>

      {/* ── Image upload (edit mode only) ───────────────────────────────── */}
      {mode === 'edit' && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] tracking-widest uppercase">
              Images ({images.length})
            </h2>
            <label className="cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => e.target.files && handleUpload(e.target.files)}
                disabled={uploading}
              />
              <span className="text-[11px] tracking-widest uppercase text-black/60 hover:text-black transition-colors duration-150">
                {uploading ? 'Uploading...' : 'Upload Images'}
              </span>
            </label>
          </div>

          {uploadError && (
            <p className="text-xs text-red-600 mb-3">{uploadError}</p>
          )}

          {images.length === 0 ? (
            <p className="text-xs text-black/30 py-4">No images yet. Upload some above.</p>
          ) : (
            <DraggableImageList
              images={images}
              onReorder={handleReorder}
              onSetThumbnail={handleSetThumbnail}
              onRemove={handleRemove}
              removingId={removingId}
            />
          )}
        </div>
      )}

      {/* ── Save & Delete ────────────────────────────────────────────────── */}
      {saveError && <p className="text-xs text-red-600 mb-4">{saveError}</p>}

      <div className="flex items-center gap-8">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || !name}
          className="text-[11px] tracking-widest uppercase border border-black px-6 py-3 hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-40"
        >
          {mode === 'create' ? 'Create Shoot' : 'Save Shoot'}
        </button>

        {mode === 'edit' && !deleteConfirm && (
          <button
            type="button"
            onClick={() => setDeleteConfirm(true)}
            className="text-[11px] tracking-widest uppercase text-black/30 hover:text-black transition-colors duration-150"
          >
            Delete Shoot
          </button>
        )}

        {deleteConfirm && (
          <div className="flex items-center gap-4">
            <span className="text-xs text-black/60">Are you sure?</span>
            <button
              type="button"
              onClick={handleDelete}
              className="text-[11px] tracking-widest uppercase text-red-600 hover:text-red-800"
            >
              Yes, Delete
            </button>
            <button
              type="button"
              onClick={() => setDeleteConfirm(false)}
              className="text-[11px] tracking-widest uppercase text-black/40 hover:text-black"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
