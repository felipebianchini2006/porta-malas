# Evidência de implantação

- RC: `a3d75f100f74c74c0fa1814d5d85eefc79b4dd22`.
- Ambiente: produção em `https://porta-malas.158.220.91.88.sslip.io`.
- Horário da verificação: `2026-09-14T09:31:52-03:00` em São Paulo.
- Imagem em execução: `sha256:6efc86a769e14ec70dc5dd94644e9a8c8c69801db0837d0f6c1d804a2fa8ab40`.
- Operação: validação do Compose, build com `npm ci`, compilação Next.js e recriação isolada de `porta-malas-bagpoint-1` com `--no-deps`.
- Resultado observado: 594 pacotes instalados com zero vulnerabilidades; build compilado, lint e tipos aprovados; 17 rotas geradas; aplicação pronta em 276 ms.
- Saúde pública: `{"status":"ok"}`.
- Backup: `/opt/porta-malas-backups/20260914T122046Z/database.dump`, 37.226 bytes.
- Uploads: `/opt/porta-malas-backups/20260914T122046Z/uploads.tar.gz`, 75.884.051 bytes.
- Rollback de código: `/opt/porta-malas-previous-pre-a3d75f1-20260914T0930Z`.

Os arquivos centrais têm o mesmo SHA-256 localmente e na VPS:

- `lib/utils/partner-referral.ts`: `9fce50ee2fc1c1db40037c0f1a4d932ed814d7558993acb90851699b617e01ce`.
- `components/admin/parceiro-qr-dialog.tsx`: `e7041d9c2e999251a3b6271a0eaa6d01bbe35068cd7210fe1658c6d594e16f67`.
- `components/checkin/partner-qr-scanner.tsx`: `7af2ff7fb3a8797954fd73c3694a332568a78c27c6247b46f3695144a91264d4`.
