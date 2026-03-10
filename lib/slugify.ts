import db from './db'

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function uniqueSlug(name: string): string {
  const base = slugify(name)
  let slug = base
  let counter = 1

  while (db.prepare('SELECT id FROM shoots WHERE slug = ?').get(slug)) {
    slug = `${base}-${counter++}`
  }

  return slug
}
