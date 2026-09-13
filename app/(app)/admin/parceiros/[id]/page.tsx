import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound, redirect } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buscarParceiroAdmin } from "@/lib/actions/parceiros"
import { listarIndicacoesParceiro } from "@/lib/actions/repasses"
import { getCurrentUser } from "@/lib/auth/session"
import { formatarDataHora } from "@/lib/utils/date-time"

interface PageProps { params: Promise<{ id: string }> }

const moeda = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

export default async function ParceiroExtratoPage({ params }: PageProps) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "admin") redirect("/dashboard")
  const { id } = await params
  const [parceiro, indicacoes] = await Promise.all([buscarParceiroAdmin(id), listarIndicacoesParceiro(id)])
  if (!parceiro) notFound()
  const total = indicacoes.reduce((sum, item) => sum + item.comissao_valor, 0)

  return <div className="space-y-6"><Button variant="ghost" asChild><Link href="/admin/parceiros"><ArrowLeft className="h-4 w-4" />Voltar aos parceiros</Link></Button><div><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold text-slate-900">{parceiro.nome}</h1><Badge>{parceiro.status.replaceAll("_", " ")}</Badge></div><p className="mt-1 font-mono text-sm text-muted-foreground">{parceiro.codigo_indicacao} · {parceiro.grupo} / {parceiro.categoria}</p></div><div className="grid gap-4 md:grid-cols-3"><Card><CardHeader><CardTitle className="text-sm">Regra comercial</CardTitle></CardHeader><CardContent className="text-sm"><p>{parceiro.desconto_percentual}% de desconto ao cliente</p><p>{parceiro.comissao_percentual}% de comissão</p><p>Repasse no dia {parceiro.dia_repasse}</p></CardContent></Card><Card><CardHeader><CardTitle className="text-sm">PIX</CardTitle></CardHeader><CardContent className="text-sm"><p className="break-all">{parceiro.pix_chave || "Não cadastrado"}</p><p className="text-muted-foreground">{parceiro.pix_tipo} · {parceiro.pix_titular}</p></CardContent></Card><Card><CardHeader><CardTitle className="text-sm">Resultado acumulado</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{moeda(total)}</p><p className="text-xs text-muted-foreground">{indicacoes.length} indicação(ões)</p></CardContent></Card></div><Card><CardHeader><CardTitle className="text-base">Extrato de indicações</CardTitle></CardHeader><CardContent>{indicacoes.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma indicação registrada.</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-xs uppercase text-slate-500"><tr><th className="py-2">Protocolo</th><th>Check-in</th><th>Malas</th><th>Bruto</th><th>Desconto</th><th>Comissão</th><th>Aceite</th></tr></thead><tbody className="divide-y">{indicacoes.map((item) => <tr key={item.id}><td className="py-3 font-mono text-xs">{item.protocolo}</td><td>{formatarDataHora(item.data_checkin)}</td><td>{item.quantidade_malas}</td><td>{moeda(item.valor_bruto)}</td><td>{moeda(item.desconto_valor)}</td><td className="font-medium text-green-700">{moeda(item.comissao_valor)}</td><td>{item.aceite_em ? "Confirmado" : "Pendente"}</td></tr>)}</tbody></table></div>}</CardContent></Card></div>
}
