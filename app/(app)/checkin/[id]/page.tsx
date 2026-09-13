import { query } from "@/lib/db"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, MessageCircle, LayoutDashboard, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { linkCheckinComAceite } from "@/lib/utils/whatsapp"
import { formatarTelefone } from "@/lib/utils/telefone"
import { formatarDataHora } from "@/lib/utils/date-time"
import { labelFormaPagamento } from "@/lib/utils/payment"
import { Atendimento, Mala, FotoMala } from "@/lib/types"
import { SecaoFotos } from "@/components/checkin/secao-fotos"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CheckinConfirmacaoPage({ params }: PageProps) {
  const { id } = await params
  const [atendimentoResult, malasResult, fotosResult] = await Promise.all([
    query<Atendimento>("SELECT * FROM atendimentos WHERE id = $1", [id]),
    query<Mala>("SELECT * FROM malas WHERE atendimento_id = $1 ORDER BY created_at", [id]),
    query<FotoMala>(
      `SELECT f.*
         FROM fotos_malas f
         JOIN malas m ON m.id = f.mala_id
        WHERE m.atendimento_id = $1
        ORDER BY f.created_at`,
      [id]
    ),
  ])

  const atendimento = atendimentoResult.rows[0]
  if (!atendimento) {
    notFound()
  }

  const fotosPorMala = new Map<string, FotoMala[]>()
  for (const foto of fotosResult.rows) {
    const fotos = fotosPorMala.get(foto.mala_id) ?? []
    fotos.push(foto)
    fotosPorMala.set(foto.mala_id, fotos)
  }

  const malasComFotos = malasResult.rows.map((mala) => ({
    ...mala,
    fotos_malas: fotosPorMala.get(mala.id) ?? [],
  }))

  const horario = formatarDataHora(atendimento.data_checkin)
  const headerStore = await headers()
  const protocoloHttp = headerStore.get("x-forwarded-proto") ?? "http"
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000"
  const origin = process.env.APP_URL?.replace(/\/$/, "") || `${protocoloHttp}://${host}`
  const aceiteUrl = atendimento.aceite_token ? `${origin}/aceite/${atendimento.aceite_token}` : origin

  const whatsappLink = linkCheckinComAceite({
    telefone: atendimento.cliente_telefone,
    nome: atendimento.cliente_nome,
    protocolo: atendimento.protocolo,
    horario,
    aceiteUrl,
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success banner */}
      <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
        <p className="text-green-800 font-medium">Check-in realizado com sucesso!</p>
      </div>

      {/* Protocol */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Protocolo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <span className="bg-violet-100 text-violet-700 font-mono text-lg px-3 py-1 rounded-md">
            {atendimento.protocolo}
          </span>
          <span className="text-sm text-muted-foreground">
            Guarde este número para a retirada
          </span>
        </CardContent>
      </Card>

      {/* Client info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nome</span>
            <span className="font-medium">{atendimento.cliente_nome}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Telefone</span>
            <span className="font-medium">{formatarTelefone(atendimento.cliente_telefone)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{atendimento.cliente_documento_tipo ?? "Documento"}</span>
            <span className="font-medium">{atendimento.cliente_documento}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Horário</span>
            <span className="font-medium">{horario}</span>
          </div>
          {atendimento.valor_cobrado != null && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor cobrado</span>
              <span className="font-medium">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                  atendimento.valor_cobrado
                )}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pagamento</span>
            <span className="font-medium">{labelFormaPagamento(atendimento.forma_pagamento)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Aceite das regras</span>
            <span className={atendimento.aceite_em ? "font-medium text-green-700" : "font-medium text-amber-700"}>{atendimento.aceite_em ? "Confirmado" : "Pendente"}</span>
          </div>
          {atendimento.observacoes && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Observações</span>
              <span className="font-medium text-right max-w-[60%]">{atendimento.observacoes}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Malas + Fotos */}
      {malasComFotos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Malas ({malasComFotos.length}) — Fotos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SecaoFotos
              atendimentoId={atendimento.id}
              clienteNome={atendimento.cliente_nome}
              protocolo={atendimento.protocolo}
              whatsappLink={whatsappLink}
              malas={malasComFotos.map((m) => ({
                ...m,
                fotos: m.fotos_malas ?? [],
              }))}
            />
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild className="flex-1 bg-green-600 hover:bg-green-700">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4 mr-2" />
            Enviar Confirmação via WhatsApp
          </a>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/dashboard">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Voltar ao Painel
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/checkin">
            <PlusCircle className="h-4 w-4 mr-2" />
            Novo Check-in
          </Link>
        </Button>
      </div>
    </div>
  )
}
