import { Sidebar } from "@/components/layout/sidebar"
import { MobileSidebar } from "@/components/layout/mobile-sidebar"
import { createClient } from "@/lib/supabase/server"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex h-screen">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col md:ml-60 overflow-hidden">
        {/* Mobile top bar with hamburger */}
        <div className="flex md:hidden items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0">
          <MobileSidebar userEmail={user?.email} />
          <span className="font-semibold text-violet-700 tracking-tight">Guarda-Malas</span>
        </div>

        <main className="flex-1 overflow-auto p-6 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  )
}
