import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { listarUsuarios } from "@/lib/actions/usuarios"
import { UsuariosTable } from "@/components/admin/usuarios-table"

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
      </div>

      {/* Info card about adding users */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <strong>Como adicionar novos usuários:</strong> Acesse o{" "}
        <a
          href="https://supabase.com/dashboard/project/jedqlqgcrstsqsppfqsa/auth/users"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium"
        >
          Dashboard do Supabase
        </a>{" "}
        → Authentication → Users → Add User. O usuário aparecerá aqui após o primeiro
        login.
      </div>

      <UsuariosTable usuarios={usuarios} currentUserId={user.id} />
    </div>
  )
}
