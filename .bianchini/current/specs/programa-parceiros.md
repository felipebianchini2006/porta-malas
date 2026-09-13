# Programa de Parceiros BagPoint

## Cadastro

Somente administradores podem criar e editar parceiros. O cadastro registra grupo, categoria, identificação PF/PJ, CPF/CNPJ, contato, endereço, código de indicação, regra de desconto e comissão, dia de repasse, PIX, status e dados opcionais de hospedagem.

O código de indicação e o documento do parceiro são únicos. Somente parceiros ativos aparecem no check-in.

## Check-in indicado

Todo check-in exige nome do cliente, CPF ou passaporte, telefone WhatsApp e lacre em cada mala. A operação é transacional.

Ao selecionar um parceiro, todas as malas precisam de categoria de preço. O sistema calcula e persiste:

- valor bruto;
- percentual e valor do desconto do cliente;
- percentual e valor da comissão do parceiro;
- valor cobrado;
- valor líquido da BagPoint;
- competência mensal.

Esses campos são um snapshot. Uma mudança futura no cadastro do parceiro não altera check-ins antigos.

## Aceite das regras

Cada check-in recebe um token aleatório e um link público de aceite. O link entra na mensagem pronta para WhatsApp. A página pública exibe somente nome, protocolo, quantidade de malas e versão das regras.

Aceitar mais de uma vez mantém o primeiro horário registrado. Não há assinatura eletrônica certificada ou integração automática com a API do WhatsApp.

## Repasses e extrato

O painel administrativo consolida um repasse por parceiro e competência. Reprocessar a mesma competência atualiza valores em aberto, sem duplicar linhas e sem alterar repasses pagos.

O painel mostra volume, composição financeira, PIX, vencimento, alerta, status e referência do comprovante. Marcar como pago exige a referência. Toda mudança de status gera um evento de auditoria.

O extrato individual lista os check-ins, malas, valores, comissão e situação do aceite. A exportação mensal gera `.xlsx` compatível com Excel.

## Fonte de verdade e recuperação

O PostgreSQL é a fonte canônica. O backup existente de banco cobre parceiros, snapshots, repasses, eventos e aceites. O rollback da aplicação preserva o schema aditivo e os dados; nenhuma migração destrutiva faz parte desta entrega.
