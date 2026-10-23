# D004 — Compartilhamento de fotos e confirmação

Data: 23/10/2026. Código: commit `765b1ea`, enviado para `origin/dev/porta-malas-vps`.

## Causa e correção

O clique aguardava fetch, decode e canvas antes de chamar Web Share ou abrir uma nova janela. O atraso pode invalidar a ativação transitória exigida pelo navegador. O tratamento de NotAllowedError apenas sugeria repetir o clique. A confirmação exigia uma nova aba.

A preparação ocorre antecipadamente. O botão fica indisponível até os arquivos estarem prontos e chama a API nativa no clique. Erros oferecem downloads individuais e acesso direto ao WhatsApp. A confirmação usa navegação na mesma aba. O protocolo, a mensagem, o link de aceite e o lacre nas fotos foram preservados.

## Provas locais

- `npm ci --no-audit --no-fund`: dependências instaladas com o gerenciador existente.
- `npm test`: 30 testes aprovados.
- `npm run typecheck`, `npm run lint`, `npm run build`: aprovados.
- `python3 tests/checkin-sharing.browser.py`, com `CHECKIN_URL`, `QA_EMAIL` e `QA_PASSWORD` de ambiente isolado: RED com `SHARE_LOST_USER_ACTIVATION`; GREEN com o mesmo arquivo em Chromium e WebKit. As provas e os comandos completos ficam em `results/`.
- Teste adicional com Playwright/WebKit em 390 × 844: upload real pela tela, atualização das fotos, download por lacre, erro HTTP na preparação e recuperação pelo botão. Sem rolagem horizontal.
- A execução adicional contra build local em HTTP expôs a restrição de cookie Secure no WebKit. Foi distinguida da falha do produto: a mesma sessão funcionou em produção via HTTPS.

## Publicação e verificação

O contexto de build veio da aplicação existente em `/opt/porta-malas`. Somente `components/checkin/compartilhar-fotos.tsx` e `app/(app)/checkin/[id]/page.tsx` foram substituídos. O package.json e o package-lock.json da VPS conferem com o checkout. O build Docker passou com Next.js 15.5.24.

Comandos de ativação: `docker build -t porta-malas-bagpoint:d004 .`, tag da imagem para `porta-malas-bagpoint:latest` e `docker compose -f compose.yaml -f deploy/compose.proxy.yaml up -d --no-deps --no-build bagpoint`.

Imagem publicada: `dd29910b78cf`. Healthcheck saudável, `/api/health` respondeu `{"status":"ok"}`. Rede e alias `porta-malas-app` preservados. Nenhuma alteração de schema ou dados reais nesta correção.

SHA256 dos fontes local e remoto:

- Compartilhamento: `63fecdd303cb1b8adb56a2d14d99bf1fcf615fa2706f2e655669396f88c4070f`.
- Confirmação: `4dc80800fbc9331d0de46e873219bc985907a1dc1e261ef8ddafacee5e2f4cbe`.

Smoke automatizado de produção, em Chromium e WebKit via HTTPS, usando somente leitura de um check-in existente: autenticação, preparação de fotos reais, chamada de share com clique ativo e arquivos JPEG não vazios, links de download, largura móvel e navegação da confirmação na mesma aba aprovados. O destino `wa.me` foi interceptado; nenhuma mensagem foi enviada.

BagPoint e NeuroTests: cinco respostas HTTPS 200 para cada um após a publicação. NeuroTests permaneceu com o mesmo contêiner e início em 19/10/2026, sem reinício. Banco e volumes persistentes não foram recriados.

## Revisão e limite da prova

Revisão do diff: resultados de preparações antigas são descartados; object URLs são revogadas na troca das fotos e desmontagem; cancelamento libera o botão; falhas não compartilham apenas um subconjunto silencioso. Sem alteração de permissões, contrato de upload ou dados do cliente.

A abertura da integração com o sistema operacional foi observada por uma sonda na fronteira `navigator.share`; não foi feito envio real pelo aplicativo WhatsApp de um celular físico. O caminho alternativo permanece visível se o dispositivo recusar o compartilhamento nativo.

O layout antigo dos registros do Bianchini Method foi migrado pelo comando `bm workspace migrate --repo /Users/felipebianchini/Developer/porta-malas`, exigido pelo CLI instalado. Os casos anteriores foram preservados nos novos caminhos.
