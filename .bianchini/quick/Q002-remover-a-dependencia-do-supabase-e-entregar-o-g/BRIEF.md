---
{
  "acceptance": [
    "Nenhuma dependência, variável ou chamada Supabase no runtime; build e testes passam; stack sobe com PostgreSQL persistente; admin consegue autenticar; smoke cobre saúde e rota protegida; fotos persistem; deploy tem backup e rollback; Supabase existente não é apagado."
  ],
  "created_at": "2026-08-25T17:47:24+00:00",
  "digest": "63957032787b0da193c8668fe72af5c1a53001333971f00c54b2eeb53853bdb3",
  "flow": {
    "payment": false,
    "webhook": false
  },
  "guards": [
    "authenticity",
    "deduplication",
    "idempotency",
    "local_contract",
    "official_docs",
    "persistence",
    "replay_order",
    "rollback",
    "sandbox",
    "source_of_truth",
    "timeout_recovery"
  ],
  "id": "Q002-remover-a-dependencia-do-supabase-e-entregar-o-g",
  "missing_guards": [],
  "objective": "Remover a dependência do Supabase e entregar o Guarda-Malas autocontido para operação em VPS de cliente, com Next.js, PostgreSQL, autenticação própria, armazenamento persistente de fotos, backup e deploy reversível.",
  "production_checkpoint_required": true,
  "risk": {
    "dimensions": {
      "concurrency": 1,
      "external_effect": 2,
      "migration": 2,
      "money": 0,
      "scope": 2
    },
    "overrides": [
      "destructive_migration",
      "multiple_objectives",
      "new_material_architecture"
    ],
    "reasons": [
      "scope=2",
      "external_effect=2",
      "migration=2",
      "concurrency=1",
      "override:destructive_migration",
      "override:multiple_objectives",
      "override:new_material_architecture"
    ],
    "route": "protected",
    "score": 7
  },
  "schema_version": 1,
  "scope": "Substituir Supabase Auth, Data API e Storage; preservar jornadas de login, usuários, dashboard, check-in, fotos, retirada, parceiros, relatório e exportação; criar runtime Docker para VPS; validar e publicar em VPS de cliente livre.",
  "status": "active",
  "verification": [
    "npm test",
    "npm run typecheck",
    "npm run lint",
    "npm run build",
    "npm audit --omit=dev",
    "docker compose config",
    "smoke HTTP local e remoto"
  ]
}
---

# Quick Q002-remover-a-dependencia-do-supabase-e-entregar-o-g

Remover a dependência do Supabase e entregar o Guarda-Malas autocontido para operação em VPS de cliente, com Next.js, PostgreSQL, autenticação própria, armazenamento persistente de fotos, backup e deploy reversível.
