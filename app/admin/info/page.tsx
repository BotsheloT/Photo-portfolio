'use client'

import { useState, useEffect, FormEvent } from 'react'

interface InfoData {
  name: string
  bio: string
  email: string
  instagram: string
  location: string
}

export default function AdminInfoPage() {
  const [data, setData] = useState<InfoData>({
    name: '',
    bio: '',
    email: '',
    instagram: '',
    location: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/info')
      .then((r) => r.json())
      .then((d) => {
        setData((prev) => ({ ...prev, ...d }))
        setLoading(false)
      })
  }, [])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)

    const res = await fetch('/api/info', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } else {
      setError('Failed to save')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="px-6 md:px-10 py-12">
        <p className="text-[11px] tracking-widest uppercase text-black/30">Loading...</p>
      </div>
    )
  }

  return (
    <div className="px-6 md:px-10 py-12">
      <h1 className="text-[11px] tracking-[0.2em] uppercase mb-10 text-black/40">
        Info Page
      </h1>

      <form onSubmit={handleSave} className="max-w-xl space-y-6">
        <div>
          <label className="block text-[11px] tracking-widest uppercase mb-2">Name</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
            className="w-full border border-black/20 px-3 py-2.5 text-sm focus:outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="block text-[11px] tracking-widest uppercase mb-2">Bio</label>
          <textarea
            value={data.bio}
            onChange={(e) => setData((d) => ({ ...d, bio: e.target.value }))}
            rows={8}
            className="w-full border border-black/20 px-3 py-2.5 text-sm focus:outline-none focus:border-black resize-none"
            placeholder="Use double line breaks for paragraph breaks"
          />
        </div>

        <div>
          <label className="block text-[11px] tracking-widest uppercase mb-2">Location</label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => setData((d) => ({ ...d, location: e.target.value }))}
            className="w-full border border-black/20 px-3 py-2.5 text-sm focus:outline-none focus:border-black"
            placeholder="e.g. Johannesburg, South Africa"
          />
        </div>

        <div>
          <label className="block text-[11px] tracking-widest uppercase mb-2">Email</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
            className="w-full border border-black/20 px-3 py-2.5 text-sm focus:outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="block text-[11px] tracking-widest uppercase mb-2">
            Instagram (without @)
          </label>
          <input
            type="text"
            value={data.instagram}
            onChange={(e) => setData((d) => ({ ...d, instagram: e.target.value }))}
            className="w-full border border-black/20 px-3 py-2.5 text-sm focus:outline-none focus:border-black"
            placeholder="yourusername"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex items-center gap-6 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="text-[11px] tracking-widest uppercase border border-black px-6 py-3 hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Save Info'}
          </button>
          {saved && (
            <span className="text-[11px] tracking-widest uppercase text-black/40">Saved</span>
          )}
        </div>
      </form>
    </div>
  )
}
