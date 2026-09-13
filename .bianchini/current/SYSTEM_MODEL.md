---
{
  "capabilities": ["autenticacao-local", "gestao-usuarios", "checkin", "fotos-locais", "retirada", "programa-parceiros", "repasses-parceiros", "aceite-regras", "relatorios"],
  "contracts": ["sessao-hmac", "database-url", "upload-dir", "health-db", "backup-db-uploads", "snapshot-financeiro-checkin", "aceite-idempotente", "repasse-mensal-idempotente"],
  "data": ["usuarios", "parceiros", "atendimentos", "malas", "fotos_malas", "protocol_counters", "repasses", "repasse_eventos", "parceiro_auditoria", "schema_migrations"],
  "effects": ["postgres-write", "filesystem-write", "http-cookie"],
  "integrations": [],
  "interfaces": ["next-pages", "server-actions", "api-health", "api-uploads", "api-export", "api-export-parceiros", "pagina-publica-aceite"],
  "invariants": ["email-usuario-unico", "protocolo-diario-unico", "checkin-atomico", "checkin-identificacao-obrigatoria", "snapshot-financeiro-imutavel", "aceite-unico-por-checkin", "repasse-unico-por-parceiro-competencia", "baixa-repasse-auditada", "retirada-unica", "foto-confinada-ao-upload-dir", "admin-bootstrap-idempotente"],
  "journeys": ["login-dashboard", "checkin-foto", "checkin-parceiro-aceite", "busca-retirada", "admin-usuarios", "admin-parceiros", "admin-repasses", "extrato-parceiro", "relatorio-exportacao"],
  "modules": ["next-app", "auth-local", "postgres", "storage-local", "docker-runtime"],
  "ownership": ["vps-cliente:runtime", "postgres:estado-duravel", "next:regras-e-interface"],
  "schema_version": 1
}
---
# Modelo do sistema

Aplicação Next.js autocontida, executada com PostgreSQL e volumes persistentes na mesma VPS. O programa de parceiros usa snapshots financeiros no check-in, fechamento mensal materializado e trilha de auditoria.
