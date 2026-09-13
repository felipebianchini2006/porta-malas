---
{
  "acceptance": [
    "Administrador cadastra e edita parceiro com grupo, categoria, documentos, contato, endereço, PIX, percentuais, vencimento, status e código único.",
    "Check-in exige nome, CPF ou passaporte, WhatsApp e lacre por mala; parceiro selecionado aplica desconto e comissão e grava os valores e percentuais usados.",
    "Repasses mensais podem ser consultados por competência, marcados como pagos com data e referência de comprovante, preservando histórico e ajustes.",
    "Painel e extrato mostram indicadores, alertas de vencimento e composição do repasse; exportação gera arquivo .xlsx compatível com Excel.",
    "Atendimento possui link público de aceite das regras que pode ser compartilhado por WhatsApp e registra aceite rastreável e idempotente."
  ],
  "base_head": "e4656989787b460396bb07db3a0b4dac5e2c81e8",
  "created_at": "2026-09-13T22:13:11+00:00",
  "digest": "a26f701adee8cc9f4161c3f3077c1028a2582fdec28352ca7dfb6ff43b031b23",
  "docviva_before": {
    ".bianchini/current/ARCHITECTURE.md": "05c8ec3cc1a6f62857f44dec3450a18dd9e6ddc51e148c603eabb3142b1ec151",
    ".bianchini/current/SYSTEM_MODEL.md": "ad6e34a11e07b103101d58072a5c52b4c5419b627319d1e9f4eb3562e852f6dc",
    ".bianchini/current/specs/runtime-vps.md": "1952901c450c78873deef5678ea8714f482fe3039ecd4c79179f414af5bcf54e"
  },
  "docviva_contract": 1,
  "flow": {
    "payment": false,
    "webhook": false
  },
  "guards": [
    "Dados pessoais e financeiros exigem sessão; apenas administrador altera configuração e confirma pagamento.",
    "idempotency: aceite público e fechamento mensal não duplicam efeitos em repetição.",
    "migration_verify: migrações são somente aditivas, compatíveis e verificadas contra schema limpo e atualização.",
    "persistence: regra e valores usados são persistidos antes de confirmar o check-in.",
    "reconciliation: cada repasse lista exatamente os atendimentos e ajustes que compõem o total.",
    "rollback: código pode voltar sem apagar colunas/tabelas; migração não destrói dados.",
    "sandbox: provas usam testes locais e build; sem deploy ou ação financeira real.",
    "source_of_truth: PostgreSQL é a fonte canônica para parceiro, snapshots, repasses e aceite."
  ],
  "id": "Q003-implementar-o-programa-de-parceiros-bagpoint-com",
  "missing_guards": [
    "backup_restore",
    "idempotency",
    "local_contract",
    "migration_verify",
    "persistence",
    "reconciliation",
    "rollback",
    "sandbox",
    "source_of_truth"
  ],
  "model_before": {
    "capabilities": [
      "autenticacao-local",
      "gestao-usuarios",
      "checkin",
      "fotos-locais",
      "retirada",
      "parceiros",
      "relatorios"
    ],
    "contracts": [
      "sessao-hmac",
      "database-url",
      "upload-dir",
      "health-db",
      "backup-db-uploads"
    ],
    "data": [
      "usuarios",
      "parceiros",
      "atendimentos",
      "malas",
      "fotos_malas",
      "protocol_counters",
      "schema_migrations"
    ],
    "effects": [
      "postgres-write",
      "filesystem-write",
      "http-cookie"
    ],
    "integrations": [],
    "interfaces": [
      "next-pages",
      "server-actions",
      "api-health",
      "api-uploads",
      "api-export"
    ],
    "invariants": [
      "email-usuario-unico",
      "protocolo-diario-unico",
      "checkin-atomico",
      "retirada-unica",
      "foto-confinada-ao-upload-dir",
      "admin-bootstrap-idempotente"
    ],
    "journeys": [
      "login-dashboard",
      "checkin-foto",
      "busca-retirada",
      "admin-usuarios",
      "relatorio-exportacao"
    ],
    "modules": [
      "next-app",
      "auth-local",
      "postgres",
      "storage-local",
      "docker-runtime"
    ],
    "ownership": [
      "vps-cliente:runtime",
      "postgres:estado-duravel",
      "next:regras-e-interface"
    ],
    "schema_version": 1
  },
  "objective": "Implementar o Programa de Parceiros BagPoint com cadastro estruturado, cálculo e snapshot financeiro, repasses, alertas internos, extrato, exportação Excel e aceite de regras por link compartilhável, além de tornar nome, CPF/passaporte, WhatsApp e lacre obrigatórios no check-in.",
  "production_checkpoint_required": false,
  "required_guards": [
    "backup_restore",
    "idempotency",
    "local_contract",
    "migration_verify",
    "persistence",
    "reconciliation",
    "rollback",
    "sandbox",
    "source_of_truth"
  ],
  "risk": {
    "additional_guards": [
      "backup_restore",
      "idempotency",
      "migration_verify",
      "persistence",
      "reconciliation",
      "rollback",
      "sandbox",
      "source_of_truth"
    ],
    "declared_score": 5,
    "derived_floor": 5,
    "diff_floor": 0,
    "dimensions": {
      "concurrency": 0,
      "external_effect": 0,
      "migration": 1,
      "money": 2,
      "scope": 2
    },
    "effective_score": 5,
    "initial_floor": 5,
    "overrides": [
      "multiple_objectives"
    ],
    "phase": "start",
    "reasons": [
      "flag:migration=1",
      "flag:money=2",
      "flag:scope=2",
      "flags:dimension_total=5",
      "migration=1",
      "money=2",
      "override:multiple_objectives",
      "scope=2"
    ],
    "reclassified": false,
    "risk_contract": "quick-risk-floor-v1",
    "risk_inputs": {
      "declared_paths": [],
      "flags": {
        "concurrency": 0,
        "external_effect": 0,
        "migration": 1,
        "money": 2,
        "payment": false,
        "scope": 2,
        "webhook": false
      }
    },
    "route": "protected",
    "schema_version": 1,
    "score": 5,
    "workflow": "quick"
  },
  "schema_version": 1,
  "scope": "Inclui somente o sistema Next.js/PostgreSQL existente: migrações aditivas, cadastro e extrato de parceiros, cálculo e snapshot no check-in, repasses, alertas internos, exportação XLSX, aceite público e validações obrigatórias. Não inclui integração automática com WhatsApp Business, assinatura eletrônica certificada, envio de PIX, feriados externos ou deploy em produção.",
  "status": "active",
  "verification": [
    "pnpm test",
    "pnpm lint",
    "pnpm typecheck",
    "pnpm build"
  ]
}
---

# Quick Q003-implementar-o-programa-de-parceiros-bagpoint-com

Implementar o Programa de Parceiros BagPoint com cadastro estruturado, cálculo e snapshot financeiro, repasses, alertas internos, extrato, exportação Excel e aceite de regras por link compartilhável, além de tornar nome, CPF/passaporte, WhatsApp e lacre obrigatórios no check-in.
