import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-[60px]">
      <p className="text-[11px] tracking-[0.2em] uppercase mb-6 text-black/30">Not found</p>
      <Link
        href="/"
        className="text-[11px] tracking-widest uppercase hover:text-accent transition-colors duration-150"
      >
        Back to Home
      </Link>
    </div>
  )
}
