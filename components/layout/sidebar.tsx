import { createClient } from "@/lib/supabase/server"
import { SidebarNav } from "./sidebar-nav"
import { logout } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"

export async function Sidebar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: currentUser } = await supabase
    .from("usuarios")
    .select("role")
    .eq("id", user?.id ?? "")
    .single()

  const isAdmin = currentUser?.role === "admin"

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-slate-200 flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100">
          <span className="text-lg leading-none">🧳</span>
        </div>
        <span className="font-semibold text-amber-700 tracking-tight">Bag Point</span>
      </div>

      {/* Navigation */}
      <SidebarNav isAdmin={isAdmin} />

      {/* User section */}
      <div className="px-4 py-4 border-t border-slate-100 space-y-2">
        {user?.email && (
          <p className="text-xs text-slate-500 truncate px-1">{user.email}</p>
        )}
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            Sair
          </Button>
        </form>
      </div>
    </aside>
  )
}
