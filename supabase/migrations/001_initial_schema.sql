-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USUARIOS TABLE
-- ============================================================
create table if not exists public.usuarios (
  id uuid references auth.users(id) on delete cascade primary key,
  nome text not null,
  role text not null default 'operador' check (role in ('admin', 'operador')),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.usuarios enable row level security;

create policy "Authenticated users can read usuarios"
  on public.usuarios for select
  to authenticated
  using (true);

create policy "Authenticated users can insert usuarios"
  on public.usuarios for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update usuarios"
  on public.usuarios for update
  to authenticated
  using (true);

-- ============================================================
-- GERAR_PROTOCOLO FUNCTION
-- ============================================================
create or replace function public.gerar_protocolo()
returns text
language plpgsql
as $$
declare
  v_date text;
  v_seq  bigint;
  v_protocolo text;
begin
  v_date := to_char(now(), 'YYYYMMDD');
  select count(*) + 1
    into v_seq
    from public.atendimentos
   where data_checkin::date = current_date;
  v_protocolo := v_date || '-' || lpad(v_seq::text, 4, '0');
  return v_protocolo;
end;
$$;

-- ============================================================
-- ATENDIMENTOS TABLE
-- ============================================================
create table if not exists public.atendimentos (
  id                   uuid primary key default uuid_generate_v4(),
  protocolo            text not null unique,
  cliente_nome         text not null,
  cliente_telefone     text not null,
  observacoes          text,
  valor_cobrado        numeric(10, 2),
  status               text not null default 'ativo' check (status in ('ativo', 'retirado')),
  operador_checkin_id  uuid not null references public.usuarios(id),
  operador_retirada_id uuid references public.usuarios(id),
  data_checkin         timestamptz not null default now(),
  data_retirada        timestamptz,
  created_at           timestamptz not null default now()
);

alter table public.atendimentos enable row level security;

create policy "Authenticated users can read atendimentos"
  on public.atendimentos for select
  to authenticated
  using (true);

create policy "Authenticated users can insert atendimentos"
  on public.atendimentos for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update atendimentos"
  on public.atendimentos for update
  to authenticated
  using (true);

create policy "Authenticated users can delete atendimentos"
  on public.atendimentos for delete
  to authenticated
  using (true);

-- ============================================================
-- MALAS TABLE
-- ============================================================
create table if not exists public.malas (
  id                      uuid primary key default uuid_generate_v4(),
  atendimento_id          uuid not null references public.atendimentos(id) on delete cascade,
  identificacao_interna   text not null,
  descricao               text,
  status                  text not null default 'em_guarda' check (status in ('em_guarda', 'retirada')),
  observacoes             text,
  created_at              timestamptz not null default now()
);

alter table public.malas enable row level security;

create policy "Authenticated users can read malas"
  on public.malas for select
  to authenticated
  using (true);

create policy "Authenticated users can insert malas"
  on public.malas for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update malas"
  on public.malas for update
  to authenticated
  using (true);

create policy "Authenticated users can delete malas"
  on public.malas for delete
  to authenticated
  using (true);

-- ============================================================
-- FOTOS_MALAS TABLE
-- ============================================================
create table if not exists public.fotos_malas (
  id           uuid primary key default uuid_generate_v4(),
  mala_id      uuid not null references public.malas(id) on delete cascade,
  storage_path text not null,
  url          text not null,
  created_at   timestamptz not null default now()
);

alter table public.fotos_malas enable row level security;

create policy "Authenticated users can read fotos_malas"
  on public.fotos_malas for select
  to authenticated
  using (true);

create policy "Authenticated users can insert fotos_malas"
  on public.fotos_malas for insert
  to authenticated
  with check (true);

create policy "Authenticated users can delete fotos_malas"
  on public.fotos_malas for delete
  to authenticated
  using (true);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_atendimentos_status on public.atendimentos(status);
create index if not exists idx_atendimentos_data_checkin on public.atendimentos(data_checkin);
create index if not exists idx_malas_atendimento_id on public.malas(atendimento_id);
create index if not exists idx_fotos_malas_mala_id on public.fotos_malas(mala_id);
