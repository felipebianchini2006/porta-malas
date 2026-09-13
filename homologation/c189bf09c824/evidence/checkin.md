# Cenário: check-in obrigatório e programa de parceiros

- Ambiente: produção, navegador autenticado, viewport desktop de 1280 × 720.
- Rota: `/checkin`.
- Resultado: aprovado.
- Observado no sistema real: o formulário exibe `Nome completo *`, `Telefone / WhatsApp *`, `Documento *`, `Número do documento *` e `Lacre *` como campos obrigatórios.
- Observado no sistema real: a escolha de documento contém CPF e suporta o fluxo de passaporte previsto pela implementação.
- Observado no sistema real: as categorias existentes continuam disponíveis quando nenhum parceiro é selecionado e o total é calculado por mala.
- Compatibilidade: a categoria legada `Mala, Mochila ou Bolsa PARCEIRO`, que já contém 5% no preço, não pode receber novamente o desconto do novo programa quando houver parceiro selecionado.
- Defesa em profundidade: a interface remove categorias legadas com desconto embutido e a ação de servidor rejeita qualquer tentativa equivalente enviada fora da interface.
- Teste automatizado específico: `impede aplicar o programa sobre categoria com desconto de parceiro já embutido` passou.
- Preservação de produção: nenhum check-in nem parceiro de teste foi criado para esta homologação.
