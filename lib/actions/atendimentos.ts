"use server"

import { rm } from "node:fs/promises"
import path from "node:path"
import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/lib/auth/session"
import { transaction } from "@/lib/db"
import {
  confirmarProtocoloExato,
  resolverDiretorioAtendimento,
} from "@/lib/utils/atendimento-delete"

interface ExcluirAtendimentoInput {
  atendimentoId: string
  protocoloConfirmacao: string
}

interface ExcluirAtendimentoResult {
  success: boolean
  error?: string
  warning?: string
}

export async function excluirAtendimento(
  input: ExcluirAtendimentoInput
): Promise<ExcluirAtendimentoResult> {
  try {
    await requireAdmin()

    const uploadRoot = path.resolve(
      process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads")
    )
    const atendimentoDir = resolverDiretorioAtendimento(uploadRoot, input.atendimentoId)

    const result = await transaction(async (client) => {
      const atendimento = await client.query<{ protocolo: string }>(
        "SELECT protocolo FROM atendimentos WHERE id = $1 FOR UPDATE",
        [input.atendimentoId]
      )
      const protocolo = atendimento.rows[0]?.protocolo
      if (!protocolo) return { status: "not_found" as const }
      if (!confirmarProtocoloExato(protocolo, input.protocoloConfirmacao)) {
        return { status: "invalid_confirmation" as const }
      }

      await client.query("DELETE FROM atendimentos WHERE id = $1", [input.atendimentoId])
      return { status: "deleted" as const }
    })

    if (result.status === "not_found") {
      return { success: false, error: "Atendimento não encontrado" }
    }
    if (result.status === "invalid_confirmation") {
      return { success: false, error: "Digite o protocolo completo para confirmar" }
    }

    let warning: string | undefined
    try {
      await rm(atendimentoDir, { recursive: true, force: true })
    } catch (error) {
      console.error("Atendimento removido, mas os arquivos não puderam ser limpos:", error)
      warning = "Atendimento removido; alguns arquivos precisam de limpeza técnica"
    }

    revalidatePath("/dashboard")
    revalidatePath("/relatorio")
    revalidatePath("/relatorio/parceiros")
    revalidatePath("/retirada")

    return { success: true, warning }
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (message === "Não autenticado" || message === "Sem permissão") {
      return { success: false, error: message }
    }
    if (message === "Atendimento inválido") {
      return { success: false, error: message }
    }
    console.error("Erro ao excluir atendimento:", error)
    return { success: false, error: "Erro ao excluir atendimento" }
  }
}
