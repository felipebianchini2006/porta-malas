import { NextResponse, type NextRequest } from "next/server"

const SESSION_COOKIE = "porta_malas_session"

function decodeBase64Url(value: string): ArrayBuffer {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=")
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const secret = process.env.SESSION_SECRET
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!secret || secret.length < 32 || !token) return false
  const [body, signature] = token.split(".")
  if (!body || !signature) return false

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    )
    const valid = await crypto.subtle.verify("HMAC", key, decodeBase64Url(signature), new TextEncoder().encode(body))
    if (!valid) return false
    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(body))) as { sub?: string; exp?: number }
    return Boolean(payload.sub && payload.exp && payload.exp > Math.floor(Date.now() / 1000))
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const authenticated = await hasValidSession(request)

  const isLoginPage = request.nextUrl.pathname.startsWith("/login")
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/")

  if (!authenticated && !isLoginPage && !isApiRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (authenticated && isLoginPage) {
    if (request.nextUrl.searchParams.has("motivo")) {
      const response = NextResponse.next({ request })
      response.cookies.delete(SESSION_COOKIE)
      return response
    }
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
