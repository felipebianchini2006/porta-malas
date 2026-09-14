# Homologação de produção — RC a3d75f100f74

## Veredito

**ACEITO**

O RC `a3d75f100f74c74c0fa1814d5d85eefc79b4dd22` foi publicado e homologado no sistema real. Não existe finding aberto.

## Cenários

| Cenário | Resultado observado | Evidência | SHA-256 |
|---|---|---|---|
| Implantação | Build sem vulnerabilidades, container saudável, endpoint público `ok` e arquivos iguais à origem. | `deployment.md` | `bc88a5541d46b4e3314e353950efb8a99f90c53369167e2f5c5884fd2b0b9136` |
| Administração do QR | QR renderizado; PNG disponível; cópia confirmada como `image/png`; código e ações visíveis. | `qr-admin.md` | `c1e5388ee3c804e165fd42a9e62c739dc715257767fb34e772fa7d817da8054b` |
| Check-in indicado | Link do QR selecionou parceiro ativo com 5%/5%; código inválido não aplicou benefício; tarifa legada protegida. | `checkin-referral.md` | `8d7a1b089dda78c5062870b71ca5c36e5dcfb2c2e8454bd962295697905790c4` |
| Continuidade | Dados preservados, registro temporário removido, serviços vizinhos ativos e rede isolada. | `continuity.md` | `b5971a4c815d5ec9ffd53f35de4eb0963155cffd94232ff7e13ab1ca00000ffc` |

## Prontidão operacional

- Produção: `https://porta-malas.158.220.91.88.sslip.io`.
- RC publicado: `a3d75f100f74`.
- Imagem: `sha256:6efc86a769e14ec70dc5dd94644e9a8c8c69801db0837d0f6c1d804a2fa8ab40`.
- Backup de banco e uploads: concluído e não vazio.
- Rollback de código: preparado antes da troca.
- Migração: não necessária para este RC.
- Console e logs: sem erro ou aviso da aplicação.
- Registro temporário: removido; estado de dados original restaurado.

## Informação não bloqueante

A sessão automatizada não concedeu permissão física de câmera. A jornada equivalente pelo link contido no QR foi executada em produção, e geração, cópia, download, parser, parceiro ativo/inativo, código inválido, tipos, build e integração visual possuem provas atuais. A leitura de imagem permanece como alternativa operacional na interface.
