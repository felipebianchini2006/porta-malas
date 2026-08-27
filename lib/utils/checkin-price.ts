interface MalaComCategoria {
  categoria_id?: string | null
}

interface CategoriaComPreco {
  id: string
  preco_diaria: number | string
}

export function calcularTotalMalas(
  malas: MalaComCategoria[],
  categorias: CategoriaComPreco[]
): number {
  const precos = new Map(
    categorias.map((categoria) => [categoria.id, Number(categoria.preco_diaria) || 0])
  )
  const total = malas.reduce(
    (soma, mala) => soma + (mala.categoria_id ? (precos.get(mala.categoria_id) ?? 0) : 0),
    0
  )

  return Math.round((total + Number.EPSILON) * 100) / 100
}
