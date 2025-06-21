import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/dashboard', '/todos', '/profile', '/settings']
const publicRoutes = ['/login', '/signup', '/verify-otp', '/forgot-password']

export default function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  const cookieToken = request.cookies.get('auth_token')?.value
  const authHeader = request.headers.get('authorization')?.replace('Bearer ', '')
  const hasToken = cookieToken || authHeader

  // Debug logging for Vercel (remove in production)
  console.log('Middleware Debug:', { 
    path, 
    hasToken: !!hasToken, 
    isProtectedRoute, 
    isPublicRoute,
    cookieExists: !!cookieToken
  })

  // Redirect root to dashboard if authenticated, login if not
  if (path === '/') {
    if (hasToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Protect routes that require authentication
  if (isProtectedRoute && !hasToken) {
    console.log('Redirecting to login - no token for protected route')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from public routes
  if (isPublicRoute && hasToken) {
    console.log('Redirecting to dashboard - authenticated user on public route')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$).*)' 
  ],
}
