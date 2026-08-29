ALTER TABLE atendimentos
  ADD COLUMN forma_pagamento text;

ALTER TABLE atendimentos
  ADD CONSTRAINT atendimentos_forma_pagamento_check
  CHECK (forma_pagamento IN ('credito', 'debito', 'pix', 'dinheiro'));
