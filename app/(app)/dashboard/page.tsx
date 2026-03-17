import Link from "next/link"
import { PackagePlus, PackageCheck } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { TabelaBagagens } from "@/components/dashboard/tabela-bagagens"
import type { Atendimento, Mala } from "@/lib/types"

interface AtendimentoComMalas extends Atendimento {
  malas: Mala[]
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  const [
    { data: atendimentos },
    { count: totalAtivo },
    { count: entradasHoje },
    { count: retiradasHoje },
  ] = await Promise.all([
    supabase
      .from("atendimentos")
      .select("*, malas(*)")
      .eq("status", "ativo")
      .order("data_checkin", { ascending: false }),

    supabase
      .from("atendimentos")
      .select("*", { count: "exact", head: true })
      .eq("status", "ativo"),

    supabase
      .from("atendimentos")
      .select("*", { count: "exact", head: true })
      .gte("data_checkin", todayISO),

    supabase
      .from("atendimentos")
      .select("*", { count: "exact", head: true })
      .eq("status", "retirado")
      .gte("data_retirada", todayISO),
  ])

  const safeAtendimentos = (atendimentos as AtendimentoComMalas[]) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Painel de Ocupação</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/checkin">
              <PackagePlus className="mr-2 h-4 w-4" />
              Novo Check-in
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/retirada">
              <PackageCheck className="mr-2 h-4 w-4" />
              Retirada
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCards
          totalAtivo={totalAtivo ?? 0}
          entradasHoje={entradasHoje ?? 0}
          retiradasHoje={retiradasHoje ?? 0}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bagagens em Guarda</CardTitle>
          <CardDescription>Atendimentos ativos</CardDescription>
        </CardHeader>
        <CardContent>
          <TabelaBagagens atendimentos={safeAtendimentos} />
        </CardContent>
      </Card>
    </div>
  )
}
