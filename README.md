# Guarda-Malas

Sistema interno de guarda-volumes para equipes pequenas. A aplicação é autocontida e roda em uma VPS com Next.js, PostgreSQL e armazenamento persistente de fotos.

## Stack

- Next.js 15 e TypeScript
- PostgreSQL 16
- Autenticação própria com senha `scrypt` e sessão `HttpOnly`
- Fotos em volume persistente local
- Docker Compose

## Executar na VPS

Requisitos: Docker Engine com Docker Compose.

```bash
cp .env.example .env
# preencha senhas fortes antes de iniciar
docker compose up -d --build
docker compose ps
curl -f http://127.0.0.1:3100/api/health
```

O primeiro start aplica as migrations em ordem e cria o administrador informado em `.env`. A criação é idempotente: reiniciar não duplica o usuário.

Por padrão, a aplicação escuta apenas em `127.0.0.1:3100`. Publique por HTTPS usando o proxy reverso já existente na VPS. Um modelo está em `deploy/nginx.conf.example`.

Na VPS compartilhada atual, use também o override `deploy/compose.proxy.yaml` para conectar somente o app à rede do Caddy existente:

```bash
docker compose -f compose.yaml -f deploy/compose.proxy.yaml up -d --build
```

## Variáveis

| Variável | Uso |
|---|---|
| `POSTGRES_PASSWORD` | Senha do PostgreSQL interno |
| `SESSION_SECRET` | Segredo de sessão com pelo menos 32 caracteres |
| `ADMIN_EMAIL` | Login do administrador inicial |
| `ADMIN_PASSWORD` | Senha inicial, com pelo menos 8 caracteres |
| `ADMIN_NAME` | Nome do administrador |
| `APP_BIND` | Interface publicada pelo Docker; padrão `127.0.0.1` |
| `APP_PORT` | Porta local; padrão `3100` |

Não versione `.env`.

## Persistência e backup

Os volumes `postgres_data` e `uploads_data` guardam banco e fotos. Não use `docker compose down -v` em produção.

```bash
./scripts/backup.sh
```

O comando só termina com sucesso quando os dois arquivos de backup são não vazios. Copie os backups para outro servidor ou storage periodicamente.

## Desenvolvimento e verificação

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
docker compose config
```
