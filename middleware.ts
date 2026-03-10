import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET ?? 'fallback-dev-secret-change-in-production')

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_session')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  try {
    await jwtVerify(token, secret())
    return NextResponse.next()
  } catch {
    const response = NextResponse.redirect(new URL('/admin', request.url))
    response.cookies.delete('admin_session')
    return response
  }
}

// Protect all admin sub-routes (but not the login page at /admin itself)
export const config = {
  matcher: ['/admin/:path+'],
}
