
-- Create a storage bucket for generated creatives
insert into storage.buckets (id, name, public)
values ('criativos-gerados', 'criativos-gerados', true);

-- Set up a policy to allow authenticated users to upload files
create policy "Allow authenticated users to upload files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'criativos-gerados');

-- Set up a policy to allow public to read files (since we want the images to be visible)
create policy "Allow public to read generated creative files"
on storage.objects for select
to public
using (bucket_id = 'criativos-gerados');
