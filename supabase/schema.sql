-- ============================================
-- ENUMS
-- ============================================
create type deliverable_status as enum (
  'to_contact', 'validated', 'product_received',
  'to_create', 'to_validate', 'scheduled', 'published'
);

create type platform as enum ('instagram', 'tiktok', 'youtube', 'other');
create type deliverable_type as enum ('reel', 'story', 'post', 'video', 'other');

-- ============================================
-- TABLES
-- ============================================
create table brands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  contact_name text,
  contact_email text,
  notes text,
  created_at timestamptz default now()
);

create table collaborations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  brand_id uuid references brands(id) on delete set null,
  title text not null,
  compensation numeric(10,2),
  collab_date date,
  deadline_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table deliverables (
  id uuid primary key default gen_random_uuid(),
  collaboration_id uuid not null references collaborations(id) on delete cascade,
  type deliverable_type not null,
  platform platform not null,
  status deliverable_status not null default 'to_contact',
  deadline_date date,
  publish_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  collaboration_id uuid references collaborations(id) on delete cascade,
  deliverable_id uuid references deliverables(id) on delete cascade,
  title text not null,
  is_done boolean default false,
  deadline_date date,
  created_at timestamptz default now()
);

create table files (
  id uuid primary key default gen_random_uuid(),
  collaboration_id uuid not null references collaborations(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  file_type text,
  created_at timestamptz default now()
);

-- ============================================
-- VUE : statut calculé de la collaboration
-- ============================================
create view collaborations_with_status as
select
  c.*,
  coalesce(
    (
      select d.status
      from deliverables d
      where d.collaboration_id = c.id
      order by
        case d.status
          when 'to_contact' then 0
          when 'validated' then 1
          when 'product_received' then 2
          when 'to_create' then 3
          when 'to_validate' then 4
          when 'scheduled' then 5
          when 'published' then 6
        end
      limit 1
    ),
    'to_contact'
  ) as computed_status,
  exists (
    select 1 from deliverables d
    where d.collaboration_id = c.id
      and d.deadline_date < current_date
      and d.status <> 'published'
  ) as is_late
from collaborations c;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table brands enable row level security;
alter table collaborations enable row level security;
alter table deliverables enable row level security;
alter table tasks enable row level security;
alter table files enable row level security;

create policy "own_brands" on brands
  for all using (auth.uid() = user_id);

create policy "own_collaborations" on collaborations
  for all using (auth.uid() = user_id);

create policy "own_tasks" on tasks
  for all using (auth.uid() = user_id);

create policy "own_deliverables" on deliverables
  for all using (
    exists (
      select 1 from collaborations c
      where c.id = deliverables.collaboration_id
      and c.user_id = auth.uid()
    )
  );

create policy "own_files" on files
  for all using (
    exists (
      select 1 from collaborations c
      where c.id = files.collaboration_id
      and c.user_id = auth.uid()
    )
  );

-- ============================================
-- STORAGE POLICIES (bucket: collaboration-files)
-- Convention de chemin : {user_id}/{collaboration_id}/{file_name}
-- ============================================
create policy "own_files_insert" on storage.objects
  for insert
  with check (
    bucket_id = 'collaboration-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "own_files_select" on storage.objects
  for select
  using (
    bucket_id = 'collaboration-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "own_files_delete" on storage.objects
  for delete
  using (
    bucket_id = 'collaboration-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "own_files_update" on storage.objects
  for update
  using (
    bucket_id = 'collaboration-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );