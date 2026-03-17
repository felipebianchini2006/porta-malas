import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { buscarRelatorio } from "@/lib/actions/relatorio"
import { gerarCSV, gerarExcel } from "@/lib/utils/export"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const formato = searchParams.get("formato") // "csv" | "xlsx"
  const dataInicio = searchParams.get("inicio") || new Date().toISOString().split("T")[0]
  const dataFim = searchParams.get("fim") || dataInicio

  const { atendimentos } = await buscarRelatorio(dataInicio, dataFim)
  const periodo = `${dataInicio}_${dataFim}`

  if (formato === "csv") {
    const csv = gerarCSV(atendimentos)
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="relatorio-${periodo}.csv"`,
      },
    })
  }

  if (formato === "xlsx") {
    const buffer = gerarExcel(atendimentos, periodo)
    return new NextResponse(buffer.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="relatorio-${periodo}.xlsx"`,
      },
    })
  }

  return NextResponse.json({ error: "Formato inválido" }, { status: 400 })
}
