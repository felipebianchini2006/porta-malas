---
{
  "actual": "O BagPoint foi implantado na mesma VPS, conectado à rede neuro-tests_web e adicionado ao Caddyfile do cliente.",
  "created_at": "2026-08-27T20:20:26+00:00",
  "eliminated_hypotheses": [
    "O Caddyfile apontava explicitamente o domínio NeuroTests para o BagPoint: falso; a rota usa app:3000 e a colisão acontece na resolução DNS do alias compartilhado."
  ],
  "environment": "VPS 158.220.91.88, produção em 2026-08-27, BagPoint b711c65 e NeuroTests saudável.",
  "events": [
    {
      "at": "2026-08-27T20:20:37+00:00",
      "event": "reproduced",
      "evidence": "docker network inspect neuro-tests_web lista porta-malas-app-1 e /opt/neuro-tests/Caddyfile contém rota porta-malas; o domínio principal do NeuroTests ainda responde HTTP 200 com título Neuro Tests.",
      "fingerprint": "ec38bd2ecc14eb2bfbea1478feb80612361868ae86c2ede8b4980619fb145e48"
    },
    {
      "at": "2026-08-27T20:20:37+00:00",
      "event": "diagnosed",
      "evidence": "A implantação reutilizou deliberadamente a rede externa neuro-tests_web e o Caddy do cliente, criando mistura de ownership e risco de colisão de rota.",
      "fingerprint": "ec38bd2ecc14eb2bfbea1478feb80612361868ae86c2ede8b4980619fb145e48"
    },
    {
      "at": "2026-08-27T20:22:14+00:00",
      "event": "red",
      "evidence": "De dentro do Caddy, 20 resoluções de DNS para o upstream app alternaram 9 vezes para 172.18.0.2 (NeuroTests) e 11 vezes para 172.18.0.4 (BagPoint). O contrato exige um único destino NeuroTests.",
      "fingerprint": "ec38bd2ecc14eb2bfbea1478feb80612361868ae86c2ede8b4980619fb145e48"
    },
    {
      "at": "2026-08-27T20:22:14+00:00",
      "event": "fixing",
      "evidence": "Correção mínima: renomear permanentemente o serviço Docker do BagPoint para bagpoint, manter alias exclusivo porta-malas-app e recriar somente esse container; NeuroTests e seu banco permanecem intactos.",
      "fingerprint": "ec38bd2ecc14eb2bfbea1478feb80612361868ae86c2ede8b4980619fb145e48"
    },
    {
      "at": "2026-08-27T20:27:51+00:00",
      "event": "green",
      "evidence": "Após renomear o serviço para bagpoint e recriar somente o container BagPoint, 100/100 resoluções do alias app apontaram apenas para 172.18.0.2 (NeuroTests), 20/20 de porta-malas-app apontaram apenas para 172.18.0.4 (BagPoint), e ambos os containers ficaram healthy.",
      "fingerprint": "c1ec363e2f7c9f76404444c7d307c7760403174fd52ea8d902aba12371a3d91f"
    },
    {
      "at": "2026-08-27T20:27:54+00:00",
      "event": "regression_checked",
      "evidence": "50/50 requisições públicas do NeuroTests retornaram título Neuro Tests; 50/50 do BagPoint retornaram título Bag Point; health do BagPoint respondeu ok; npm test 9/9, typecheck, lint e compose config passaram.",
      "fingerprint": "c1ec363e2f7c9f76404444c7d307c7760403174fd52ea8d902aba12371a3d91f"
    },
    {
      "at": "2026-08-27T20:27:55+00:00",
      "event": "documented",
      "evidence": "Compose, override de proxy, script de backup e README agora usam o nome exclusivo bagpoint; deploy e rollback foram preservados.",
      "fingerprint": "c1ec363e2f7c9f76404444c7d307c7760403174fd52ea8d902aba12371a3d91f"
    }
  ],
  "expected": "A VPS e a rede pública do NeuroTests não executam nem roteiam o BagPoint; o site NeuroTests permanece saudável.",
  "experiments": [
    "Inspeção do compose proxy, Caddyfile e membros da rede confirmou os dois vínculos.",
    "docker inspect confirmou que neuro-tests-app-1 e porta-malas-app-1 possuem simultaneamente o alias app na rede neuro-tests_web."
  ],
  "finished_at": "2026-08-27T20:27:56+00:00",
  "green": "Após renomear o serviço para bagpoint e recriar somente o container BagPoint, 100/100 resoluções do alias app apontaram apenas para 172.18.0.2 (NeuroTests), 20/20 de porta-malas-app apontaram apenas para 172.18.0.4 (BagPoint), e ambos os containers ficaram healthy.",
  "hypotheses": [
    "A causa é o deploy/compose.proxy.yaml conectar o BagPoint à rede neuro-tests_web e a edição do Caddyfile do NeuroTests adicionar a rota do BagPoint."
  ],
  "id": "D002-remover-o-bagpoint-da-infraestrutura-do-cliente",
  "neighboring_regressions": [
    "O banco e o container do NeuroTests permaneceram healthy e não foram recriados; o banco persistente do BagPoint permaneceu no mesmo volume; Caddy continuou atendendo os dois domínios."
  ],
  "objective": "Remover o BagPoint da infraestrutura do cliente NeuroTests e restaurar o isolamento da VPS",
  "origin_evidence": null,
  "origin_refs": [],
  "reason": "NeuroTests e BagPoint permanecem ativos em Docker com aliases exclusivos e rotas públicas determinísticas.",
  "red": "De dentro do Caddy, 20 resoluções de DNS para o upstream app alternaram 9 vezes para 172.18.0.2 (NeuroTests) e 11 vezes para 172.18.0.4 (BagPoint). O contrato exige um único destino NeuroTests.",
  "relation": null,
  "residual_risk": "Os projetos ainda compartilham o Caddy e a rede web por necessidade do mesmo IP/portas 80 e 443; novos serviços nessa rede também devem usar nomes exclusivos para não recriar colisões DNS.",
  "root_cause": "Os dois projetos Docker Compose usam o serviço chamado app na mesma rede neuro-tests_web. O Docker registrou o alias app nos dois containers e o Caddy do NeuroTests passou a alternar requisições entre NeuroTests e BagPoint.",
  "schema_version": 1,
  "stage": "documented",
  "status": "resolved",
  "updated_at": "2026-08-27T20:27:55+00:00"
}
---

# Debug D002-remover-o-bagpoint-da-infraestrutura-do-cliente

Remover o BagPoint da infraestrutura do cliente NeuroTests e restaurar o isolamento da VPS
