# Continuidade e recuperação

- Backup criado antes da troca em `/opt/porta-malas-backups/20260914T200135Z`.
- Banco: 38.729 bytes, SHA-256 `5c4d03757e2c594c139159bd6e2a1e880981a2198d409c702458097c38abee72`.
- Uploads: 77.543.650 bytes, SHA-256 `eb75aa5057f995f9b02343bb8df413f070548c3a35dafb8674972c57f27d71f6`.
- Código anterior preservado em `/opt/porta-malas-previous-pre-73e54bc-20260914T200135Z`.
- Volumes persistentes confirmados: `porta-malas_postgres_data` e `porta-malas_uploads_data`.
- Estado pós-publicação: 5 usuários, 15 atendimentos, 35 malas, 33 fotos, 1 parceiro e 33 arquivos de upload.
- NeuroTests, banco do NeuroTests e Caddy permaneceram ativos durante a publicação.

Resultado observado: dados e uploads continuaram montados nos mesmos volumes, os serviços vizinhos não foram reiniciados e existe caminho de rollback do código e dos dados.
