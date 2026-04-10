-- Submissions table
create table if not exists public.submissions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  identifier text not null check (char_length(identifier) <= 40),
  submission_type text not null check (submission_type in ('A', 'B')),
  image_url text not null,
  image_path text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'verified')),
  points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for admin panel queries (status + date, fast at 100k+ rows)
create index if not exists idx_submissions_status_created
  on public.submissions(status, created_at desc);

-- Index for user dashboard queries
create index if not exists idx_submissions_user_id
  on public.submissions(user_id, created_at desc);

-- Row Level Security
alter table public.submissions enable row level security;

create policy "Users can insert their own submissions"
  on public.submissions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view their own submissions"
  on public.submissions for select
  to authenticated
  using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_submission_updated
  before update on public.submissions
  for each row execute procedure public.handle_updated_at();
-- Storage bucket policies
insert into storage.buckets (id, name, public)
values ('submission-images', 'submission-images', false)
on conflict do nothing;

create policy "Authenticated users can upload images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'submission-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read their own images"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'submission-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'submission-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
