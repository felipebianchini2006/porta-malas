CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'operador' CHECK (role IN ('admin', 'operador')),
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parceiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('Hotel', 'Airbnb', 'Hostel', 'Rua', 'Outro')),
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS atendimentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo text NOT NULL UNIQUE,
  cliente_nome text NOT NULL,
  cliente_telefone text NOT NULL,
  observacoes text,
  valor_cobrado numeric(10, 2),
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'retirado')),
  parceiro_id uuid REFERENCES parceiros(id) ON DELETE SET NULL,
  operador_checkin_id uuid NOT NULL REFERENCES usuarios(id),
  operador_retirada_id uuid REFERENCES usuarios(id),
  data_checkin timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_retirada timestamptz,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS malas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  atendimento_id uuid NOT NULL REFERENCES atendimentos(id) ON DELETE CASCADE,
  identificacao_interna text NOT NULL,
  descricao text,
  status text NOT NULL DEFAULT 'em_guarda' CHECK (status IN ('em_guarda', 'retirada')),
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fotos_malas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mala_id uuid NOT NULL REFERENCES malas(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS protocol_counters (
  day date PRIMARY KEY,
  last_value integer NOT NULL CHECK (last_value > 0)
);

CREATE INDEX IF NOT EXISTS atendimentos_status_idx ON atendimentos(status);
CREATE INDEX IF NOT EXISTS atendimentos_data_checkin_idx ON atendimentos(data_checkin);
CREATE INDEX IF NOT EXISTS atendimentos_parceiro_id_idx ON atendimentos(parceiro_id);
CREATE INDEX IF NOT EXISTS malas_atendimento_id_idx ON malas(atendimento_id);
CREATE INDEX IF NOT EXISTS fotos_malas_mala_id_idx ON fotos_malas(mala_id);
