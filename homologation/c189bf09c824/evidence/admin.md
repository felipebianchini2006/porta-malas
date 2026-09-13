# Cenário: administração de parceiros e repasses

- Ambiente: produção, navegador autenticado, viewport desktop de 1280 × 720.
- Resultado: aprovado.
- `/admin/parceiros`: abriu com o título `Programa de Parceiros`, descrição de comissão, PIX e regras de repasse, além da ação `Novo parceiro`.
- `/admin/repasses`: abriu com competência mensal, indicadores financeiros e ação `Exportar Excel`.
- Estado atual: não existem parceiros nem repasses cadastrados; por isso, a exportação aparece corretamente desabilitada e os totais exibem zero.
- `/dashboard`: abriu com navegação para Parceiros e Repasses, indicadores de ocupação e a bagagem que já estava em guarda.
- Console do navegador: nenhuma mensagem de nível `error` ou `warn` nas jornadas finais.
- Segurança de dados: a sessão autenticada foi usada sem registrar credenciais nesta evidência.
