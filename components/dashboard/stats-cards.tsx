import { Package, PackagePlus, PackageCheck, BarChart3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardsProps {
  totalAtivo: number
  entradasHoje: number
  retiradasHoje: number
}

export function StatsCards({ totalAtivo, entradasHoje, retiradasHoje }: StatsCardsProps) {
  const ocupacao = Math.min(Math.round((totalAtivo / 100) * 100), 100)

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total em Guarda</p>
              <p className="text-3xl font-bold">{totalAtivo}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Entradas Hoje</p>
              <p className="text-3xl font-bold">{entradasHoje}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <PackagePlus className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Retiradas Hoje</p>
              <p className="text-3xl font-bold">{retiradasHoje}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
              <PackageCheck className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ocupação</p>
              <p className="text-3xl font-bold">{ocupacao}%</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
