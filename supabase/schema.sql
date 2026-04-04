create extension if not exists pgcrypto;

create table if not exists zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text default 'Pune',
  connectivity_type text,
  created_at timestamptz default now()
);

create table if not exists drivers (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(email)),
  full_name text not null,
  phone text,
  employee_code text,
  truck_id text,
  assigned_zone_id uuid references zones(id),
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists drivers_email_unique_idx on drivers (lower(email));
create unique index if not exists drivers_employee_code_unique_idx on drivers (employee_code) where employee_code is not null;
create unique index if not exists drivers_truck_id_unique_idx on drivers (truck_id) where truck_id is not null;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_drivers_updated_at on drivers;
create trigger set_drivers_updated_at
before update on drivers
for each row
execute function set_updated_at();

create table if not exists bins (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid references zones(id),
  name text not null,
  lat float8 not null,
  lng float8 not null,
  fill_level integer default 0 check (fill_level between 0 and 100),
  weight_kg float4 default 0,
  odor_level float4 default 0,
  temperature_c float4 default 0,
  battery_level integer default 100,
  is_online boolean default true,
  last_seen_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists fill_history (
  id uuid primary key default gen_random_uuid(),
  bin_id uuid references bins(id) on delete cascade,
  fill_level integer,
  weight_kg float4,
  odor_level float4,
  recorded_at timestamptz default now()
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  bin_id uuid references bins(id) on delete cascade,
  type text check (type in ('overflow_risk','odor_spike','low_battery','sensor_offline','tamper')),
  severity text check (severity in ('critical','high','medium','low')),
  message text,
  resolved boolean default false,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

create table if not exists collection_events (
  id uuid primary key default gen_random_uuid(),
  bin_id uuid references bins(id),
  truck_id text,
  driver_name text,
  fill_at_collection integer,
  weight_collected_kg float4,
  co2_saved_kg float4,
  collected_at timestamptz default now()
);

alter table zones enable row level security;
alter table drivers enable row level security;
alter table bins enable row level security;
alter table fill_history enable row level security;
alter table alerts enable row level security;
alter table collection_events enable row level security;

drop policy if exists "authenticated can read zones" on zones;

create policy "authenticated can read zones" on zones
for select to authenticated using (true);

drop policy if exists "authenticated can read own driver profile" on drivers;

create policy "authenticated can read own driver profile" on drivers
for select to authenticated using (lower(email) = lower(coalesce(auth.jwt()->>'email', '')));

drop policy if exists "authenticated can read bins" on bins;

create policy "authenticated can read bins" on bins
for select to authenticated using (true);

drop policy if exists "authenticated can read fill history" on fill_history;

create policy "authenticated can read fill history" on fill_history
for select to authenticated using (true);

drop policy if exists "authenticated can read alerts" on alerts;

create policy "authenticated can read alerts" on alerts
for select to authenticated using (true);

drop policy if exists "authenticated can read collection events" on collection_events;

create policy "authenticated can read collection events" on collection_events
for select to authenticated using (true);

drop policy if exists "authenticated can update alerts" on alerts;

create policy "authenticated can update alerts" on alerts
for update to authenticated using (true) with check (true);

drop policy if exists "authenticated can insert collection events" on collection_events;

create policy "authenticated can insert collection events" on collection_events
for insert to authenticated with check (true);

drop policy if exists "authenticated can update bins" on bins;

create policy "authenticated can update bins" on bins
for update to authenticated using (true) with check (true);

drop policy if exists "anon can create citizen alerts" on alerts;

create policy "anon can create citizen alerts" on alerts
for insert to anon
with check (severity = 'medium');

drop policy if exists "service role can manage zones" on zones;

create policy "service role can manage zones" on zones
for all to service_role using (true) with check (true);

drop policy if exists "service role can manage drivers" on drivers;

create policy "service role can manage drivers" on drivers
for all to service_role using (true) with check (true);

drop policy if exists "service role can manage bins" on bins;

create policy "service role can manage bins" on bins
for all to service_role using (true) with check (true);

drop policy if exists "service role can manage fill history" on fill_history;

create policy "service role can manage fill history" on fill_history
for all to service_role using (true) with check (true);

drop policy if exists "service role can manage alerts" on alerts;

create policy "service role can manage alerts" on alerts
for all to service_role using (true) with check (true);

drop policy if exists "service role can manage collection events" on collection_events;

create policy "service role can manage collection events" on collection_events
for all to service_role using (true) with check (true);

do $$
begin
  alter publication supabase_realtime add table bins;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table alerts;
exception
  when duplicate_object then null;
end $$;
