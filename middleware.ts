import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/dashboard', '/todos', '/profile', '/settings']
const publicRoutes = ['/login', '/signup', '/verify-otp', '/forgot-password']

export default function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.includes(path)

  const cookieToken = request.cookies.get('auth_token')?.value
  const authHeader = request.headers.get('authorization')
  const hasToken = cookieToken || authHeader

  if (path === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isProtectedRoute && !hasToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isPublicRoute && hasToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)'],
}
