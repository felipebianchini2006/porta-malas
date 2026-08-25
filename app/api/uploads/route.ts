import { randomUUID } from "node:crypto"
import { mkdir, unlink, writeFile } from "node:fs/promises"
import path from "node:path"
import { NextResponse } from "next/server"

import { salvarFoto } from "@/lib/actions/fotos"
import { getCurrentUser } from "@/lib/auth/session"

export const runtime = "nodejs"

const MAX_FILE_SIZE = 10 * 1024 * 1024
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const EXTENSIONS_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

function hasExpectedSignature(contents: Buffer, mime: string) {
  if (mime === "image/jpeg") {
    return contents.length >= 3 && contents[0] === 0xff && contents[1] === 0xd8 && contents[2] === 0xff
  }
  if (mime === "image/png") {
    return contents.length >= 8 && contents.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  }
  if (mime === "image/webp") {
    return contents.length >= 12 && contents.toString("ascii", 0, 4) === "RIFF" && contents.toString("ascii", 8, 12) === "WEBP"
  }
  return false
}

function uploadsRoot() {
  const configured = process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads")
  return path.resolve(configured)
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file")
  const malaId = formData.get("malaId")
  const atendimentoId = formData.get("atendimentoId")

  if (!(file instanceof File) || typeof malaId !== "string" || typeof atendimentoId !== "string") {
    return NextResponse.json({ error: "Arquivo e identificadores são obrigatórios" }, { status: 400 })
  }

  if (!UUID_PATTERN.test(malaId) || !UUID_PATTERN.test(atendimentoId)) {
    return NextResponse.json({ error: "Identificadores inválidos" }, { status: 400 })
  }

  const extension = EXTENSIONS_BY_MIME[file.type]
  if (!extension) {
    return NextResponse.json({ error: "Formato não suportado. Use JPG, PNG ou WebP" }, { status: 415 })
  }

  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "A foto deve ter no máximo 10 MB" }, { status: 413 })
  }

  const storagePath = `${atendimentoId}/${malaId}/${randomUUID()}.${extension}`
  const absolutePath = path.join(uploadsRoot(), ...storagePath.split("/"))
  const contents = Buffer.from(await file.arrayBuffer())

  if (!hasExpectedSignature(contents, file.type)) {
    return NextResponse.json({ error: "O conteúdo do arquivo não corresponde a uma imagem válida" }, { status: 415 })
  }

  await mkdir(path.dirname(absolutePath), { recursive: true })
  await writeFile(absolutePath, contents, { flag: "wx" })

  const url = `/api/uploads/${storagePath}`
  let result: Awaited<ReturnType<typeof salvarFoto>>
  try {
    result = await salvarFoto({ mala_id: malaId, storage_path: storagePath, url })
  } catch {
    await unlink(absolutePath).catch(() => undefined)
    return NextResponse.json({ error: "Não foi possível salvar a foto" }, { status: 500 })
  }

  if (!result.success) {
    await unlink(absolutePath).catch(() => undefined)
    return NextResponse.json({ error: result.error || "Não foi possível salvar a foto" }, { status: 500 })
  }

  return NextResponse.json({ url, storagePath }, { status: 201 })
}
