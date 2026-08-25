---
{
  "acceptance": [
    "Nenhuma dependência, variável ou chamada Supabase no runtime; build e testes passam; stack sobe com PostgreSQL persistente; admin consegue autenticar; smoke cobre saúde e rota protegida; fotos persistem; deploy tem backup e rollback; Supabase existente não é apagado."
  ],
  "created_at": "2026-08-25T17:35:12+00:00",
  "digest": "ce12430a60794ae455809de42be41793f19d860aba666bbe5d8792d247034f46",
  "flow": {
    "payment": false,
    "webhook": false
  },
  "guards": [
    "authenticity",
    "local_contract",
    "official_docs",
    "persistence",
    "rollback",
    "sandbox",
    "source_of_truth"
  ],
  "id": "Q001-remover-a-dependencia-do-supabase-e-entregar-o-g",
  "missing_guards": [
    "deduplication",
    "idempotency",
    "replay_order",
    "timeout_recovery"
  ],
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
    "npm run lint",
    "npm run build",
    "docker compose config",
    "smoke HTTP local e remoto"
  ]
}
---

# Quick Q001-remover-a-dependencia-do-supabase-e-entregar-o-g

Remover a dependência do Supabase e entregar o Guarda-Malas autocontido para operação em VPS de cliente, com Next.js, PostgreSQL, autenticação própria, armazenamento persistente de fotos, backup e deploy reversível.
