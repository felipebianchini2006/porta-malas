import { redirect } from "next/navigation"

import { RepassesManager } from "@/components/admin/repasses-manager"
import { listarRepasses } from "@/lib/actions/repasses"
import { getCurrentUser } from "@/lib/auth/session"
import { dataLocalISO } from "@/lib/utils/date-time"

export default async function AdminRepassesPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "admin") redirect("/dashboard")
  const competencia = dataLocalISO().slice(0, 7)
  const repasses = await listarRepasses(competencia)

  return <div className="space-y-6"><div><h1 className="text-2xl font-bold text-slate-900">Repasses de parceiros</h1><p className="mt-1 text-sm text-muted-foreground">Acompanhe comissões, vencimentos, PIX, baixa e exportação mensal.</p></div><RepassesManager competenciaInicial={competencia} repassesIniciais={repasses} /></div>
}
