# Cenário: continuidade e limpeza operacional

- Resultado: aprovado.
- Dados finais: 5 usuários, 14 atendimentos, 33 malas, 31 fotos de malas e 0 parceiros.
- O parceiro temporário foi criado com UUID fixo `00000000-0000-4000-8000-000000000004` e removido somente quando não existia atendimento associado.
- A exclusão retornou exatamente o código temporário; a contagem de parceiros voltou a zero e os atendimentos permaneceram em 14.
- Serviços: BagPoint, PostgreSQL do BagPoint, aplicação NeuroTests e PostgreSQL do NeuroTests permaneceram saudáveis.
- Proxy: `neuro-tests-caddy-1` permaneceu em execução durante toda a publicação.
- Isolamento: BagPoint continua no alias exclusivo `porta-malas-app`; NeuroTests continua no alias separado `app`.
- Logs finais do BagPoint: inicialização normal do Next.js, pronto em 276 ms e sem erro de aplicação.
- Ambiente temporário local e ponte de credenciais foram encerrados; nenhuma porta auxiliar permaneceu aberta.
