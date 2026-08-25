---
{
  "capabilities": ["autenticacao-local", "gestao-usuarios", "checkin", "fotos-locais", "retirada", "parceiros", "relatorios"],
  "contracts": ["sessao-hmac", "database-url", "upload-dir", "health-db", "backup-db-uploads"],
  "data": ["usuarios", "parceiros", "atendimentos", "malas", "fotos_malas", "protocol_counters", "schema_migrations"],
  "effects": ["postgres-write", "filesystem-write", "http-cookie"],
  "integrations": [],
  "interfaces": ["next-pages", "server-actions", "api-health", "api-uploads", "api-export"],
  "invariants": ["email-usuario-unico", "protocolo-diario-unico", "checkin-atomico", "retirada-unica", "foto-confinada-ao-upload-dir", "admin-bootstrap-idempotente"],
  "journeys": ["login-dashboard", "checkin-foto", "busca-retirada", "admin-usuarios", "relatorio-exportacao"],
  "modules": ["next-app", "auth-local", "postgres", "storage-local", "docker-runtime"],
  "ownership": ["vps-cliente:runtime", "postgres:estado-duravel", "next:regras-e-interface"],
  "schema_version": 1
}
---
# Modelo do sistema

Aplicação Next.js autocontida, executada com PostgreSQL e volumes persistentes na mesma VPS.
