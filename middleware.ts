import { auth } from "@/auth"
import { NextResponse } from "next/server"

export { auth } from "@/auth"

const protectedRoutes = ["/dashboard", "/profile"]
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

  return NextResponse.next();
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
