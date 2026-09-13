ALTER TABLE parceiros
  ADD COLUMN grupo text,
  ADD COLUMN categoria text,
  ADD COLUMN nome_completo_razao_social text,
  ADD COLUMN nome_fantasia text,
  ADD COLUMN pessoa_tipo text,
  ADD COLUMN documento text,
  ADD COLUMN whatsapp text,
  ADD COLUMN email text,
  ADD COLUMN instagram text,
  ADD COLUMN site text,
  ADD COLUMN endereco text,
  ADD COLUMN numero text,
  ADD COLUMN complemento text,
  ADD COLUMN bairro text,
  ADD COLUMN cidade text,
  ADD COLUMN uf text,
  ADD COLUMN cep text,
  ADD COLUMN codigo_indicacao text,
  ADD COLUMN data_inicio date NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN desconto_percentual numeric(5, 2) NOT NULL DEFAULT 5
    CHECK (desconto_percentual >= 0 AND desconto_percentual <= 100),
  ADD COLUMN comissao_percentual numeric(5, 2) NOT NULL DEFAULT 5
    CHECK (comissao_percentual >= 0 AND comissao_percentual <= 100),
  ADD COLUMN dia_repasse integer,
  ADD COLUMN pix_tipo text,
  ADD COLUMN pix_chave text,
  ADD COLUMN pix_titular text,
  ADD COLUMN pix_documento_titular text,
  ADD COLUMN status text NOT NULL DEFAULT 'ativo',
  ADD COLUMN observacoes text,
  ADD COLUMN nome_airbnb text,
  ADD COLUMN quantidade_unidades integer,
  ADD COLUMN bairros_atendidos text,
  ADD COLUMN empresa_gestora text,
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE parceiros
   SET grupo = CASE WHEN tipo IN ('Hotel', 'Airbnb', 'Hostel') THEN 'Hospedagem' ELSE 'Indicação Local' END,
       categoria = tipo,
       dia_repasse = CASE WHEN tipo IN ('Hotel', 'Airbnb', 'Hostel') THEN 20 ELSE 15 END,
       codigo_indicacao = CASE WHEN tipo IN ('Hotel', 'Airbnb', 'Hostel') THEN 'HOS-' ELSE 'IND-' END
         || upper(regexp_replace(trim(nome), '[^[:alnum:]]+', '-', 'g')) || '-' || substring(id::text, 1, 6),
       status = CASE WHEN ativo THEN 'ativo' ELSE 'inativo' END
 WHERE grupo IS NULL OR categoria IS NULL OR dia_repasse IS NULL OR codigo_indicacao IS NULL;

ALTER TABLE parceiros
  ALTER COLUMN grupo SET NOT NULL,
  ALTER COLUMN categoria SET NOT NULL,
  ALTER COLUMN dia_repasse SET NOT NULL,
  ALTER COLUMN codigo_indicacao SET NOT NULL,
  ADD CONSTRAINT parceiros_grupo_check CHECK (grupo IN ('Hospedagem', 'Indicação Local')),
  ADD CONSTRAINT parceiros_pessoa_tipo_check CHECK (pessoa_tipo IS NULL OR pessoa_tipo IN ('PF', 'PJ')),
  ADD CONSTRAINT parceiros_dia_repasse_check CHECK (dia_repasse BETWEEN 1 AND 28),
  ADD CONSTRAINT parceiros_status_check CHECK (status IN ('pendente_cadastro', 'pendente_financeiro', 'ativo', 'inativo', 'bloqueado')),
  ADD CONSTRAINT parceiros_quantidade_unidades_check CHECK (quantidade_unidades IS NULL OR quantidade_unidades >= 0);

CREATE UNIQUE INDEX parceiros_codigo_indicacao_unique
  ON parceiros (lower(codigo_indicacao));
CREATE UNIQUE INDEX parceiros_documento_unique
  ON parceiros (regexp_replace(documento, '[^0-9A-Za-z]', '', 'g'))
  WHERE documento IS NOT NULL AND documento <> '';
CREATE INDEX parceiros_grupo_status_idx ON parceiros (grupo, status, nome);

ALTER TABLE atendimentos
  ADD COLUMN cliente_documento_tipo text,
  ADD COLUMN cliente_documento text,
  ADD COLUMN valor_bruto numeric(10, 2),
  ADD COLUMN desconto_percentual_aplicado numeric(5, 2),
  ADD COLUMN desconto_valor numeric(10, 2),
  ADD COLUMN comissao_percentual_aplicada numeric(5, 2),
  ADD COLUMN comissao_valor numeric(10, 2),
  ADD COLUMN valor_liquido_bagpoint numeric(10, 2),
  ADD COLUMN competencia date,
  ADD COLUMN aceite_token text,
  ADD COLUMN aceite_versao text NOT NULL DEFAULT '2026-09',
  ADD COLUMN aceite_em timestamptz;

ALTER TABLE atendimentos
  ADD CONSTRAINT atendimentos_documento_tipo_check
    CHECK (cliente_documento_tipo IS NULL OR cliente_documento_tipo IN ('CPF', 'Passaporte'));

CREATE UNIQUE INDEX atendimentos_aceite_token_unique
  ON atendimentos (aceite_token) WHERE aceite_token IS NOT NULL;
CREATE INDEX atendimentos_competencia_parceiro_idx
  ON atendimentos (competencia, parceiro_id) WHERE parceiro_id IS NOT NULL;

CREATE TABLE repasses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parceiro_id uuid NOT NULL REFERENCES parceiros(id),
  competencia date NOT NULL,
  quantidade_atendimentos integer NOT NULL DEFAULT 0 CHECK (quantidade_atendimentos >= 0),
  quantidade_malas integer NOT NULL DEFAULT 0 CHECK (quantidade_malas >= 0),
  valor_bruto numeric(12, 2) NOT NULL DEFAULT 0,
  desconto_total numeric(12, 2) NOT NULL DEFAULT 0,
  comissao_total numeric(12, 2) NOT NULL DEFAULT 0,
  valor_liquido_bagpoint numeric(12, 2) NOT NULL DEFAULT 0,
  vencimento date NOT NULL,
  status text NOT NULL DEFAULT 'em_aberto'
    CHECK (status IN ('em_aberto', 'programado', 'pago', 'vencido', 'bloqueado')),
  data_pagamento timestamptz,
  comprovante_referencia text,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (parceiro_id, competencia)
);

CREATE INDEX repasses_competencia_status_idx ON repasses (competencia, status, vencimento);

CREATE TABLE repasse_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repasse_id uuid NOT NULL REFERENCES repasses(id),
  usuario_id uuid NOT NULL REFERENCES usuarios(id),
  status_anterior text,
  status_novo text NOT NULL,
  comprovante_referencia text,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX repasse_eventos_repasse_idx
  ON repasse_eventos (repasse_id, created_at DESC);

CREATE TABLE parceiro_auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parceiro_id uuid NOT NULL REFERENCES parceiros(id),
  usuario_id uuid NOT NULL REFERENCES usuarios(id),
  acao text NOT NULL,
  alteracoes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX parceiro_auditoria_parceiro_idx
  ON parceiro_auditoria (parceiro_id, created_at DESC);
