-- Enable pgvector extension
create extension if not exists vector with schema extensions;

-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  created_at timestamptz default now() not null
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Tutors
create table tutors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  soul_md text default '' not null,
  voice_id text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index tutors_user_id_idx on tutors(user_id);

-- Sources
create table sources (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid references tutors(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('pdf', 'youtube', 'webpage', 'text', 'image')),
  storage_path text,
  original_url text,
  created_at timestamptz default now() not null
);

create index sources_tutor_id_idx on sources(tutor_id);

-- Document chunks + embeddings
create table chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references sources(id) on delete cascade not null,
  tutor_id uuid references tutors(id) on delete cascade not null,
  content text not null,
  embedding vector(1536),
  chunk_index int not null,
  created_at timestamptz default now() not null
);

create index chunks_tutor_id_idx on chunks(tutor_id);
create index chunks_embedding_idx on chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Conversation messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid references tutors(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'detailed', 'image')),
  content text not null,
  image_url text,
  audio_url text,
  created_at timestamptz default now() not null
);

create index messages_tutor_id_idx on messages(tutor_id);
create index messages_created_at_idx on messages(tutor_id, created_at);

-- Row Level Security
alter table profiles enable row level security;
alter table tutors enable row level security;
alter table sources enable row level security;
alter table chunks enable row level security;
alter table messages enable row level security;

-- Profiles: users can read/update own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Tutors: users can CRUD own tutors
create policy "Users can view own tutors" on tutors for select using (auth.uid() = user_id);
create policy "Users can create tutors" on tutors for insert with check (auth.uid() = user_id);
create policy "Users can update own tutors" on tutors for update using (auth.uid() = user_id);
create policy "Users can delete own tutors" on tutors for delete using (auth.uid() = user_id);

-- Sources: users can CRUD sources of own tutors
create policy "Users can view sources" on sources for select using (
  tutor_id in (select id from tutors where user_id = auth.uid())
);
create policy "Users can create sources" on sources for insert with check (
  tutor_id in (select id from tutors where user_id = auth.uid())
);
create policy "Users can delete sources" on sources for delete using (
  tutor_id in (select id from tutors where user_id = auth.uid())
);

-- Chunks: users can view chunks of own tutors
create policy "Users can view chunks" on chunks for select using (
  tutor_id in (select id from tutors where user_id = auth.uid())
);
create policy "Users can create chunks" on chunks for insert with check (
  tutor_id in (select id from tutors where user_id = auth.uid())
);
create policy "Users can delete chunks" on chunks for delete using (
  tutor_id in (select id from tutors where user_id = auth.uid())
);

-- Messages: users can CRUD messages of own tutors
create policy "Users can view messages" on messages for select using (
  tutor_id in (select id from tutors where user_id = auth.uid())
);
create policy "Users can create messages" on messages for insert with check (
  tutor_id in (select id from tutors where user_id = auth.uid())
);

-- Storage bucket for source files
insert into storage.buckets (id, name, public) values ('sources', 'sources', false);

create policy "Users can upload sources" on storage.objects for insert with check (
  bucket_id = 'sources' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "Users can view own sources" on storage.objects for select using (
  bucket_id = 'sources' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "Users can delete own sources" on storage.objects for delete using (
  bucket_id = 'sources' and auth.uid()::text = (storage.foldername(name))[1]
);

-- Match chunks function for RAG similarity search
create or replace function match_chunks(
  query_embedding vector(1536),
  match_tutor_id uuid,
  match_count int default 5,
  match_threshold float default 0.5
)
returns table (
  id uuid,
  source_id uuid,
  content text,
  chunk_index int,
  similarity float
)
language sql stable
as $$
  select
    chunks.id,
    chunks.source_id,
    chunks.content,
    chunks.chunk_index,
    1 - (chunks.embedding <=> query_embedding) as similarity
  from chunks
  where chunks.tutor_id = match_tutor_id
    and 1 - (chunks.embedding <=> query_embedding) > match_threshold
  order by chunks.embedding <=> query_embedding
  limit match_count;
$$;
