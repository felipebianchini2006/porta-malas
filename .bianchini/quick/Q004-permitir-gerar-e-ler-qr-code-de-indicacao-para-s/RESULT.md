---
{
  "behaviors": [
    "Administrador gera, copia e baixa o QR do código único; check-in lê pela câmera, imagem ou link e seleciona somente parceiro ativo"
  ],
  "blockers": null,
  "docviva": {
    "after_digest": "2571307589748b33cf1f631ca2f1208d77f78ce6d9ce4d44f12c8209bb59f865",
    "artifacts": [
      ".bianchini/current/specs/programa-parceiros.md"
    ],
    "before_digest": "6ea4d932d0cf5ac356f5f7ac67a8a3ce4c353979a9429750ef8a20512266cbd1",
    "changed": [
      ".bianchini/current/specs/programa-parceiros.md"
    ],
    "created": [],
    "justification": "",
    "kind": "behavioral",
    "modified": [
      ".bianchini/current/specs/programa-parceiros.md"
    ],
    "outcome": "updated",
    "removed": [],
    "required": true,
    "schema_version": 1,
    "status": "verified"
  },
  "fingerprint": "4596b8587954a3f77a9ab50a61546cf5d1a82a13e278bd1fc685da531a89a9e6",
  "finished_at": "2026-09-14T12:13:41+00:00",
  "id": "Q004-permitir-gerar-e-ler-qr-code-de-indicacao-para-s",
  "limitations": [
    "A câmera requer HTTPS ou localhost e permissão concedida pelo operador; a leitura por imagem permanece disponível como alternativa"
  ],
  "production_authorized": false,
  "risk": {
    "additional_guards": [
      "dependency_audit",
      "idempotency",
      "lockfile_consistency",
      "persistence",
      "reconciliation",
      "sandbox",
      "source_of_truth"
    ],
    "declared_score": 2,
    "derived_floor": 3,
    "diff_floor": 0,
    "effective_score": 3,
    "initial_floor": 3,
    "phase": "finish",
    "reasons": [
      "declared_below_floor:2\u003c3",
      "declared_path:dependency_manifest:package-lock.json",
      "declared_path:dependency_manifest:package.json",
      "flag:money=1",
      "flag:scope=1",
      "flags:dimension_total=2",
      "money=1",
      "scope=1"
    ],
    "reclassified": true,
    "risk_contract": "quick-risk-floor-v1",
    "route": "protected",
    "schema_version": 1,
    "start_floor": 2,
    "workflow": "quick"
  },
  "schema_version": 1,
  "status": "completed",
  "verification": [
    "28 testes aprovados após o commit ed1232c; lint, typecheck e build aprovados",
    "Prova visual local: QR renderizado, cópia image/png, link selecionando Pousada Sol, código inválido sem seleção e console sem erros",
    "npm audit sem vulnerabilidades e lockfile consistente"
  ]
}
---

# Resultado de Q004-permitir-gerar-e-ler-qr-code-de-indicacao-para-s

Status: completed.
