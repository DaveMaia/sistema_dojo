-- Professor module: stats, badges, attendance enhancements, tournament metadata
create table if not exists student_stats (
  id uuid primary key default gen_random_uuid(),
  academy_id bigint not null references academies(id),
  student_id uuid not null references students(id),
  resistencia integer check (resistencia between 0 and 100) default 0,
  tecnica_guarda integer check (tecnica_guarda between 0 and 100) default 0,
  passagem_guarda integer check (passagem_guarda between 0 and 100) default 0,
  finalizacao integer check (finalizacao between 0 and 100) default 0,
  psicologico integer check (psicologico between 0 and 100) default 0,
  updated_at timestamptz default now(),
  unique (student_id)
);

create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  academy_id bigint not null references academies(id),
  nome text not null,
  descricao text,
  icone_url text,
  is_auto boolean default false,
  created_at timestamptz default now()
);

create table if not exists student_badges (
  id uuid primary key default gen_random_uuid(),
  academy_id bigint not null references academies(id),
  student_id uuid not null references students(id),
  badge_id uuid not null references badges(id),
  awarded_by uuid,
  awarded_at timestamptz default now(),
  is_featured boolean default false
);

alter table attendances
  add column if not exists checked_in_by uuid,
  add column if not exists checked_in_at timestamptz default now();

alter table tournament_participants
  add column if not exists weight_class text,
  add column if not exists belt_class text;

create index if not exists student_stats_academy_idx on student_stats (academy_id);
create index if not exists student_badges_student_idx on student_badges (student_id);
create index if not exists badges_academy_idx on badges (academy_id);

alter table student_stats enable row level security;
alter table badges enable row level security;
alter table student_badges enable row level security;

create policy student_stats_select on student_stats for select using (academy_id = (auth.jwt()->>'academy_id')::bigint);
create policy student_stats_insert on student_stats for insert with check (academy_id = (auth.jwt()->>'academy_id')::bigint);
create policy student_stats_update on student_stats for update using (academy_id = (auth.jwt()->>'academy_id')::bigint);
create policy student_stats_delete on student_stats for delete using (academy_id = (auth.jwt()->>'academy_id')::bigint);

create policy badges_select on badges for select using (academy_id = (auth.jwt()->>'academy_id')::bigint);
create policy badges_insert on badges for insert with check (academy_id = (auth.jwt()->>'academy_id')::bigint);
create policy badges_update on badges for update using (academy_id = (auth.jwt()->>'academy_id')::bigint);
create policy badges_delete on badges for delete using (academy_id = (auth.jwt()->>'academy_id')::bigint);

create policy student_badges_select on student_badges for select using (academy_id = (auth.jwt()->>'academy_id')::bigint);
create policy student_badges_insert on student_badges for insert with check (academy_id = (auth.jwt()->>'academy_id')::bigint);
create policy student_badges_update on student_badges for update using (academy_id = (auth.jwt()->>'academy_id')::bigint);
create policy student_badges_delete on student_badges for delete using (academy_id = (auth.jwt()->>'academy_id')::bigint);
