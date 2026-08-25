import { getCurrentUser } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { listarUsuarios } from "@/lib/actions/usuarios"
import { UsuariosTable } from "@/components/admin/usuarios-table"
import { NovoUsuarioDialog } from "@/components/admin/novo-usuario-dialog"

export default async function AdminUsuariosPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "admin") {
    redirect("/dashboard")
  }

  const usuarios = await listarUsuarios()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie os operadores do sistema
          </p>
        </div>
        <NovoUsuarioDialog />
      </div>

      <UsuariosTable usuarios={usuarios} currentUserId={user.id} />
    </div>
  )
}
