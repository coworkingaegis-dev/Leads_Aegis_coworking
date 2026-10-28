-- Aegis Coworking CRM — run this once in Supabase → SQL Editor

create table if not exists public.clients (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  name             text,
  phone            text,
  source           text check (source in ('Web','Walk-in','WhatsApp','Referral')),
  service          text check (service in ('Dedicated Desk','Flexi Desk','Private Office','Virtual Office','Meeting Room','Day Pass')),

  proposal         boolean,
  payment          boolean,
  lease_agreement  boolean,
  access_rp        boolean,   -- Registered on AccessRP
  kyc              boolean,
  license          boolean,
  tawtheeq         boolean,

  deal_value       numeric(12,2),  -- AED value of the deal
  referral_name    text,
  referral_percent numeric(5,2),   -- % fee
  referral_amount  numeric(12,2) generated always as
                     (round(coalesce(deal_value,0) * coalesce(referral_percent,0) / 100, 2)) stored,

  status           text check (status in ('Follow-up','Pending Payment','Closed','Lost')) default 'Follow-up',
  notes            text
);

-- keep updated_at fresh
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

drop trigger if exists clients_updated_at on public.clients;
create trigger clients_updated_at before update on public.clients
for each row execute function public.set_updated_at();

-- Security: only logged-in team members can read/write
alter table public.clients enable row level security;

drop policy if exists "team can read"   on public.clients;
drop policy if exists "team can insert" on public.clients;
drop policy if exists "team can update" on public.clients;
drop policy if exists "team can delete" on public.clients;

create policy "team can read"   on public.clients for select to authenticated using (true);
create policy "team can insert" on public.clients for insert to authenticated with check (true);
create policy "team can update" on public.clients for update to authenticated using (true) with check (true);
create policy "team can delete" on public.clients for delete to authenticated using (true);
