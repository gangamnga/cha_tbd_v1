-- Bảng lưu đăng ký tham gia cộng đồng từ site
create table if not exists community_signups (
  id         uuid        primary key default gen_random_uuid(),
  full_name  text        not null,
  phone      text        not null,
  created_at timestamptz not null default now()
);

-- Chỉ admin (service_role) được đọc, anon chỉ được insert
alter table community_signups enable row level security;

create policy "anon insert only"
  on community_signups for insert
  to anon, authenticated
  with check (true);
