# Runtime autocontido em VPS

## Comportamento aceito

- O runtime não depende de Supabase ou outro backend gerenciado.
- Usuário inativo não mantém acesso às áreas protegidas.
- Somente administradores criam, ativam ou alteram papéis de usuários.
- Check-in grava atendimento e malas atomicamente.
- Retirada só altera atendimento ainda ativo e suas malas na mesma transação.
- Upload aceita apenas JPG, PNG e WebP de até 10 MB e persiste arquivo e referência coerentes.
- Fotos exigem sessão válida para leitura.
- Compartilhamento prepara as cópias com lacre antes de habilitar o clique e mantém download individual e acesso direto ao WhatsApp como recuperação.
- A confirmação do check-in abre o WhatsApp na mesma aba e preserva protocolo e link de aceite, sem depender de pop-up.
- O primeiro start cria no máximo um administrador pelas variáveis de ambiente.
- Reinícios não reaplicam migrations nem duplicam o administrador.
- Banco e uploads possuem volumes persistentes e backup verificável.
