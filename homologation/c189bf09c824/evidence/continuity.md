# Cenário: continuidade operacional e regressão

- Resultado: aprovado.
- Dados antes e depois da implantação: 5 usuários, 14 atendimentos, 33 malas e 31 fotos de malas.
- Migrações aplicadas, em ordem: `001_initial.sql`, `002_categorias_mala.sql`, `003_forma_pagamento.sql` e `004_programa_parceiros.sql`.
- Serviços saudáveis: `porta-malas-bagpoint-1`, `porta-malas-db-1`, `neuro-tests-app-1` e `neuro-tests-db-1`.
- Proxy compartilhado: `neuro-tests-caddy-1` permaneceu em execução durante toda a publicação.
- Isolamento confirmado: BagPoint possui o alias `porta-malas-app`; NeuroTests mantém o alias separado `app`.
- Testes locais finais: 25 aprovados, 0 falhas, 0 ignorados.
- Qualidade local final: ESLint com zero avisos e TypeScript sem erros.
- Build de produção: compilação Next.js concluída com sucesso antes da troca do container.
- Regressão observada: login, painel, check-in, administração de parceiros, repasses e saúde pública continuaram acessíveis.
