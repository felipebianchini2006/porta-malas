# Homologação de produção — RC fa6074a981b0

## Veredito

**ACEITO**

O RC `fa6074a981b07b89b1449924b9fd10df8a0f814b` foi publicado e homologado no sistema real. O comprovante de retirada contém o convite solicitado e o link correto de avaliação. Não existe finding aberto.

## Cenários

| Cenário | Resultado observado | Evidência | SHA-256 |
|---|---|---|---|
| Implantação | Imagem construída, container saudável, endpoint público `ok` e logs iniciais limpos. | `deployment.md` | `2e57f1b4acdf3cb91ec921c14b8f2d1a949f7bd5f2b9c3fff975abcccaa01004` |
| Comprovante de retirada | Mensagem preserva os dados do atendimento e inclui convite e link correto do Google. | `receipt-message.md` | `7ddf0da82708037248bcfba656789a8bcf641a923c11bfcc7ed843b0187482e2` |
| Continuidade | Backup íntegro, dados presentes, rollback preparado e serviços vizinhos ativos. | `continuity.md` | `e02c10201146f24ba3ea2ae53b31ebad32b5abcdf90ca92e6ae969ddd0fa8196` |

## Prontidão operacional

- Produção: `https://porta-malas.158.220.91.88.sslip.io`.
- RC final: `fa6074a981b0`.
- Imagem: `sha256:bdb381cd1115138cd341f9ab1a54a1144a119bf25f62181f5fcea7e562ca383e`.
- Testes locais: 30/30 aprovados; lint, typecheck e build aprovados.
- Backup e rollback: preparados antes da troca.
- Migração: não necessária.
- Finding aberto: nenhum.
- Limite da homologação: não foi confirmada uma retirada real nem enviada mensagem a um cliente; a composição do link e o conteúdo foram verificados de forma determinística e no chunk publicado.
