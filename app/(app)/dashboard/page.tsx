import Link from "next/link"
import { PackagePlus, PackageCheck } from "lucide-react"

import { query } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { TabelaBagagens } from "@/components/dashboard/tabela-bagagens"
import type { Atendimento, Mala } from "@/lib/types"

interface AtendimentoComMalas extends Atendimento {
  malas: Mala[]
}

export default async function DashboardPage() {
  const [
    atendimentosResult,
    totalAtivoResult,
    entradasHojeResult,
    retiradasHojeResult,
  ] = await Promise.all([
    query<AtendimentoComMalas>(
      `SELECT a.*,
              COALESCE(json_agg(m ORDER BY m.created_at) FILTER (WHERE m.id IS NOT NULL), '[]') AS malas
         FROM atendimentos a
         LEFT JOIN malas m ON m.atendimento_id = a.id
        WHERE a.status = 'ativo'
        GROUP BY a.id
        ORDER BY a.data_checkin DESC`
    ),
    query<{ count: number }>("SELECT COUNT(*)::int AS count FROM atendimentos WHERE status = 'ativo'"),
    query<{ count: number }>(
      `SELECT COUNT(*)::int AS count
         FROM atendimentos
        WHERE data_checkin >= ((CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date::timestamp AT TIME ZONE 'America/Sao_Paulo')`
    ),
    query<{ count: number }>(
      `SELECT COUNT(*)::int AS count
         FROM atendimentos
        WHERE status = 'retirado'
          AND data_retirada >= ((CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date::timestamp AT TIME ZONE 'America/Sao_Paulo')`
    ),
  ])

  const safeAtendimentos = atendimentosResult.rows
  const totalAtivo = totalAtivoResult.rows[0]?.count ?? 0
  const entradasHoje = entradasHojeResult.rows[0]?.count ?? 0
  const retiradasHoje = retiradasHojeResult.rows[0]?.count ?? 0

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
          totalAtivo={totalAtivo}
          entradasHoje={entradasHoje}
          retiradasHoje={retiradasHoje}
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
