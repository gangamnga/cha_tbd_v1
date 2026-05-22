-- Seed data: 1 đăng ký mẫu cho mỗi chuyến hành hương (24 chuyến)
-- Chạy trong Supabase Dashboard → SQL Editor

-- Thêm cột num_people nếu chưa có
ALTER TABLE pilgrimage_registrations
  ADD COLUMN IF NOT EXISTS num_people integer NOT NULL DEFAULT 1;

INSERT INTO pilgrimage_registrations (name, phone, num_people, notes, trip_id, trip_title, trip_dates, status)
VALUES
  ('Nguyễn Văn An',    '0901 234 567', 2, '',                           'cccccccc-0000-0000-0000-000000000001', 'Hành hương Đại Lễ Phong Chân Phước 2026',  '01/07/2026 – 03/07/2026', 'confirmed'),
  ('Trần Thị Bích',    '0912 345 678', 3, 'Có người cao tuổi',          'cccccccc-0000-0000-0000-000000000002', 'Hành hương Lễ Kính Cha Diệp 2027',         '11/03/2027 – 12/03/2027', 'pending'),
  ('Lê Minh Châu',     '0923 456 789', 1, '',                           '956f6aed-9f44-47ec-9db1-aae0771c330b', 'Hành hương Tắc Sậy tháng 01/2026',         '10/01/2026 – 11/01/2026', 'confirmed'),
  ('Phạm Thị Dung',    '0934 567 890', 4, 'Nhóm gia đình',              '896982e6-019c-48f3-9499-734d33cdd8c1', 'Hành hương Tắc Sậy tháng 02/2026',         '07/02/2026 – 08/02/2026', 'pending'),
  ('Hoàng Văn Em',     '0945 678 901', 2, '',                           '127509e0-b4fd-4625-8097-e6d795f41a65', 'Hành hương Tắc Sậy tháng 03/2026',         '14/03/2026 – 15/03/2026', 'confirmed'),
  ('Vũ Thị Phương',    '0956 789 012', 1, '',                           '8cbe1165-7d2c-4b9b-974a-8b4672f7ee87', 'Hành hương Tắc Sậy tháng 04/2026',         '11/04/2026 – 12/04/2026', 'pending'),
  ('Đặng Quốc Giang',  '0967 890 123', 5, 'Đoàn thanh niên giáo xứ',   'b54cc723-2d54-4272-a1ee-64b2555c39f8', 'Hành hương Tắc Sậy tháng 05/2026',         '09/05/2026 – 10/05/2026', 'confirmed'),
  ('Bùi Thị Hoa',      '0978 901 234', 2, '',                           'f258eefd-8f77-4870-922e-499146aa98e8', 'Hành hương Tắc Sậy tháng 06/2026',         '13/06/2026 – 14/06/2026', 'pending'),
  ('Ngô Văn Khải',     '0989 012 345', 3, 'Cần hỗ trợ xe lăn',         '51c6b790-7b4f-4fe2-9680-8484998bc7ca', 'Hành hương Tắc Sậy tháng 08/2026',         '08/08/2026 – 09/08/2026', 'confirmed'),
  ('Dương Thị Lan',    '0990 123 456', 1, '',                           'e62d410b-5f00-40d5-9aa4-238d53b3f732', 'Hành hương Tắc Sậy tháng 09/2026',         '12/09/2026 – 13/09/2026', 'pending'),
  ('Trịnh Văn Mạnh',   '0901 234 560', 2, '',                           'b8a451b8-423c-4be6-907c-0dd9385e43e0', 'Hành hương Tắc Sậy tháng 10/2026',         '10/10/2026 – 11/10/2026', 'cancelled'),
  ('Lý Thị Ngọc',      '0912 345 671', 4, 'Gia đình có trẻ nhỏ',       'ce848915-98f3-434d-9aab-fe3d093da3ba', 'Hành hương Tắc Sậy tháng 11/2026',         '07/11/2026 – 08/11/2026', 'confirmed'),
  ('Phan Văn Ổn',      '0923 456 782', 1, '',                           'ec7156ad-2195-4636-88d0-071fdbe98dd2', 'Hành hương Tắc Sậy tháng 12/2026',         '05/12/2026 – 06/12/2026', 'pending'),
  ('Cao Thị Phúc',     '0934 567 893', 3, '',                           '67cbacb5-273b-4991-bf41-53993066bda6', 'Hành hương Tắc Sậy tháng 01/2027',         '10/01/2027 – 11/01/2027', 'confirmed'),
  ('Mai Văn Quân',     '0945 678 904', 2, 'Xin ghép đoàn nếu thiếu',   '1eb8c656-57f6-46f5-a690-3bd87ed992d5', 'Hành hương Tắc Sậy tháng 02/2027',         '06/02/2027 – 07/02/2027', 'pending'),
  ('Đinh Thị Ru',      '0956 789 015', 1, '',                           'bb29853e-f2d8-49ff-9ce7-fc30d463dbfc', 'Hành hương Tắc Sậy tháng 04/2027',         '10/04/2027 – 11/04/2027', 'confirmed'),
  ('Tô Văn Sơn',       '0967 890 126', 6, 'Đoàn hội bà mẹ công giáo',  'ac700dd0-aff7-48a4-8743-7b9850a0fcc3', 'Hành hương Tắc Sậy tháng 05/2027',         '08/05/2027 – 09/05/2027', 'pending'),
  ('Hà Thị Tâm',       '0978 901 237', 2, '',                           'd16130e2-c801-4ea3-99f3-81703094f7c0', 'Hành hương Tắc Sậy tháng 06/2027',         '12/06/2027 – 13/06/2027', 'confirmed'),
  ('Lưu Văn Uy',       '0989 012 348', 4, 'Nhóm thanh niên',            '8580acec-862a-4b0d-8c3b-b67fbca1bc3c', 'Hành hương Đại Lễ Tắc Sậy tháng 07/2027', '10/07/2027 – 12/07/2027', 'pending'),
  ('Kiều Thị Vân',     '0990 123 459', 1, '',                           '631e57f3-16e4-409c-9d9e-f3983ef88d8c', 'Hành hương Tắc Sậy tháng 08/2027',         '07/08/2027 – 08/08/2027', 'confirmed'),
  ('Trương Văn Xuân',  '0901 234 560', 3, '',                           'e09ba96d-397b-41af-beb7-b9c47ce661b3', 'Hành hương Tắc Sậy tháng 09/2027',         '11/09/2027 – 12/09/2027', 'pending'),
  ('Nguyễn Thị Yến',   '0912 345 671', 2, 'Đi cùng nhóm cầu nguyện',   '6637f8ed-d435-4907-95c6-ffe9abfe09e6', 'Hành hương Tắc Sậy tháng 10/2027',         '09/10/2027 – 10/10/2027', 'confirmed'),
  ('Phùng Văn Zũng',   '0923 456 782', 1, '',                           'f8b4b6f0-ed11-41d6-a506-e4b073c5cbf2', 'Hành hương Tắc Sậy tháng 11/2027',         '06/11/2027 – 07/11/2027', 'pending'),
  ('Bảo Thị Ái',       '0934 567 893', 5, 'Gia đình lớn',               '74f7ec30-8e10-40ea-a4b2-b6f3763a10f9', 'Hành hương Tắc Sậy tháng 12/2027',         '04/12/2027 – 05/12/2027', 'confirmed');
