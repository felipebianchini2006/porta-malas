import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, MessageCircle, LayoutDashboard, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { linkCheckin } from "@/lib/utils/whatsapp"
import { formatarTelefone } from "@/lib/utils/protocolo"
import { Atendimento, Mala, FotoMala } from "@/lib/types"
import { SecaoFotos } from "@/components/checkin/secao-fotos"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CheckinConfirmacaoPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("atendimentos")
    .select("*, malas(*, fotos_malas(*))")
    .eq("id", id)
    .single()

  if (error || !data) {
    notFound()
  }

  type MalaComFotos = Mala & { fotos_malas: FotoMala[] }
  const atendimento = data as Atendimento
  const malasComFotos = ((atendimento.malas ?? []) as unknown) as MalaComFotos[]

  const horario = new Date(atendimento.data_checkin).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const whatsappLink = linkCheckin(
    atendimento.cliente_telefone,
    atendimento.cliente_nome,
    atendimento.protocolo,
    horario
  )

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
