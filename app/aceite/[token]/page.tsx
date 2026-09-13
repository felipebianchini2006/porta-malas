import { notFound } from "next/navigation"

import { AceiteForm } from "@/components/aceite/aceite-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buscarAtendimentoAceite } from "@/lib/actions/aceite"
import { formatarDataHora } from "@/lib/utils/date-time"

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function AceitePage({ params }: PageProps) {
  const { token } = await params
  const atendimento = await buscarAtendimentoAceite(token)
  if (!atendimento) notFound()

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-xl space-y-5">
        <div className="text-center"><div className="text-4xl">🧳</div><h1 className="mt-2 text-2xl font-bold text-slate-900">Aceite do check-in</h1><p className="mt-1 text-sm text-muted-foreground">Bag Point · Protocolo {atendimento.protocolo}</p></div>
        <Card>
          <CardHeader><CardTitle className="text-lg">Olá, {atendimento.cliente_nome}</CardTitle></CardHeader>
          <CardContent className="space-y-5 text-sm leading-6 text-slate-700">
            <p>Confirme as regras para a guarda de {atendimento.quantidade_malas} {atendimento.quantidade_malas === 1 ? "bagagem" : "bagagens"}.</p>
            <div className="rounded-lg bg-slate-50 p-4"><ul className="list-disc space-y-2 pl-5"><li>Guarde o protocolo e apresente-o na retirada.</li><li>Confira se o lacre de cada bagagem está correto.</li><li>Objetos frágeis, perecíveis ou proibidos devem ser informados à equipe.</li><li>A retirada será registrada no sistema para encerrar a guarda.</li><li>Em caso de divergência, procure a equipe antes de sair do local.</li></ul></div>
            <p className="text-xs text-muted-foreground">Versão das regras: {atendimento.aceite_versao}{atendimento.aceite_em ? ` · Aceite em ${formatarDataHora(atendimento.aceite_em)}` : ""}</p>
            <AceiteForm token={token} alreadyAccepted={Boolean(atendimento.aceite_em)} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
