"use client"

import { Briefcase, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { SidebarNav } from "./sidebar-nav"
import { logout } from "@/lib/actions/auth"

interface MobileSidebarProps {
  userEmail?: string | null
}

export function MobileSidebar({ userEmail }: MobileSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-60 p-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100">
              <Briefcase className="w-4 h-4 text-violet-600" />
            </div>
            <span className="font-semibold text-violet-700 tracking-tight">Guarda-Malas</span>
          </div>

          {/* Navigation */}
          <SidebarNav />

          {/* User section */}
          <div className="px-4 py-4 border-t border-slate-100 space-y-2">
            {userEmail && (
              <p className="text-xs text-slate-500 truncate px-1">{userEmail}</p>
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
        </div>
      </SheetContent>
    </Sheet>
  )
}
