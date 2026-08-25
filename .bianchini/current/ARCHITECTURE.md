# Arquitetura atual

O sistema opera de forma autocontida em uma VPS.

- Next.js concentra UI, Server Actions, autenticação e rotas de upload/exportação.
- PostgreSQL 16 é a origem de verdade de usuários, parceiros, atendimentos, malas e referências de fotos.
- Sessões são cookies `HttpOnly` assinados com HMAC-SHA256; senhas usam `scrypt` com salt individual.
- Fotos ficam em volume Docker persistente e só são lidas por rota autenticada.
- Migrations são aplicadas em ordem, uma vez, antes de iniciar o servidor.
- Check-in, geração de protocolo e retirada usam transações; o contador diário evita protocolos duplicados.
- Banco, uploads, rede e containers são exclusivos desta aplicação.
- A publicação externa exige proxy HTTPS; a porta do app permanece ligada a `127.0.0.1`.

## Operação

- Deploy: `docker compose up -d --build`.
- Saúde: `GET /api/health` valida o banco.
- Backup: `scripts/backup.sh` gera dump PostgreSQL e arquivo dos uploads.
- Rollback: preservar `.env`, volumes e release anterior; não usar `docker compose down -v`.
