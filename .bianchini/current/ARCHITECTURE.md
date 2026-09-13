# Arquitetura atual

O sistema opera de forma autocontida em uma VPS.

- Next.js concentra UI, Server Actions, autenticação e rotas de upload/exportação.
- PostgreSQL 16 é a origem de verdade de usuários, parceiros, atendimentos, malas e referências de fotos.
- Sessões são cookies `HttpOnly` assinados com HMAC-SHA256; senhas usam `scrypt` com salt individual.
- Fotos ficam em volume Docker persistente e só são lidas por rota autenticada.
- Migrations são aplicadas em ordem, uma vez, antes de iniciar o servidor.
- Check-in, geração de protocolo e retirada usam transações; o contador diário evita protocolos duplicados.
- O check-in exige nome, CPF ou passaporte, WhatsApp e lacre em cada mala.
- Quando há parceiro ativo, o check-in calcula desconto e comissão sobre os preços das categorias e salva um snapshot da regra usada.
- O cadastro completo de parceiros, os dados PIX e a baixa de repasses são exclusivos do administrador.
- Repasses são materializados por parceiro e competência com chave única. Atualizações não sobrescrevem repasses pagos.
- Cada alteração de status do repasse gera um evento de auditoria com usuário, status anterior e novo status.
- O aceite das regras usa token aleatório por check-in. A confirmação pública é idempotente e expõe apenas os dados mínimos do atendimento.
- O compartilhamento usa um link `wa.me`; não há integração automática com a API do WhatsApp nem envio real de PIX.
- Banco, uploads, rede e containers são exclusivos desta aplicação.
- A publicação externa usa o Caddy existente por uma rede Docker compartilhada somente com o app; a porta direta permanece ligada a `127.0.0.1`.

## Operação

- Deploy: `docker compose up -d --build`.
- Saúde: `GET /api/health` valida o banco.
- Backup: `scripts/backup.sh` gera dump PostgreSQL e arquivo dos uploads.
- Rollback: preservar `.env`, volumes e release anterior; não usar `docker compose down -v`.
- Migração do programa: `004_programa_parceiros.sql` é aditiva. O retorno do código não exige remover as novas tabelas ou colunas.
