import { listarCategoriasMalaAtivas } from "@/lib/actions/categorias-mala"
import { listarParceiros } from "@/lib/actions/parceiros"
import { CheckinForm } from "@/components/checkin/checkin-form"

export default async function CheckinPage() {
  const [parceiros, categorias] = await Promise.all([
    listarParceiros(),
    listarCategoriasMalaAtivas(),
  ])

  return <CheckinForm parceirosIniciais={parceiros} categorias={categorias} />
}
