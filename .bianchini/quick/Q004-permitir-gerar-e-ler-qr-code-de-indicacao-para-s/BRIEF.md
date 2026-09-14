---
{
  "acceptance": [
    "Cada parceiro possui QR derivado do código existente; o administrador consegue baixar ou copiar; o check-in lê o QR e seleciona somente parceiro ativo; código inválido ou inativo não aplica benefício"
  ],
  "base_head": "2dc3b54b448a1bb0e387b2925da713724413feb6",
  "created_at": "2026-09-14T12:05:20+00:00",
  "digest": "c7861f02075650e21d4546a3670efe1a047e68efa8893fc997e663c436ccc196",
  "docviva_before": {
    ".bianchini/current/ARCHITECTURE.md": "800661d6dbc5b30833e276e7d4b9b8bc4f5411f4dfdee83541fa6e979504faf7",
    ".bianchini/current/SYSTEM_MODEL.md": "9556a13318a8c671d462f288a7b3a71dc4586bc116fd068d44709ef9ba2bcdc9",
    ".bianchini/current/specs/programa-parceiros.md": "b08258a00da1aec93b4d807dd41b865ca39fb163ae2a23770ab483ad1b3b867d",
    ".bianchini/current/specs/runtime-vps.md": "1952901c450c78873deef5678ea8714f482fe3039ecd4c79179f414af5bcf54e"
  },
  "docviva_contract": 1,
  "flow": {
    "payment": false,
    "webhook": false
  },
  "guards": [
    "A leitura repetida do mesmo QR é idempotente",
    "O QR não contém credenciais nem dados financeiros",
    "O código de indicação persistido é a fonte de verdade",
    "Somente parceiros ativos podem ser selecionados pelo QR"
  ],
  "id": "Q004-permitir-gerar-e-ler-qr-code-de-indicacao-para-s",
  "missing_guards": [
    "idempotency",
    "persistence",
    "reconciliation",
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
      "programa-parceiros",
      "repasses-parceiros",
      "aceite-regras",
      "relatorios"
    ],
    "contracts": [
      "sessao-hmac",
      "database-url",
      "upload-dir",
      "health-db",
      "backup-db-uploads",
      "snapshot-financeiro-checkin",
      "aceite-idempotente",
      "repasse-mensal-idempotente"
    ],
    "data": [
      "usuarios",
      "parceiros",
      "atendimentos",
      "malas",
      "fotos_malas",
      "protocol_counters",
      "repasses",
      "repasse_eventos",
      "parceiro_auditoria",
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
      "api-export",
      "api-export-parceiros",
      "pagina-publica-aceite"
    ],
    "invariants": [
      "email-usuario-unico",
      "protocolo-diario-unico",
      "checkin-atomico",
      "checkin-identificacao-obrigatoria",
      "snapshot-financeiro-imutavel",
      "aceite-unico-por-checkin",
      "repasse-unico-por-parceiro-competencia",
      "baixa-repasse-auditada",
      "retirada-unica",
      "foto-confinada-ao-upload-dir",
      "admin-bootstrap-idempotente"
    ],
    "journeys": [
      "login-dashboard",
      "checkin-foto",
      "checkin-parceiro-aceite",
      "busca-retirada",
      "admin-usuarios",
      "admin-parceiros",
      "admin-repasses",
      "extrato-parceiro",
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
  "objective": "Permitir gerar e ler QR Code de indicação para selecionar automaticamente o parceiro no check-in",
  "production_checkpoint_required": false,
  "required_guards": [
    "idempotency",
    "persistence",
    "reconciliation",
    "sandbox",
    "source_of_truth"
  ],
  "risk": {
    "additional_guards": [
      "idempotency",
      "persistence",
      "reconciliation",
      "sandbox",
      "source_of_truth"
    ],
    "declared_score": 2,
    "derived_floor": 2,
    "diff_floor": 0,
    "dimensions": {
      "concurrency": 0,
      "external_effect": 0,
      "migration": 0,
      "money": 1,
      "scope": 1
    },
    "effective_score": 2,
    "initial_floor": 2,
    "overrides": [],
    "phase": "start",
    "reasons": [
      "flag:money=1",
      "flag:scope=1",
      "flags:dimension_total=2",
      "money=1",
      "scope=1"
    ],
    "reclassified": false,
    "risk_contract": "quick-risk-floor-v1",
    "risk_inputs": {
      "declared_paths": [],
      "flags": {
        "concurrency": 0,
        "external_effect": 0,
        "migration": 0,
        "money": 1,
        "payment": false,
        "scope": 1,
        "webhook": false
      }
    },
    "route": "normal",
    "schema_version": 1,
    "score": 2,
    "workflow": "quick"
  },
  "schema_version": 1,
  "scope": "Exibir QR Code baixável/copíavel no cadastro administrativo do parceiro e ler o código no check-in sem alterar percentuais ou snapshots financeiros",
  "status": "active",
  "verification": [
    "npm test",
    "npm run lint",
    "npm run typecheck",
    "npm run build"
  ]
}
---

# Quick Q004-permitir-gerar-e-ler-qr-code-de-indicacao-para-s

Permitir gerar e ler QR Code de indicação para selecionar automaticamente o parceiro no check-in
