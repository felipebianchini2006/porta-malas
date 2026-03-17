"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, PackagePlus, PackageCheck, BarChart3 } from "lucide-react"

const navItems = [
  { label: "Painel", href: "/dashboard", icon: LayoutDashboard },
  { label: "Novo Check-in", href: "/checkin", icon: PackagePlus },
  { label: "Retirada", href: "/retirada", icon: PackageCheck },
  { label: "Relatório", href: "/relatorio", icon: BarChart3 },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              isActive
                ? "bg-indigo-50 text-indigo-700 font-medium"
                : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
