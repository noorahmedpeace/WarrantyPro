-- Create a table for warranties
create table warranties (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  product_name text not null,
  brand text,
  category text,
  purchase_date date not null,
  warranty_duration_months integer not null,
  expiry_date date not null, -- Store calculated date for easier querying
  shop_name text,
  notes text,
  status text default 'active', -- 'active' or 'expired'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for warranty files (images/pdfs)
create table warranty_files (
  id uuid default gen_random_uuid() primary key,
  warranty_id uuid references warranties(id) on delete cascade not null,
  file_url text not null,
  file_type text, -- 'image/jpeg', 'application/pdf', etc.
  file_path text not null, -- Storage path for deletion
  uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table warranties enable row level security;
alter table warranty_files enable row level security;

-- Policies for Warranties
create policy "Users can view their own warranties"
  on warranties for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own warranties"
  on warranties for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own warranties"
  on warranties for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own warranties"
  on warranties for delete
  using ( auth.uid() = user_id );

-- Policies for Warranty Files
create policy "Users can view files of their warranties"
  on warranty_files for select
  using ( exists (
    select 1 from warranties w
    where w.id = warranty_files.warranty_id
    and w.user_id = auth.uid()
  ));

create policy "Users can insert files for their warranties"
  on warranty_files for insert
  with check ( exists (
    select 1 from warranties w
    where w.id = warranty_files.warranty_id
    and w.user_id = auth.uid()
  ));

create policy "Users can delete files of their warranties"
  on warranty_files for delete
  using ( exists (
    select 1 from warranties w
    where w.id = warranty_files.warranty_id
    and w.user_id = auth.uid()
  ));

-- Create Storage Bucket 'warranty-docs'
-- Note: You'll need to create this via the Dashboard, but RLS for storage:
-- create policy "Give users access to own folder 1ok12a_0" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'warranty-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
-- create policy "Give users access to own folder 1ok12a_1" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'warranty-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
