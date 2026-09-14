# Homologação de produção — RC 2ddf95c7dab5

## Veredito

**BLOQUEADO PARA ACEITE FÍSICO DA CÂMERA**

O RC `2ddf95c7dab5286eca2fbbfc1bff7cbbb64ac4b9` está publicado, saudável e pronto para uso. A configuração de captura traseira foi confirmada no documento servido em produção. O aceite integral permanece bloqueado somente porque não havia um celular com câmera conectado para executar a abertura e a leitura reais.

## Cenários

| Cenário | Resultado observado | Evidência | SHA-256 |
|---|---|---|---|
| Implantação | Imagem construída, container saudável, endpoint público `ok` e logs iniciais limpos. | `deployment.md` | `601d8dfef1c573af099f0b2660e36e39fdd48da1dcf88da222907c77d3736901` |
| Fluxo de câmera | Botão publicado; captura traseira e galeria configuradas separadamente; árvore assistiva sem controles técnicos duplicados. | `camera-flow.md` | `3bcbb1d20d4c3c3d6a19b1e7a058ca2549000e695717fc7e4bd9f3e7e645cfa9` |
| Continuidade | Backup íntegro, volumes preservados, dados presentes e serviços vizinhos ativos. | `continuity.md` | `1ab836cfe71bfa1bce8553c839c3fd81fc77a4278d568ab5efd4cf52120eca10` |
| Câmera física | Não executado: nenhum aparelho com câmera estava disponível no ambiente de homologação. | `camera-flow.md` | `3bcbb1d20d4c3c3d6a19b1e7a058ca2549000e695717fc7e4bd9f3e7e645cfa9` |

## Prontidão operacional

- Produção publicada: `https://porta-malas.158.220.91.88.sslip.io`.
- RC final: `2ddf95c7dab5`.
- Imagem: `sha256:831300b7ce8001f9ccb05e1ec9a4a55477e2a41fe3e61bc64e02a28f37bdb3dc`.
- Testes locais: 29/29 aprovados; lint, typecheck e build aprovados.
- Backup e rollback: preparados antes da troca.
- Migração: não necessária.
- Finding aberto: nenhum.
- Ação restante: abrir `/checkin` no celular do cliente, tocar em `Abrir câmera e ler QR Code`, fotografar um QR válido e confirmar a seleção automática do parceiro.
