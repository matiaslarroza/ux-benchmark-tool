-- UX Benchmark Tool - Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
create policy "Users are viewable by authenticated users" on public.users
  for select using (auth.role() = 'authenticated');
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Templates table
create table public.templates (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null default '',
  sections jsonb not null default '[]'::jsonb,
  suggested_tags text[] not null default '{}',
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.templates enable row level security;
create policy "Templates are viewable by authenticated users" on public.templates
  for select using (auth.role() = 'authenticated');
create policy "Authenticated users can create templates" on public.templates
  for insert with check (auth.role() = 'authenticated');
create policy "Template creators can update" on public.templates
  for update using (auth.uid() = created_by);
create policy "Template creators can delete" on public.templates
  for delete using (auth.uid() = created_by);

-- Benchmarks table
create table public.benchmarks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null default '',
  category text not null default '',
  tags text[] not null default '{}',
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'draft' check (status in ('draft', 'in_progress', 'completed')),
  template_id uuid references public.templates(id) on delete set null
);

alter table public.benchmarks enable row level security;
create policy "Benchmarks are viewable by authenticated users" on public.benchmarks
  for select using (auth.role() = 'authenticated');
create policy "Authenticated users can create benchmarks" on public.benchmarks
  for insert with check (auth.role() = 'authenticated');
create policy "Benchmark creators can update" on public.benchmarks
  for update using (auth.uid() = created_by);
create policy "Benchmark creators can delete" on public.benchmarks
  for delete using (auth.uid() = created_by);

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger benchmarks_updated_at
  before update on public.benchmarks
  for each row execute function public.update_updated_at();

-- Competitors table
create table public.competitors (
  id uuid default uuid_generate_v4() primary key,
  benchmark_id uuid references public.benchmarks(id) on delete cascade not null,
  name text not null,
  url text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

alter table public.competitors enable row level security;
create policy "Competitors are viewable by authenticated users" on public.competitors
  for select using (auth.role() = 'authenticated');
create policy "Authenticated users can create competitors" on public.competitors
  for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update competitors" on public.competitors
  for update using (auth.role() = 'authenticated');
create policy "Authenticated users can delete competitors" on public.competitors
  for delete using (auth.role() = 'authenticated');

-- Screenshots table
create table public.screenshots (
  id uuid default uuid_generate_v4() primary key,
  competitor_id uuid references public.competitors(id) on delete cascade not null,
  image_url text not null,
  caption text not null default '',
  section text not null default '',
  tags text[] not null default '{}',
  figma_node_id text,
  figma_file_key text,
  figma_url text,
  created_at timestamptz not null default now()
);

alter table public.screenshots enable row level security;
create policy "Screenshots are viewable by authenticated users" on public.screenshots
  for select using (auth.role() = 'authenticated');
create policy "Authenticated users can create screenshots" on public.screenshots
  for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update screenshots" on public.screenshots
  for update using (auth.role() = 'authenticated');
create policy "Authenticated users can delete screenshots" on public.screenshots
  for delete using (auth.role() = 'authenticated');

-- Storage bucket for screenshots
insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload screenshots" on storage.objects
  for insert with check (
    bucket_id = 'screenshots' and auth.role() = 'authenticated'
  );

create policy "Screenshots are publicly viewable" on storage.objects
  for select using (bucket_id = 'screenshots');

create policy "Authenticated users can delete screenshots" on storage.objects
  for delete using (
    bucket_id = 'screenshots' and auth.role() = 'authenticated'
  );

-- Seed default templates
insert into public.templates (name, description, sections, suggested_tags) values
(
  'Benchmark de Checkout',
  'Template para analizar flujos de checkout y pago de competidores',
  '[{"name": "Carrito", "description": "Vista del carrito de compras"}, {"name": "Datos personales", "description": "Formulario de datos del comprador"}, {"name": "Método de pago", "description": "Selección y carga de medio de pago"}, {"name": "Confirmación", "description": "Pantalla de confirmación de compra"}, {"name": "Post-compra", "description": "Email o pantalla post-compra"}]'::jsonb,
  '{"checkout", "ecommerce", "pagos"}'
),
(
  'Benchmark de Onboarding',
  'Template para analizar flujos de registro y primera experiencia',
  '[{"name": "Landing/Signup", "description": "Página de registro o descarga"}, {"name": "Verificación", "description": "Email verification, SMS, etc."}, {"name": "Setup inicial", "description": "Configuración de perfil o preferencias"}, {"name": "Tutorial/Tour", "description": "Guía o tutorial introductorio"}, {"name": "Primera acción clave", "description": "Momento aha o primera acción de valor"}]'::jsonb,
  '{"onboarding", "registro", "activación"}'
),
(
  'Benchmark de Navegación',
  'Template para analizar patrones de navegación y arquitectura de información',
  '[{"name": "Home/Dashboard", "description": "Página principal o dashboard"}, {"name": "Menú principal", "description": "Navegación principal y estructura"}, {"name": "Búsqueda", "description": "Experiencia de búsqueda"}, {"name": "Categorías/Filtros", "description": "Sistema de categorización y filtrado"}, {"name": "Breadcrumbs/Jerarquía", "description": "Indicadores de ubicación y jerarquía"}]'::jsonb,
  '{"navegación", "IA", "menú"}'
);
