-- Adiciona coluna email à tabela usuarios
alter table public.usuarios add column if not exists email text;

-- Atualiza trigger para incluir email
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.usuarios (id, nome, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.email,
    'operador'
  )
  on conflict (id) do update set
    email = excluded.email,
    nome = case when public.usuarios.nome = '' then excluded.nome else public.usuarios.nome end;
  return new;
end;
$$;
