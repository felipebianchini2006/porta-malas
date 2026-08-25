"use server"

import { unlink } from "node:fs/promises"
import path from "node:path"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth/session"
import { query } from "@/lib/db"

export interface SalvarFotoInput {
  mala_id: string
  storage_path: string
  url: string
}

export async function salvarFoto(input: SalvarFotoInput): Promise<{ success: boolean; error?: string }> {
  if (!(await getCurrentUser())) return { success: false, error: "Não autenticado" }
  if (!input.mala_id || !input.storage_path || !input.url.startsWith("/api/uploads/")) {
    return { success: false, error: "Dados da foto inválidos" }
  }
  try {
    await query(
      "INSERT INTO fotos_malas (mala_id, storage_path, url) VALUES ($1, $2, $3)",
      [input.mala_id, input.storage_path, input.url]
    )
    revalidatePath("/checkin/[id]", "page")
    return { success: true }
  } catch (error) {
    console.error("Erro ao salvar foto:", error)
    return { success: false, error: "Erro ao salvar foto" }
  }
}

export async function excluirFoto(
  fotoId: string,
  storagePath: string
): Promise<{ success: boolean; error?: string }> {
  if (!(await getCurrentUser())) return { success: false, error: "Não autenticado" }
  try {
    const result = await query<{ storage_path: string }>(
      "DELETE FROM fotos_malas WHERE id = $1 AND storage_path = $2 RETURNING storage_path",
      [fotoId, storagePath]
    )
    const storedPath = result.rows[0]?.storage_path
    if (!storedPath) return { success: false, error: "Foto não encontrada" }

    const uploadRoot = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads"))
    const filePath = path.resolve(uploadRoot, storedPath)
    if (filePath.startsWith(`${uploadRoot}${path.sep}`)) {
      await unlink(filePath).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") console.error("Erro ao remover arquivo da foto:", error)
      })
    }

    revalidatePath("/checkin/[id]", "page")
    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir foto:", error)
    return { success: false, error: "Erro ao excluir foto" }
  }
}
