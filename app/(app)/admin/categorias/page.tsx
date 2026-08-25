import { redirect } from "next/navigation"

import { CategoriasMalaManager } from "@/components/admin/categorias-mala-manager"
import { listarCategoriasMalaAdmin } from "@/lib/actions/categorias-mala"
import { getCurrentUser } from "@/lib/auth/session"

export default async function AdminCategoriasPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "admin") redirect("/dashboard")

  const categorias = await listarCategoriasMalaAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Categorias de bagagem</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure os tipos de bagagem e os valores sugeridos no check-in.
        </p>
      </div>
      <CategoriasMalaManager categoriasIniciais={categorias} />
    </div>
  )
}
