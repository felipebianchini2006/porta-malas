# Cenário: gerar e compartilhar QR do parceiro

- Superfície: navegador interno autenticado na aplicação pública, rota `/admin/parceiros`.
- Perfil: administrador.
- Resultado: aprovado.
- Estado conhecido: parceiro temporário `Homologação QR`, código `HOS-HOMOLOGACAO-QR-A3D75F1`, regra 5% de desconto e 5% de comissão.
- Observado: a tabela exibiu a ação acessível `Abrir QR Code de Homologação QR`.
- Observado: o diálogo renderizou um QR legível, o código correspondente e as ações `Copiar QR`, `Copiar link` e `Baixar PNG`.
- Observado: o download apresentou URI `data:image/png;base64`; a cópia gravou um item `image/png` no clipboard e exibiu confirmação de sucesso.
- Evidência visual: captura completa do diálogo foi emitida na sessão de homologação.
- Segurança: o conteúdo do QR carrega somente o link e o código de indicação; não contém PIX, percentuais ou credenciais.
