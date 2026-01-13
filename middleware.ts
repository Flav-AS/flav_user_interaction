import { auth } from "@/auth"
import { NextResponse } from "next/server"

const protectedRoutes = ["/profile"]
const apiAuthPrefix = "/api/auth/"
const authPageRoutes = ["/login"]

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const path = nextUrl.pathname
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
  const isProtectedRoute = protectedRoutes.includes(path)
  const isAuthPageRoute = authPageRoutes.includes(path)

  if (isApiAuthRoute) {
    return NextResponse.next()
  }
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }
  if (isAuthPageRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl))
  }

   if (path.startsWith('/admin')) {
    // If not authenticated, redirect to login
    if (!req.auth) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
})

export const config = {
    matcher: ['/admin/:path*',"/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
