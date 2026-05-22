-- Bảng lời kinh
create table if not exists prayers (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  content     text not null,
  themes      text[] default '{}',
  sort_order  int default 0,
  is_active   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Bảng thánh ca
create table if not exists hymns (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  artist      text not null,
  youtube_url text,
  image_url   text,
  playlists   text[] default '{}',
  sort_order  int default 0,
  is_active   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
