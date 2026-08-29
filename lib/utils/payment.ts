export const FORMAS_PAGAMENTO = ["credito", "debito", "pix", "dinheiro"] as const

export type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number]

export const OPCOES_FORMA_PAGAMENTO: ReadonlyArray<{
  value: FormaPagamento
  label: string
}> = [
  { value: "credito", label: "Crédito" },
  { value: "debito", label: "Débito" },
  { value: "pix", label: "PIX" },
  { value: "dinheiro", label: "Dinheiro" },
]

export function formaPagamentoValida(value: unknown): value is FormaPagamento {
  return typeof value === "string" && FORMAS_PAGAMENTO.some((option) => option === value)
}

export function labelFormaPagamento(value: FormaPagamento | null | undefined): string {
  return OPCOES_FORMA_PAGAMENTO.find((option) => option.value === value)?.label ?? "Não informado"
}
