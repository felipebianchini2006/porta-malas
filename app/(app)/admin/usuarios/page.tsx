import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { listarUsuarios } from "@/lib/actions/usuarios"
import { UsuariosTable } from "@/components/admin/usuarios-table"
import { NovoUsuarioDialog } from "@/components/admin/novo-usuario-dialog"

export default async function AdminUsuariosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: currentUser } = await supabase
    .from("usuarios")
    .select("role")
    .eq("id", user.id)
    .single()

  if (currentUser?.role !== "admin") {
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
