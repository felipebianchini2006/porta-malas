import { createClient } from "@/lib/supabase/server"

const pageTitles: Record<string, string> = {
  "/dashboard": "Painel",
  "/checkin": "Novo Check-in",
  "/retirada": "Retirada",
  "/relatorio": "Relatório",
}

interface HeaderProps {
  pathname?: string
}

export async function Header({ pathname = "" }: HeaderProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const title = pageTitles[pathname] ?? "Painel"
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "OP"

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-base font-semibold text-slate-800">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
          <span className="text-xs font-semibold text-indigo-700">{initials}</span>
        </div>
      </div>
    </header>
  )
}
