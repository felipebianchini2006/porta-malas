# Guarda-Malas

Sistema de gerenciamento de guarda-volumes para operadores de pequeno porte (1–5 operadores).

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Estilização**: Tailwind CSS + shadcn/ui
- **Banco de dados / Auth / Storage**: Supabase
- **Toasts**: Sonner
- **Fontes**: Geist Sans / Geist Mono

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)

## Configuração

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd porta-malas
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` e preencha com as credenciais do seu projeto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key>
```

### 4. Execute a migração SQL

No **Supabase Dashboard > SQL Editor**, execute o arquivo de migração localizado em `supabase/migrations/` para criar as tabelas necessárias (`atendimentos`, `malas`, `fotos`).

### 5. Crie o primeiro usuário

No **Supabase Dashboard > Authentication > Users**, crie um usuário com e-mail e senha. Este será o operador inicial do sistema.

### 6. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) e faça login com o usuário criado.

## Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase (encontrada em Project Settings > API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima pública do Supabase (encontrada em Project Settings > API) |

## Configuração do Supabase

### Autenticação

- Em **Authentication > Settings**, desative a confirmação de e-mail ("Enable email confirmations") para facilitar o uso interno.

### Storage

- Em **Storage**, crie um bucket chamado `fotos-malas`.
- Defina as políticas (policies) do bucket para permitir leitura/escrita autenticada, de acordo com as necessidades do seu ambiente.

## Funcionalidades

- Autenticação segura via Supabase Auth
- Dashboard com estatísticas de ocupação em tempo real
- Fluxo completo de check-in com registro de malas e upload de fotos
- Fluxo de retirada com busca por protocolo, nome ou telefone
- Relatório com exportação em CSV e Excel
- Layout responsivo com sidebar para desktop e menu hamburguer para mobile
