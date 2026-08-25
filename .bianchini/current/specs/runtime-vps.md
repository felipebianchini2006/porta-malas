# Runtime autocontido em VPS

## Comportamento aceito

- O runtime não depende de Supabase ou outro backend gerenciado.
- Usuário inativo não mantém acesso às áreas protegidas.
- Somente administradores criam, ativam ou alteram papéis de usuários.
- Check-in grava atendimento e malas atomicamente.
- Retirada só altera atendimento ainda ativo e suas malas na mesma transação.
- Upload aceita apenas JPG, PNG e WebP de até 10 MB e persiste arquivo e referência coerentes.
- Fotos exigem sessão válida para leitura.
- O primeiro start cria no máximo um administrador pelas variáveis de ambiente.
- Reinícios não reaplicam migrations nem duplicam o administrador.
- Banco e uploads possuem volumes persistentes e backup verificável.
