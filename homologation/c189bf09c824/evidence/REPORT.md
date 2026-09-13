# Relatório de homologação — RC c189bf09c824

## Veredito

**ACEITO**

O RC `c189bf09c824` foi publicado e homologado no sistema real. Todos os cenários obrigatórios passaram e não existe finding aberto.

## Escopo validado

1. Check-in com nome, CPF/passaporte, WhatsApp e lacre obrigatórios.
2. Programa de parceiros com desconto, comissão, PIX, regras, repasses e auditoria.
3. Exportação mensal de repasses em Excel.
4. Compatibilidade com a tarifa legada que já possui desconto de parceiro embutido.
5. Preservação dos dados, da aplicação NeuroTests e do proxy compartilhado.

## Cenários e evidências

| Cenário | Resultado observado | Evidência | SHA-256 |
|---|---|---|---|
| Implantação isolada | Build concluído, container BagPoint saudável e endpoints interno e público retornando status `ok`. | `deployment.md` | `efe40ff402e8134fbd5e463d4a7ae8deecf9a027f8c3130e00cad1d88bf654b0` |
| Check-in e parceiros | Cinco grupos de dados obrigatórios visíveis; proteção dupla contra desconto duplicado; nenhum registro de teste criado. | `checkin.md` | `275b4db3fe819c47a18fa0001a715174db32cb036fe827acf40c8c13bd7b526e` |
| Administração | Telas de parceiros e repasses renderizadas; exportação disponível no fluxo e corretamente desabilitada sem dados. | `admin.md` | `a606aabc25244847cd24059d5aca8a601f4bb11d74051559a18c18f97edb1969` |
| Continuidade | Contagens de produção preservadas, quatro migrações aplicadas e serviços vizinhos mantidos ativos. | `continuity.md` | `2f6b03b3b41cd718cb29f31b7155eb80b365bb2f27cc42140b38c9ff723f6990` |

## Finding corrigido durante a homologação

- Finding: uma categoria antiga chamada `Mala, Mochila ou Bolsa PARCEIRO` já armazenava o valor com 5% de desconto. Selecioná-la junto a um parceiro do novo programa poderia descontar mais 5%.
- Correção: categorias identificadas como tarifa de parceiro são removidas da seleção quando há parceiro ativo; o servidor também bloqueia requisições incompatíveis.
- Novo RC: `c189bf09c824`.
- Reteste: teste automatizado específico aprovado, build de produção aprovado, hashes local/remoto idênticos e jornadas públicas sem erro no console.

## Checks finais

- Testes: 25 aprovados, 0 falhas.
- Lint: aprovado com zero avisos.
- TypeScript: aprovado sem erros.
- Build Next.js: aprovado na VPS.
- Banco: 5 usuários, 14 atendimentos, 33 malas e 31 fotos, sem perda.
- Migração do programa: `004_programa_parceiros.sql` aplicada.
- Rollback de dados e código: disponível na VPS.

Data da homologação: 13/09/2026 no horário de São Paulo; 14/09/2026 no horário configurado da VPS.
