import { redirect } from "next/navigation"

import { ParceirosManager } from "@/components/admin/parceiros-manager"
import { listarParceirosAdmin } from "@/lib/actions/parceiros"
import { getCurrentUser } from "@/lib/auth/session"

export default async function AdminParceirosPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "admin") redirect("/dashboard")
  const parceiros = await listarParceirosAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Programa de Parceiros</h1>
        <p className="mt-1 text-sm text-muted-foreground">Cadastre parceiros, configure comissão, PIX e regras de repasse.</p>
      </div>
      <ParceirosManager parceirosIniciais={parceiros} />
    </div>
  )
}
