create table if not exists uploads (
  id text primary key,
  name text not null,
  file_name text not null,
  bytes integer not null,
  body bytea,
  ready boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists upload_chunks (
  upload_id text not null,
  idx integer not null,
  body bytea not null,
  primary key (upload_id, idx)
);
