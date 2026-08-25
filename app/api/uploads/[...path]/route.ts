import { readFile } from "node:fs/promises"
import path from "node:path"
import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth/session"

export const runtime = "nodejs"

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
}

function uploadsRoot() {
  const configured = process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads")
  return path.resolve(configured)
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const segments = (await params).path
  if (!segments?.length || segments.some((segment) => !segment || segment === "." || segment === "..")) {
    return NextResponse.json({ error: "Caminho inválido" }, { status: 400 })
  }

  const root = uploadsRoot()
  const absolutePath = path.resolve(root, ...segments)
  const relative = path.relative(root, absolutePath)
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return NextResponse.json({ error: "Caminho inválido" }, { status: 400 })
  }

  const contentType = CONTENT_TYPES[path.extname(absolutePath).toLowerCase()]
  if (!contentType) {
    return NextResponse.json({ error: "Arquivo inválido" }, { status: 415 })
  }

  try {
    const contents = await readFile(absolutePath)
    return new NextResponse(contents, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    const code = error instanceof Error && "code" in error ? error.code : undefined
    if (code === "ENOENT") {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 })
    }
    return NextResponse.json({ error: "Não foi possível ler o arquivo" }, { status: 500 })
  }
}
