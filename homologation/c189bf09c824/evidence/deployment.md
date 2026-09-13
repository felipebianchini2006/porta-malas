# Evidência de implantação

- RC de aplicação: `c189bf09c824`
- Ambiente: produção, `https://porta-malas.158.220.91.88.sslip.io`
- Verificação registrada em: `2026-09-14T01:15:38+02:00`
- Imagem em execução: `sha256:a254ebd9dab9adf302702fbae0ade79f8cd97f788ad734a2522b9d1d31018236`
- Serviço atualizado: `porta-malas-bagpoint-1`
- Procedimento: validação do Compose, build da imagem e recriação isolada com `--no-deps`.
- Resultado observado: o build de produção do Next.js compilou, validou lint e tipos, gerou as 17 rotas e iniciou o servidor em 234 ms.
- Saúde interna: `{"status":"ok"}` em `http://127.0.0.1:3100/api/health`.
- Saúde pública: `{"status":"ok"}` em `https://porta-malas.158.220.91.88.sslip.io/api/health`.
- Backup de dados: `/opt/porta-malas-backups/20260913T225810Z`.
- Cópia de rollback imediatamente anterior ao RC final: `/opt/porta-malas-previous-pre-c189bf0-20260913T2315Z`.
- O dump do PostgreSQL foi restaurado previamente em container descartável com as contagens esperadas. O arquivo de uploads contém 74 entradas.

Os arquivos críticos da origem e da VPS possuem os mesmos SHA-256:

- `components/checkin/checkin-form.tsx`: `ec614a2903736ac37305817fb8f68841dc3ad1b0017e182a89ec87ae539581ee`
- `lib/actions/checkin.ts`: `2600c5bee46d50bb957a6d3af859fe0543e196028c63bbbee8e1760202b71f97`
- `lib/utils/partner-program.ts`: `8bdb4e1ac7f85d98c4f9e6cefd4f2ba14c5ecfc96b8154194d6a25aed13638e2`
- `tests/partner-program.test.ts`: `f8150ca3c6dc0904eccd1278b864fa7fae91853302809946f3707a5642abbed9`
- `migrations/004_programa_parceiros.sql`: `3ba8d884cb4bf8a33bda04b183b59aa15fea0933eb1c2a8ccf7cc30813f7fdbd`
