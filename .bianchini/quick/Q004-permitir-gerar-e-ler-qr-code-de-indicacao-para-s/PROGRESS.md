---
{
  "events": [
    {
      "at": "2026-09-14T12:12:56+00:00",
      "blockers": null,
      "brief_digest": "c7861f02075650e21d4546a3670efe1a047e68efa8893fc997e663c436ccc196",
      "changed_files": [
        ".bianchini/current/specs/programa-parceiros.md",
        "README.md",
        "app/(app)/checkin/page.tsx",
        "components/admin/parceiro-qr-dialog.tsx",
        "components/admin/parceiros-manager.tsx",
        "components/checkin/checkin-form.tsx",
        "components/checkin/partner-qr-scanner.tsx",
        "lib/utils/partner-referral.ts",
        "package-lock.json",
        "package.json",
        "tests/partner-referral.test.ts"
      ],
      "commands": [
        "npm test",
        "npm run lint",
        "npm run typecheck",
        "npm run build"
      ],
      "evidence": [
        "UI local: QR visível, clipboard image/png, link selecionou parceiro ativo, código inválido não selecionou e console sem erros"
      ],
      "fingerprint": "4596b8587954a3f77a9ab50a61546cf5d1a82a13e278bd1fc685da531a89a9e6",
      "guards": [
        "idempotency",
        "persistence",
        "reconciliation",
        "sandbox",
        "source_of_truth"
      ],
      "missing_guards": [
        "dependency_audit",
        "lockfile_consistency"
      ],
      "proof_ids": [
        "proof-1d29ef99b5d726fc149ea3b94f0bd26a",
        "proof-260e98ca2b263287e8c7b47b2c885292",
        "proof-d315980352022a511b31dedda901d63d",
        "proof-a64f642cdc66697b6ea7c8bc332e1247"
      ],
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
      "summary": "Implementação do QR concluída e validada após o commit ed1232c"
    },
    {
      "at": "2026-09-14T12:13:15+00:00",
      "blockers": null,
      "brief_digest": "c7861f02075650e21d4546a3670efe1a047e68efa8893fc997e663c436ccc196",
      "changed_files": [
        "package-lock.json",
        "package.json"
      ],
      "commands": null,
      "evidence": [
        "npm audit --omit=dev: 0 vulnerabilidades; npm ci --dry-run --ignore-scripts: lockfile consistente"
      ],
      "fingerprint": "4596b8587954a3f77a9ab50a61546cf5d1a82a13e278bd1fc685da531a89a9e6",
      "guards": [
        "dependency_audit",
        "lockfile_consistency"
      ],
      "missing_guards": [],
      "proof_ids": null,
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
      "summary": "Dependências do QR auditadas e lockfile validado"
    }
  ],
  "id": "Q004-permitir-gerar-e-ler-qr-code-de-indicacao-para-s",
  "schema_version": 1,
  "status": "active",
  "updated_at": "2026-09-14T12:13:15+00:00"
}
---

# Progresso de Q004-permitir-gerar-e-ler-qr-code-de-indicacao-para-s

Dependências do QR auditadas e lockfile validado
