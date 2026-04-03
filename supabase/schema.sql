create extension if not exists pgcrypto;

create table if not exists zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text default 'Pune',
  connectivity_type text,
  created_at timestamptz default now()
);

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
alter table bins enable row level security;
alter table fill_history enable row level security;
alter table alerts enable row level security;
alter table collection_events enable row level security;

create policy "authenticated can read zones" on zones
for select to authenticated using (true);

create policy "authenticated can read bins" on bins
for select to authenticated using (true);

create policy "authenticated can read fill history" on fill_history
for select to authenticated using (true);

create policy "authenticated can read alerts" on alerts
for select to authenticated using (true);

create policy "authenticated can read collection events" on collection_events
for select to authenticated using (true);

create policy "authenticated can update alerts" on alerts
for update to authenticated using (true) with check (true);

create policy "authenticated can insert collection events" on collection_events
for insert to authenticated with check (true);

create policy "authenticated can update bins" on bins
for update to authenticated using (true) with check (true);

create policy "anon can create citizen alerts" on alerts
for insert to anon
with check (severity = 'medium');

create policy "service role can manage zones" on zones
for all to service_role using (true) with check (true);

create policy "service role can manage bins" on bins
for all to service_role using (true) with check (true);

create policy "service role can manage fill history" on fill_history
for all to service_role using (true) with check (true);

create policy "service role can manage alerts" on alerts
for all to service_role using (true) with check (true);

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
