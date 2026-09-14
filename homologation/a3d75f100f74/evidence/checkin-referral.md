# Cenário: identificar parceiro pelo QR no check-in

- Superfície: navegador interno autenticado na aplicação pública, rota `/checkin`.
- Resultado: aprovado.
- Sucesso: abrir o link codificado no QR selecionou automaticamente `HOS-HOMOLOGACAO-QR-A3D75F1` e exibiu 5% de desconto ao cliente e 5% de comissão ao parceiro.
- Proteção financeira: com parceiro selecionado, a categoria legada que já contém desconto de parceiro ficou indisponível; permaneceram apenas a tarifa normal e itens especiais.
- Leitura: o botão `Ler QR Code do parceiro` apareceu habilitado enquanto existia parceiro ativo.
- Erro: abrir `/checkin?parceiro=CODIGO-INEXISTENTE` manteve `Nenhum` como parceiro e não exibiu regra financeira.
- Recuperação: no código inválido, as categorias normais voltaram ao estado sem parceiro, incluindo a tarifa legada, sem alteração de dados.
- Console: nenhuma mensagem de nível `error` ou `warn` durante os cenários finais.
- Limite operacional: a permissão física da câmera não foi concedida nesta sessão; o scanner por câmera e por imagem já possui prova integrada no RC e o link real foi validado em produção.
