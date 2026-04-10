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
