# Implantação do RC 2ddf95c7dab5

- Horário da verificação: 2026-09-14 17:11:22 -03.
- Produção: `https://porta-malas.158.220.91.88.sslip.io`.
- Commit publicado: `2ddf95c7dab5286eca2fbbfc1bff7cbbb64ac4b9`.
- Imagem publicada: `sha256:831300b7ce8001f9ccb05e1ec9a4a55477e2a41fe3e61bc64e02a28f37bdb3dc`.
- Build ID do Next.js: `JOr7USM7hQPaMyGSzPHfE`.
- O build Docker concluiu com compilação, lint e validação de tipos aprovados.
- O container `porta-malas-bagpoint-1` foi recriado e ficou `healthy`.
- O endpoint público `/api/health` respondeu `{"status":"ok"}`.
- O banco permaneceu saudável e não houve migração nova neste RC.

Resultado observado: a nova imagem entrou em execução no serviço BagPoint, respondeu pelo endereço público e não apresentou erro nos logs iniciais.
