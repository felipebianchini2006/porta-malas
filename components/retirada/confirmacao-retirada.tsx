"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, Loader2, MessageCircle, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { realizarRetirada } from "@/lib/actions/retirada"
import { linkRetirada } from "@/lib/utils/whatsapp"
import type { AtendimentoResult } from "./busca-bagagem"

interface SuccessData {
  protocolo: string
  cliente_nome: string
  cliente_telefone: string
  data_retirada: string
}

interface ConfirmacaoRetiradaProps {
  atendimento: AtendimentoResult
  onNovaBusca: () => void
}

function formatarTelefone(telefone: string): string {
  const digits = telefone.replace(/\D/g, "")
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return telefone
}

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function ConfirmacaoRetirada({ atendimento, onNovaBusca }: ConfirmacaoRetiradaProps) {
  const [isPending, startTransition] = useTransition()
  const [successData, setSuccessData] = useState<SuccessData | null>(null)

  function handleConfirmar() {
    startTransition(async () => {
      const result = await realizarRetirada(atendimento.id)
      if (result.success && result.protocolo && result.cliente_nome && result.cliente_telefone && result.data_retirada) {
        toast.success("Retirada confirmada!")
        setSuccessData({
          protocolo: result.protocolo,
          cliente_nome: result.cliente_nome,
          cliente_telefone: result.cliente_telefone,
          data_retirada: result.data_retirada,
        })
      } else {
        toast.error(result.error ?? "Erro ao registrar retirada")
      }
    })
  }

  if (successData) {
    const whatsappLink = linkRetirada(
      successData.cliente_telefone,
      successData.cliente_nome,
      successData.protocolo,
      formatarDataHora(successData.data_retirada)
    )

    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0" />
          <div>
            <h2 className="text-lg font-semibold text-green-800">Retirada confirmada!</h2>
            <p className="text-sm text-green-700">
              Protocolo{" "}
              <span className="font-mono font-bold">{successData.protocolo}</span> —{" "}
              {successData.cliente_nome}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="bg-green-600 hover:bg-green-700 text-white flex-1">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />
              Enviar WhatsApp
            </a>
          </Button>
          <Button variant="outline" onClick={onNovaBusca} className="flex-1">
            <Search className="h-4 w-4" />
            Nova Busca
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Badge className="bg-violet-100 text-violet-700 font-mono border-0 text-sm px-3 py-1">
            {atendimento.protocolo}
          </Badge>
          <CardTitle className="text-lg">{atendimento.cliente_nome}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Client info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Telefone</p>
            <p className="font-medium">{formatarTelefone(atendimento.cliente_telefone)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Check-in</p>
            <p className="font-medium">{formatarDataHora(atendimento.data_checkin)}</p>
          </div>
          {atendimento.valor_cobrado !== null && (
            <div>
              <p className="text-muted-foreground">Valor cobrado</p>
              <p className="font-medium">
                {atendimento.valor_cobrado.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          )}
        </div>

        {/* Malas */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            {atendimento.malas.length === 1
              ? "1 mala em guarda"
              : `${atendimento.malas.length} malas em guarda`}
          </p>
          <ul className="space-y-2">
            {atendimento.malas.map((mala) => (
              <li
                key={mala.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <span className="font-mono font-medium">{mala.identificacao_interna}</span>
                {mala.descricao && (
                  <span className="text-muted-foreground truncate ml-2">{mala.descricao}</span>
                )}
                <Badge
                  className={
                    mala.status === "em_guarda"
                      ? "bg-green-100 text-green-700 border-0 ml-2 shrink-0"
                      : "bg-gray-100 text-gray-600 border-0 ml-2 shrink-0"
                  }
                >
                  {mala.status === "em_guarda" ? "em guarda" : "retirada"}
                </Badge>
              </li>
            ))}
          </ul>
        </div>

        {atendimento.observacoes && (
          <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
            <span className="font-medium">Obs: </span>
            {atendimento.observacoes}
          </div>
        )}

        <Button
          onClick={handleConfirmar}
          disabled={isPending}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Registrando retirada...
            </>
          ) : (
            "Confirmar Retirada"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
