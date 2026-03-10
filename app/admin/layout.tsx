import type { Metadata } from 'next'
import AdminNav from './AdminNav'

export const metadata: Metadata = {
  title: 'Admin — Botshelo',
}

// Nested layout — html/body come from the root app/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminNav />
      <main className="pt-[52px]">{children}</main>
    </>
  )
}
