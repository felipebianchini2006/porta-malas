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

Na VPS compartilhada atual, use também o override `deploy/compose.proxy.yaml` para conectar somente o serviço `bagpoint` à rede do Caddy existente. O nome exclusivo evita colisão com serviços `app` de outros projetos:

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

## Programa de parceiros

O painel administrativo gera um QR Code para cada parceiro cadastrado. A imagem ou o link pode ser compartilhado por WhatsApp. No check-in, a câmera ou uma imagem salva identifica automaticamente somente parceiros ativos e aplica as regras já cadastradas de desconto e comissão.

## Fotos e confirmação no check-in

As cópias com o lacre são preparadas assim que as fotos ficam disponíveis. O botão **Compartilhar agora** só é habilitado quando os arquivos estão prontos. A abertura nativa ocorre no clique, conforme a exigência de ativação do [Web Share](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share).

Se o navegador não permitir compartilhar arquivos, cada foto também pode ser baixada pelo seu link. Depois, use **Abrir conversa no WhatsApp** para anexar as fotos. O envio da confirmação abre o WhatsApp na mesma aba, sem exigir pop-up. A mensagem mantém o protocolo e o link de aceite das regras.

A regressão de navegador está em `tests/checkin-sharing.browser.py`. Execute em um ambiente com banco exclusivo de QA, um check-in de protocolo `QA-D004`, uma foto de lacre `QA-LACRE` e Playwright para Python com Chromium e WebKit. Defina `CHECKIN_URL`, `QA_EMAIL` e `QA_PASSWORD`. O teste intercepta o WhatsApp e não envia mensagens. Para build de produção, use HTTPS também no ambiente de teste por causa do cookie seguro.
