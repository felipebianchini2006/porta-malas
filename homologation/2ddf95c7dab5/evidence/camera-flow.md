# Fluxo da câmera em produção

- Superfície: navegador interno, sessão administrativa existente, página `/checkin`.
- O check-in exibiu o botão principal `Abrir câmera e ler QR Code`.
- A alternativa `Escolher imagem da galeria` permaneceu visível.
- O input técnico da câmera foi inspecionado no documento publicado com `accept="image/*"` e `capture="environment"`.
- O input da galeria foi inspecionado com `accept="image/*"` e sem o atributo `capture`.
- Ambos os inputs internos possuem `aria-hidden="true"` e `tabIndex=-1`; somente os dois controles operacionais aparecem na árvore de acessibilidade.
- O leitor continua processando a captura no navegador por `QrScanner.scanImage`, sem enviar a foto ao servidor.

Resultado observado: o RC publicado oferece a captura nativa da câmera traseira e eliminou os controles técnicos duplicados na interface assistiva.

Limite da prova: não havia iPhone, Android, emulador com câmera ou dispositivo físico conectado ao ambiente. A abertura do aplicativo de câmera e a leitura de um QR real precisam do teste final no aparelho usado pelo cliente.
