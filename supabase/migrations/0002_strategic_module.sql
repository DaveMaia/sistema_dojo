-- Strategic management module schema additions
alter table students
  add column if not exists class_id uuid references classes(id);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  academy_id bigint not null references academies(id),
  student_id uuid references students(id),
  invoice_id uuid references invoices(id),
  amount_numeric integer not null,
  status text check (status in ('PENDING','PAID','FAILED')) default 'PENDING',
  payment_method text check (payment_method in ('PIX','CARD','CASH')) not null,
  billing_category text check (billing_category in ('MEMBERSHIP','TOURNAMENT','MERCH')) not null,
  student_tenure_days integer,
  payment_origin text check (payment_origin in ('WEB','MOBILE')) not null,
  paid_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists visitors (
  id uuid primary key default gen_random_uuid(),
  academy_id bigint not null references academies(id),
  name text not null,
  contact text,
  visited_at date not null default now(),
  vibe_score integer check (vibe_score between 1 and 5),
  conversion_status text check (conversion_status in ('LEAD','STUDENT','INACTIVE')) default 'LEAD',
  follow_up_status text check (follow_up_status in ('PENDING','DONE')) default 'PENDING',
  follow_up_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists payments_academy_idx on payments (academy_id);
create index if not exists payments_paid_at_idx on payments (paid_at);
create index if not exists payments_billing_category_idx on payments (billing_category);
create index if not exists visitors_academy_idx on visitors (academy_id);
create index if not exists visitors_conversion_status_idx on visitors (conversion_status);

alter table payments enable row level security;
alter table visitors enable row level security;

create policy payments_select on payments for select using (academy_id = (auth.jwt()->>'academy_id')::bigint);
create policy payments_insert on payments for insert with check (academy_id = (auth.jwt()->>'academy_id')::bigint);
create policy payments_update on payments for update using (academy_id = (auth.jwt()->>'academy_id')::bigint);
create policy payments_delete on payments for delete using (academy_id = (auth.jwt()->>'academy_id')::bigint);

create policy visitors_select on visitors for select using (academy_id = (auth.jwt()->>'academy_id')::bigint);
create policy visitors_insert on visitors for insert with check (academy_id = (auth.jwt()->>'academy_id')::bigint);
create policy visitors_update on visitors for update using (academy_id = (auth.jwt()->>'academy_id')::bigint);
create policy visitors_delete on visitors for delete using (academy_id = (auth.jwt()->>'academy_id')::bigint);
