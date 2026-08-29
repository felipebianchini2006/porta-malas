"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BuscaBagagem, type AtendimentoResult } from "@/components/retirada/busca-bagagem"
import { ConfirmacaoRetirada } from "@/components/retirada/confirmacao-retirada"
import { formatarTelefone } from "@/lib/utils/telefone"

export default function RetiradaPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground text-sm">Carregando...</div>}>
      <RetiradaContent />
    </Suspense>
  )
}

function RetiradaContent() {
  const searchParams = useSearchParams()
  const protocoloParam = searchParams.get("protocolo")

  const [resultados, setResultados] = useState<AtendimentoResult[]>([])
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState<AtendimentoResult | null>(null)

  function handleNovaBusca() {
    setAtendimentoSelecionado(null)
    setResultados([])
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Retirada de Bagagens</h1>
        <p className="text-sm text-muted-foreground mt-1">Busque o atendimento e confirme a retirada</p>
      </div>

      {!atendimentoSelecionado ? (
        <>
          <BuscaBagagem onResultados={setResultados} initialQuery={protocoloParam} />

          {resultados.length === 0 ? null : (
            <div className="space-y-3">
              {resultados.map((atendimento) => (
                <Card
                  key={atendimento.id}
                  className="cursor-pointer transition-colors hover:border-indigo-300 hover:shadow-md"
                  onClick={() => setAtendimentoSelecionado(atendimento)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-violet-100 text-violet-700 font-mono border-0 shrink-0">
                            {atendimento.protocolo}
                          </Badge>
                          <span className="font-medium text-sm truncate">{atendimento.cliente_nome}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatarTelefone(atendimento.cliente_telefone)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium text-slate-700">
                          {atendimento.malas.length}{" "}
                          {atendimento.malas.length === 1 ? "mala" : "malas"}
                        </p>
                        <Badge className="bg-green-100 text-green-700 border-0 text-xs mt-1">
                          ativo
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAtendimentoSelecionado(null)}
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar à busca
          </Button>

          <ConfirmacaoRetirada
            atendimento={atendimentoSelecionado}
            onNovaBusca={handleNovaBusca}
          />
        </div>
      )}
    </div>
  )
}
