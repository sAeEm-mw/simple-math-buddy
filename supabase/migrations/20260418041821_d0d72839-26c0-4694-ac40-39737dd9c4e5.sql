-- ============ ENUMS ============
create type public.app_role as enum ('patient','pharmacy','doctor','admin');
create type public.order_status as enum ('pending','confirmed','preparing','out_for_delivery','delivered','cancelled');
create type public.payment_status as enum ('pending','held','released','refunded');
create type public.appointment_status as enum ('pending','confirmed','completed','cancelled');
create type public.blood_group as enum ('A+','A-','B+','B-','AB+','AB-','O+','O-');

-- ============ UPDATED_AT TRIGGER FN ============
create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  city text default 'Kharghar',
  lat double precision,
  lng double precision,
  blood_group public.blood_group,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = user_id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = user_id);
create trigger profiles_updated before update on public.profiles for each row execute function public.update_updated_at_column();

-- ============ USER ROLES (separate, security-definer check) ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users see own roles" on public.user_roles for select using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "Users insert own role" on public.user_roles for insert with check (auth.uid() = user_id);
create policy "Admins manage roles" on public.user_roles for all using (public.has_role(auth.uid(),'admin'));

-- Auto-create profile + default patient role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
  on conflict (user_id) do nothing;
  insert into public.user_roles (user_id, role)
  values (new.id, coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'patient'))
  on conflict do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ============ PHARMACIES ============
create table public.pharmacies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  address text not null,
  city text not null default 'Kharghar',
  lat double precision,
  lng double precision,
  phone text,
  is_open boolean not null default true,
  rating numeric(3,2) default 4.5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.pharmacies enable row level security;
create policy "Anyone signed-in can view pharmacies" on public.pharmacies for select to authenticated using (true);
create policy "Owners manage pharmacy" on public.pharmacies for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Admins manage pharmacies" on public.pharmacies for all using (public.has_role(auth.uid(),'admin'));
create trigger pharmacies_updated before update on public.pharmacies for each row execute function public.update_updated_at_column();

-- ============ MEDICINES ============
create table public.medicines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  generic_name text,
  manufacturer text,
  strength text,
  form text,
  mrp numeric(10,2),
  created_at timestamptz not null default now()
);
alter table public.medicines enable row level security;
create policy "Anyone signed-in can view medicines" on public.medicines for select to authenticated using (true);
create policy "Admins manage medicines" on public.medicines for all using (public.has_role(auth.uid(),'admin'));

-- ============ PHARMACY INVENTORY ============
create table public.pharmacy_inventory (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  med_id uuid not null references public.medicines(id) on delete cascade,
  price numeric(10,2) not null,
  stock_count integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (pharmacy_id, med_id)
);
alter table public.pharmacy_inventory enable row level security;
create policy "Anyone signed-in can view inventory" on public.pharmacy_inventory for select to authenticated using (true);
create policy "Pharmacy owner manages inventory" on public.pharmacy_inventory for all
  using (exists (select 1 from public.pharmacies p where p.id = pharmacy_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.pharmacies p where p.id = pharmacy_id and p.user_id = auth.uid()));
create trigger inventory_updated before update on public.pharmacy_inventory for each row execute function public.update_updated_at_column();

-- ============ ORDERS ============
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  total numeric(10,2) not null,
  delivery_address text not null,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;
create policy "Patients view own orders" on public.orders for select using (auth.uid() = patient_id);
create policy "Patients create orders" on public.orders for insert with check (auth.uid() = patient_id);
create policy "Pharmacy views own orders" on public.orders for select
  using (exists (select 1 from public.pharmacies p where p.id = pharmacy_id and p.user_id = auth.uid()));
create policy "Pharmacy updates own orders" on public.orders for update
  using (exists (select 1 from public.pharmacies p where p.id = pharmacy_id and p.user_id = auth.uid()));
create policy "Admins view all orders" on public.orders for select using (public.has_role(auth.uid(),'admin'));
create trigger orders_updated before update on public.orders for each row execute function public.update_updated_at_column();

-- ============ ORDER ITEMS ============
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  med_id uuid,
  med_name text not null,
  qty integer not null,
  unit_price numeric(10,2) not null
);
alter table public.order_items enable row level security;
create policy "View order items if can view order" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (
    o.patient_id = auth.uid()
    or exists (select 1 from public.pharmacies p where p.id = o.pharmacy_id and p.user_id = auth.uid())
    or public.has_role(auth.uid(),'admin')
  ))
);
create policy "Patients insert items into own orders" on public.order_items for insert with check (
  exists (select 1 from public.orders o where o.id = order_id and o.patient_id = auth.uid())
);

-- ============ DOCTORS ============
create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  full_name text not null,
  specialization text not null,
  qualification text,
  city text default 'Kharghar',
  lat double precision,
  lng double precision,
  consultation_fee numeric(10,2) default 500,
  is_available boolean not null default true,
  rating numeric(3,2) default 4.6,
  created_at timestamptz not null default now()
);
alter table public.doctors enable row level security;
create policy "Anyone signed-in can view doctors" on public.doctors for select to authenticated using (true);
create policy "Doctors manage own profile" on public.doctors for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ APPOINTMENTS ============
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  scheduled_at timestamptz,
  reason text,
  status public.appointment_status not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.appointments enable row level security;
create policy "Patients view own appointments" on public.appointments for select using (auth.uid() = patient_id);
create policy "Doctors view their appointments" on public.appointments for select
  using (exists (select 1 from public.doctors d where d.id = doctor_id and d.user_id = auth.uid()));
create policy "Patients create appointments" on public.appointments for insert with check (auth.uid() = patient_id);
create policy "Doctors update their appointments" on public.appointments for update
  using (exists (select 1 from public.doctors d where d.id = doctor_id and d.user_id = auth.uid()));

-- ============ PRESCRIPTIONS ============
create table public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  image_url text,
  ocr_text text,
  extracted jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.prescriptions enable row level security;
create policy "Patients view own prescriptions" on public.prescriptions for select using (auth.uid() = patient_id);
create policy "Patients insert own prescriptions" on public.prescriptions for insert with check (auth.uid() = patient_id);

-- ============ BLOOD REQUESTS ============
create table public.blood_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  patient_name text not null,
  blood_group public.blood_group not null,
  units_needed integer not null default 1,
  hospital text not null,
  city text default 'Kharghar',
  lat double precision,
  lng double precision,
  contact_phone text not null,
  notes text,
  is_urgent boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.blood_requests enable row level security;
create policy "Signed-in can view active requests" on public.blood_requests for select to authenticated using (true);
create policy "Users create blood requests" on public.blood_requests for insert with check (auth.uid() = requester_id);
create policy "Users update own requests" on public.blood_requests for update using (auth.uid() = requester_id);
create policy "Users delete own requests" on public.blood_requests for delete using (auth.uid() = requester_id);

create table public.blood_request_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.blood_requests(id) on delete cascade,
  responder_id uuid not null references auth.users(id) on delete cascade,
  message text,
  created_at timestamptz not null default now(),
  unique (request_id, responder_id)
);
alter table public.blood_request_responses enable row level security;
create policy "Requester or responder views responses" on public.blood_request_responses for select using (
  auth.uid() = responder_id
  or exists (select 1 from public.blood_requests r where r.id = request_id and r.requester_id = auth.uid())
);
create policy "Users create own response" on public.blood_request_responses for insert with check (auth.uid() = responder_id);

-- ============ NOTIFICATIONS ============
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
create policy "Users view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications" on public.notifications for update using (auth.uid() = user_id);
create policy "Authenticated can insert notifications" on public.notifications for insert to authenticated with check (true);

-- ============ SEARCH LOGS ============
create table public.search_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  query text not null,
  results_count integer default 0,
  created_at timestamptz not null default now()
);
alter table public.search_logs enable row level security;
create policy "Authenticated can insert logs" on public.search_logs for insert to authenticated with check (true);
create policy "Users view own logs" on public.search_logs for select using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));

-- ============ SEED MEDICINES + PHARMACIES + INVENTORY ============
insert into public.medicines (name, generic_name, manufacturer, strength, form, mrp) values
  ('Paracetamol 500mg','Paracetamol','Cipla','500mg','Tablet',25),
  ('Azithromycin 500mg','Azithromycin','Sun Pharma','500mg','Tablet',120),
  ('Metformin 500mg','Metformin HCl','USV','500mg','Tablet',45),
  ('Amoxicillin 500mg','Amoxicillin','Cipla','500mg','Capsule',95),
  ('Pantoprazole 40mg','Pantoprazole','Alkem','40mg','Tablet',85),
  ('Cetirizine 10mg','Cetirizine','Dr Reddy''s','10mg','Tablet',30),
  ('Atorvastatin 10mg','Atorvastatin','Lupin','10mg','Tablet',110),
  ('Amlodipine 5mg','Amlodipine','Torrent','5mg','Tablet',55);

insert into public.pharmacies (name, address, city, lat, lng, phone, rating) values
  ('Apollo Pharmacy','Sector 12, Near Station','Kharghar',19.0470,73.0697,'+912227748800',4.7),
  ('MedPlus','Sector 7, Central Avenue','Kharghar',19.0420,73.0625,'+912227748811',4.5),
  ('Wellness Forever','Sector 20, Plaza','Kharghar',19.0395,73.0712,'+912227748822',4.6),
  ('Noble Chemists','Sector 4, Market Rd','Kharghar',19.0510,73.0660,'+912227748833',4.4),
  ('1mg Store','Sector 35, Hiranandani','Kharghar',19.0455,73.0750,'+912227748844',4.8);

-- Inventory: random-ish prices per pharmacy for each medicine
insert into public.pharmacy_inventory (pharmacy_id, med_id, price, stock_count)
select p.id, m.id,
  round((m.mrp * (0.65 + random()*0.30))::numeric, 2),
  (20 + floor(random()*80))::int
from public.pharmacies p cross join public.medicines m;