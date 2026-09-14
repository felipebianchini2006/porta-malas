---
{
  "actual": "No celular em produção, a câmera não abre e o operador precisa fotografar o QR e selecionar a imagem da galeria",
  "created_at": "2026-09-14T19:29:13+00:00",
  "docviva": {
    "after_digest": "134f3134468603c068ffb7824cea5958d6f2c5cb01b1b8c34239d4ea342774db",
    "artifacts": [
      ".bianchini/current/specs/programa-parceiros.md"
    ],
    "before_digest": "2571307589748b33cf1f631ca2f1208d77f78ce6d9ce4d44f12c8209bb59f865",
    "changed": [
      ".bianchini/current/specs/programa-parceiros.md"
    ],
    "created": [],
    "justification": "O fluxo operacional da câmera foi registrado no contrato do programa de parceiros.",
    "kind": "behavioral",
    "modified": [
      ".bianchini/current/specs/programa-parceiros.md"
    ],
    "outcome": "updated",
    "removed": [],
    "required": true,
    "schema_version": 1,
    "status": "verified"
  },
  "docviva_before": {
    ".bianchini/current/ARCHITECTURE.md": "800661d6dbc5b30833e276e7d4b9b8bc4f5411f4dfdee83541fa6e979504faf7",
    ".bianchini/current/SYSTEM_MODEL.md": "9556a13318a8c671d462f288a7b3a71dc4586bc116fd068d44709ef9ba2bcdc9",
    ".bianchini/current/specs/programa-parceiros.md": "217d6244bf8b436b869c5896ae6b2a88676a73c3bd22f9f8855baa98c16285c2",
    ".bianchini/current/specs/runtime-vps.md": "1952901c450c78873deef5678ea8714f482fe3039ecd4c79179f414af5bcf54e"
  },
  "docviva_contract": 1,
  "eliminated_hypotheses": [
    "Origem HTTP/insegura: produção usa HTTPS, window.isSecureContext=true e navigator.mediaDevices.getUserMedia está disponível."
  ],
  "environment": "Produção HTTPS, navegador móvel, RC a3d75f1",
  "events": [
    {
      "at": "2026-09-14T19:32:13+00:00",
      "event": "reproduced",
      "evidence": "Produção HTTPS reproduzida no check-in: ao abrir o diálogo, o vídeo permanece sem mídia; window.isSecureContext=true, navigator.mediaDevices/getUserMedia disponíveis e permissão camera continua em estado prompt após a tentativa. O código chama scanner.start() somente em useEffect após import() assíncrono, fora do gesto do toque.",
      "fingerprint": "68534b0d6c02b7f30165a54055fca9c41584efff60b440dc2e2429ac34532ca9",
      "proof_id": ""
    },
    {
      "at": "2026-09-14T19:33:44+00:00",
      "event": "diagnosed",
      "evidence": "A origem é segura e a API existe, mas a tentativa não produz MediaStream nem resolve a permissão. O fluxo depende exclusivamente de QrScanner.start/getUserMedia iniciado após abertura do diálogo; não há input nativo capture para abrir a câmera diretamente no navegador móvel.",
      "fingerprint": "68534b0d6c02b7f30165a54055fca9c41584efff60b440dc2e2429ac34532ca9",
      "proof_id": ""
    },
    {
      "at": "2026-09-14T19:35:03+00:00",
      "event": "red",
      "evidence": "Regressão reproduz a falta do atributo capture=environment no contrato da entrada de câmera; entrada de galeria deve permanecer sem capture.",
      "fingerprint": "3fe180ae56a87ae8bd1f1800c1efe5c157b71b1dcf0bad8a5dc98eaf7d249ed1",
      "proof_id": "proof-8c6d392bea82dd0811f223af0ed5df5c"
    },
    {
      "at": "2026-09-14T19:36:45+00:00",
      "event": "fixing",
      "evidence": "Substituído o leitor ao vivo como caminho principal por captura nativa direta com câmera traseira; a foto é lida automaticamente e a galeria continua como alternativa.",
      "fingerprint": "5df553fe47ea24380bb59c338bf2a4965fca225ef5bda3c70c1565a64df5f1a7",
      "proof_id": ""
    },
    {
      "at": "2026-09-14T19:36:46+00:00",
      "event": "green",
      "evidence": "A entrada de câmera agora usa capture=environment e a entrada de galeria permanece sem captura forçada.",
      "fingerprint": "5df553fe47ea24380bb59c338bf2a4965fca225ef5bda3c70c1565a64df5f1a7",
      "proof_id": "proof-0e231c63f78b5da626cc60b07912c5b8"
    },
    {
      "at": "2026-09-14T19:40:01+00:00",
      "event": "regression_checked",
      "evidence": "Suíte completa 29/29, lint, build de produção e typecheck passaram. O fluxo de galeria continua disponível sem capture forçado.",
      "fingerprint": "5df553fe47ea24380bb59c338bf2a4965fca225ef5bda3c70c1565a64df5f1a7",
      "proof_id": "proof-ae02ea53c2a0a4278231be7e95c38f9b"
    },
    {
      "at": "2026-09-14T19:40:59+00:00",
      "event": "documented",
      "evidence": "Especificação comportamental atualizada para registrar que, no celular, a câmera traseira abre diretamente e a captura é lida sem passagem manual pela galeria.",
      "fingerprint": "5df553fe47ea24380bb59c338bf2a4965fca225ef5bda3c70c1565a64df5f1a7",
      "proof_id": ""
    }
  ],
  "expected": "Ao tocar em Ler QR Code do parceiro, o navegador solicita permissão e exibe a câmera traseira para leitura ao vivo",
  "experiments": [
    "Adicionar entrada file com accept=image/* e capture=environment, acionada diretamente pelo botão, e processar automaticamente a foto com QrScanner.scanImage."
  ],
  "finished_at": "2026-09-14T19:41:13+00:00",
  "green": "A entrada de câmera agora usa capture=environment e a entrada de galeria permanece sem captura forçada.",
  "hypotheses": [
    "A câmera ao vivo via getUserMedia não é liberada pelo navegador móvel/embutido usado na operação; captura nativa acionada diretamente por toque evita esse bloqueio."
  ],
  "id": "D003-corrigir-abertura-da-camera-no-leitor-de-qr-do-p",
  "neighboring_regressions": [
    "Extração do código, seleção apenas de parceiro ativo, link de indicação e leitura de imagem preservados."
  ],
  "objective": "Corrigir abertura da câmera no leitor de QR do parceiro",
  "origin_evidence": null,
  "origin_refs": null,
  "reason": "Captura nativa pela câmera traseira implementada e lida automaticamente; regressão, suíte completa, lint, build e tipos aprovados.",
  "red": "Regressão reproduz a falta do atributo capture=environment no contrato da entrada de câmera; entrada de galeria deve permanecer sem capture.",
  "regression_contract": {
    "argv": [
      "node",
      "--test",
      "--experimental-strip-types",
      "tests/partner-referral.test.ts"
    ],
    "failure_pattern": "capture: 'environment'",
    "test_file": "tests/partner-referral.test.ts",
    "test_sha256": "d230176407aa95db6027533e75abc1a69a46def79e9d9f28fd8d7a03610f4324"
  },
  "relation": null,
  "residual_risk": "Navegadores de desktop ou webviews que ignorem o atributo capture podem abrir o seletor de arquivos; nesses casos a opção de galeria permanece disponível. A validação física final ainda depende do modelo de celular usado pelo cliente.",
  "root_cause": "O componente implementou apenas fluxo WebRTC ao vivo, sensível à política de permissão do navegador móvel, e deixou a captura de foto sem capture=environment; por isso a única recuperação disponível era escolher manualmente uma imagem da galeria.",
  "schema_version": 1,
  "stage": "documented",
  "status": "resolved",
  "updated_at": "2026-09-14T19:40:59+00:00"
}
---

# Debug D003-corrigir-abertura-da-camera-no-leitor-de-qr-do-p

Corrigir abertura da câmera no leitor de QR do parceiro
