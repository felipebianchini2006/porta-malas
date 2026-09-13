import { NextRequest, NextResponse } from "next/server"

import { listarRepasses } from "@/lib/actions/repasses"
import { getCurrentUser } from "@/lib/auth/session"
import { gerarExcelRepasses } from "@/lib/utils/partner-export"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  if (user.role !== "admin") return NextResponse.json({ error: "Sem permissão" }, { status: 403 })

  const competencia = new URL(request.url).searchParams.get("competencia") ?? ""
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(competencia)) {
    return NextResponse.json({ error: "Competência inválida" }, { status: 400 })
  }

  const repasses = await listarRepasses(competencia)
  const buffer = await gerarExcelRepasses(repasses, competencia)
  return new NextResponse(buffer.buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="repasses-${competencia}.xlsx"`,
    },
  })
}
