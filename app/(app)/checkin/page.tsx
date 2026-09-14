import { listarCategoriasMalaAtivas } from "@/lib/actions/categorias-mala"
import { listarParceiros } from "@/lib/actions/parceiros"
import { CheckinForm } from "@/components/checkin/checkin-form"

interface CheckinPageProps {
  searchParams: Promise<{ parceiro?: string }>
}

export default async function CheckinPage({ searchParams }: CheckinPageProps) {
  const { parceiro } = await searchParams
  const [parceiros, categorias] = await Promise.all([
    listarParceiros(),
    listarCategoriasMalaAtivas(),
  ])

  return <CheckinForm parceirosIniciais={parceiros} categorias={categorias} codigoParceiroInicial={parceiro} />
}
