CREATE TABLE categorias_mala (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  emoji text NOT NULL,
  nome text NOT NULL,
  exemplos text NOT NULL DEFAULT '',
  descricao text NOT NULL,
  preco_diaria numeric(10, 2) NOT NULL CHECK (preco_diaria >= 0),
  preco_meio_periodo numeric(10, 2) NOT NULL DEFAULT 0 CHECK (preco_meio_periodo >= 0),
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0 CHECK (ordem >= 0),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX categorias_mala_nome_unique ON categorias_mala (lower(nome));
CREATE INDEX categorias_mala_ativas_ordem_idx ON categorias_mala (ativo, ordem, nome);

INSERT INTO categorias_mala (
  id, emoji, nome, exemplos, descricao, preco_diaria, preco_meio_periodo, ativo, ordem
) VALUES
  ('small', '🟢', 'Small Bag', 'bolsa, mochila pequena', 'Small Bag', 20, 15, true, 10),
  ('cabin', '🔵', 'Cabin Size', 'mala de mão', 'Cabin Size', 30, 20, true, 20),
  ('large', '🟠', 'Large Luggage', 'mala grande', 'Large Luggage', 45, 30, true, 30),
  ('special', '⚫', 'Special Items', 'prancha, bike', 'Special Items', 70, 0, true, 40)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE malas
  ADD COLUMN categoria_id text REFERENCES categorias_mala(id) ON DELETE SET NULL,
  ADD COLUMN categoria_nome text,
  ADD COLUMN preco_diaria_aplicado numeric(10, 2),
  ADD COLUMN preco_meio_periodo_aplicado numeric(10, 2);

CREATE INDEX malas_categoria_id_idx ON malas (categoria_id);
