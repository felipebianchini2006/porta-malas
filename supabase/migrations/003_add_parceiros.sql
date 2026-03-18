-- Tabela de parceiros
CREATE TABLE public.parceiros (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('Hotel', 'Airbnb', 'Rua', 'Outro')),
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read parceiros" ON public.parceiros FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert parceiros" ON public.parceiros FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update parceiros" ON public.parceiros FOR UPDATE TO authenticated USING (true);

-- FK em atendimentos
ALTER TABLE public.atendimentos ADD COLUMN parceiro_id uuid REFERENCES public.parceiros(id) ON DELETE SET NULL;
CREATE INDEX idx_atendimentos_parceiro_id ON public.atendimentos(parceiro_id);
