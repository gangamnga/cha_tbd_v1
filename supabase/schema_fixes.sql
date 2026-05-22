-- TẠO BẢNG ĐỊA ĐIỂM HÀNH HƯƠNG (Nếu chưa có)
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  badge text,
  note text,
  address_new text,
  address_old text,
  map_url text,
  directions_url text,
  theme text DEFAULT 'blue' CHECK (theme IN ('blue', 'red')),
  sort_order integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Thêm các cột còn thiếu nếu bảng đã tồn tại với schema cũ
ALTER TABLE locations ADD COLUMN IF NOT EXISTS badge text;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS note text;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS address_new text;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS address_old text;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS map_url text;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS directions_url text;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS theme text DEFAULT 'blue';
ALTER TABLE locations ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE locations ADD COLUMN IF NOT EXISTS key text;
UPDATE locations SET key = id::text WHERE key IS NULL;
ALTER TABLE locations ALTER COLUMN key SET NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'locations_key_key'
  ) THEN
    ALTER TABLE locations ADD CONSTRAINT locations_key_key UNIQUE (key);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'locations_theme_check'
  ) THEN
    ALTER TABLE locations ADD CONSTRAINT locations_theme_check CHECK (theme IN ('blue', 'red'));
  END IF;
END $$;

ALTER TABLE locations DISABLE ROW LEVEL SECURITY;

INSERT INTO locations (key, name, badge, address_new, address_old, map_url, directions_url, theme, sort_order) VALUES
('pilgrimage_center', 'Trung Tâm Hành Hương Tắc Sậy', 'Nhà thờ & Khu lăng mộ Cha',
 'QL 1A, Ấp 2A, xã Phong Thạnh, tỉnh Cà Mau',
 'QL 1A, Ấp 2, xã Tân Phong, thị xã Giá Rai, tỉnh Bạc Liêu',
 'https://maps.google.com/?q=Nhà+thờ+Tắc+Sậy+Bạc+Liêu', '#', 'blue', 1),
('birthplace', 'Nơi Sinh Cha Trương Bửu Diệp', 'Tránh nhầm lẫn',
 'Giáo xứ Cồn Phước, ấp Mỹ Lợi, xã Long Điền, tỉnh An Giang',
 'Họ đạo Cồn Phước, ấp Mỹ Lợi, xã Mỹ An, huyện Chợ Mới, tỉnh An Giang',
 NULL, NULL, 'red', 2)
ON CONFLICT (key) DO NOTHING;

UPDATE locations SET note = '*Lưu ý: Năm 1904 (khi ngài 7 tuổi), thân mẫu là bà Lucia Lê Thị Thanh qua đời. Sau biến cố này, thân phụ của ngài là ông Micae Trương Văn Đặng đã đưa cả gia đình rời khỏi địa chỉ nơi này sang Battambang (Campuchia) sinh sống bằng nghề thợ mộc.'
WHERE key = 'birthplace' AND (note IS NULL OR note = '');

-- TẠO BẢNG CẤU HÌNH TRANG CHỦ (Nếu chưa có)
CREATE TABLE IF NOT EXISTS homepage_config (
  id text PRIMARY KEY,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Tắt RLS cho bảng cấu hình
ALTER TABLE homepage_config DISABLE ROW LEVEL SECURITY;

-- Tạo dòng cấu hình mặc định (main) nếu chưa có
INSERT INTO homepage_config (id, config) 
VALUES ('main', '{}')
ON CONFLICT (id) DO NOTHING;

-- THÊM CỘT CHO BẢNG ANNOUNCEMENTS (Nếu chưa có)
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Cập nhật dữ liệu mẫu cho image_url
UPDATE announcements SET image_url = 'https://placehold.co/800x800/1a365d/ffffff?text=Thong+Bao' WHERE image_url IS NULL;

-- THÊM CỘT CHO QR VIBER VÀ WHATSAPP TRONG COMMUNITY_INFO (Nếu chưa có)
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS viber_qr_url text;
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS whatsapp_qr_url text;

-- THÊM CỘT CÒN THIẾU CHO MASS_SCHEDULE_META
ALTER TABLE mass_schedule_meta ADD COLUMN IF NOT EXISTS location_name text DEFAULT 'Thánh đường Tắc Sậy';
ALTER TABLE mass_schedule_meta ADD COLUMN IF NOT EXISTS note text DEFAULT 'Lịch có thể thay đổi theo thông báo.';
ALTER TABLE mass_schedule_meta ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- THÊM CỘT CÒN THIẾU CHO MASS_SCHEDULE
ALTER TABLE mass_schedule ADD COLUMN IF NOT EXISTS day_label text NOT NULL DEFAULT '';
ALTER TABLE mass_schedule ADD COLUMN IF NOT EXISTS times text[] NOT NULL DEFAULT '{}';
ALTER TABLE mass_schedule ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
ALTER TABLE mass_schedule ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- THAY THẾ QR IMAGE URL BẰNG SỐ ĐIỆN THOẠI (QR GENERATE ĐỘNG)
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS viber_phone text;
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS whatsapp_phone text;

-- DANH SÁCH ĐIỆN THOẠI, EMAIL, WEBSITE, GIỜ MỞ CỬA VÀ LIÊN KẾT ĐỘNG
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS phones text[] DEFAULT '{}';
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS emails text[] DEFAULT '{}';
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS websites text[] DEFAULT '{}';
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS hours_list text[] DEFAULT '{}';
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '[]'::jsonb;

-- SEED 8 BÀI VIẾT HOẠT ĐỘNG CỘNG ĐỒNG CÓ HÌNH ẢNH
-- Cập nhật thumbnail cho 3 bài viết mẫu đã có
UPDATE articles SET thumbnail_url = 'https://picsum.photos/seed/tacsay1/800/450'
  WHERE id = '11111111-0000-0000-0000-000000000001' AND (thumbnail_url IS NULL OR thumbnail_url = '');
UPDATE articles SET thumbnail_url = 'https://picsum.photos/seed/tacsay2/800/450'
  WHERE id = '11111111-0000-0000-0000-000000000002' AND (thumbnail_url IS NULL OR thumbnail_url = '');
UPDATE articles SET thumbnail_url = 'https://picsum.photos/seed/tacsay3/800/450'
  WHERE id = '11111111-0000-0000-0000-000000000003' AND (thumbnail_url IS NULL OR thumbnail_url = '');

-- Thêm 5 bài viết mới (tổng cộng 8 bài cong-dong)
INSERT INTO articles (id, title, content, slug, category, status, thumbnail_url, summary, updated_at, created_at) VALUES

  ('11111111-0000-0000-0000-000000000004',
   'Lễ giỗ Cha Trương Bửu Diệp – Tưởng nhớ vị tử đạo anh hùng',
   '<p>Hằng năm vào ngày <strong>12 tháng 3</strong>, cộng đồng giáo dân Tắc Sậy và hàng nghìn khách hành hương từ khắp nơi tụ hội về nhà thờ Tắc Sậy để dâng Thánh Lễ giỗ kính nhớ Cha Phanxicô Xaviê Trương Bửu Diệp.</p><p>Năm nay, lễ giỗ được tổ chức long trọng với sự tham dự của đông đảo linh mục, tu sĩ và giáo dân từ nhiều giáo phận trên cả nước.</p>',
   'le-gio-cha-truong-buu-diep-tuong-nho-vi-tu-dao',
   'cong-dong', 'published',
   'https://picsum.photos/seed/tacsay4/800/450',
   'Lễ giỗ 12/3 hằng năm tại nhà thờ Tắc Sậy quy tụ hàng nghìn khách hành hương từ khắp nơi.',
   now(), now() - interval '3 days'),

  ('11111111-0000-0000-0000-000000000005',
   'Ban Caritas Tắc Sậy trao học bổng cho học sinh nghèo tỉnh Cà Mau',
   '<p>Với tinh thần bác ái của Cha Trương Bửu Diệp, Ban Caritas giáo xứ Tắc Sậy vừa tổ chức lễ trao <strong>50 suất học bổng</strong> cho học sinh có hoàn cảnh khó khăn tại các trường học ở tỉnh Cà Mau và Bạc Liêu.</p><p>Mỗi suất học bổng trị giá 2 triệu đồng, được trích từ quỹ từ thiện của cộng đồng hành hương trong năm qua.</p>',
   'ban-caritas-tac-say-trao-hoc-bong-hoc-sinh-ngheo',
   'cong-dong', 'published',
   'https://picsum.photos/seed/tacsay5/800/450',
   'Ban Caritas Tắc Sậy trao 50 suất học bổng trị giá 2 triệu đồng cho học sinh nghèo Cà Mau và Bạc Liêu.',
   now(), now() - interval '5 days'),

  ('11111111-0000-0000-0000-000000000006',
   'Triển lãm ảnh "Cha Diệp – Người tôi tớ trung thành" tại Tắc Sậy',
   '<p>Nhân dịp kỷ niệm 80 năm ngày mất của Cha Trương Bửu Diệp, Ban Tổ Chức đã khai mạc triển lãm ảnh với chủ đề <em>"Cha Diệp – Người tôi tớ trung thành"</em> tại khuôn viên nhà thờ Tắc Sậy.</p><p>Triển lãm trưng bày hơn 200 bức ảnh tư liệu lịch sử, ghi lại cuộc đời mục vụ, tinh thần tử đạo và hành trình phong chân phước của ngài.</p>',
   'trien-lam-anh-cha-diep-nguoi-toi-to-trung-thanh',
   'cong-dong', 'published',
   'https://picsum.photos/seed/tacsay6/800/450',
   'Triển lãm 200 ảnh tư liệu lịch sử về cuộc đời và hành trình phong chân phước của Cha Trương Bửu Diệp.',
   now(), now() - interval '8 days'),

  ('11111111-0000-0000-0000-000000000007',
   'Đêm canh thức cầu nguyện Vọng Phục Sinh tại Trung Tâm Hành Hương',
   '<p>Đêm canh thức Vọng Phục Sinh tại Trung Tâm Hành Hương Tắc Sậy năm nay quy tụ hơn <strong>3.000 tín hữu</strong> từ khắp vùng đồng bằng sông Cửu Long.</p><p>Trong ánh sáng nến lung linh, cộng đoàn cùng nhau cầu nguyện, lắng nghe Lời Chúa và đón nhận ánh sáng Phục Sinh – sức mạnh đã nâng đỡ Cha Diệp trong những giờ phút cuối đời.</p>',
   'dem-canh-thuc-vong-phuc-sinh-trung-tam-hanh-huong',
   'cong-dong', 'draft',
   'https://picsum.photos/seed/tacsay7/800/450',
   'Hơn 3.000 tín hữu tham dự đêm canh thức Vọng Phục Sinh tại Tắc Sậy trong ánh nến lung linh.',
   now(), now() - interval '12 days'),

  ('11111111-0000-0000-0000-000000000008',
   'Khởi công xây dựng nhà nghỉ hành hương mới phục vụ khách thập phương',
   '<p>Trước nhu cầu ngày càng tăng của khách hành hương, đặc biệt trong dịp Đại Lễ Phong Chân Phước 2026, Ban Quản Trị Trung Tâm Hành Hương Tắc Sậy đã chính thức khởi công xây dựng khu nhà nghỉ mới với sức chứa <strong>500 giường</strong>.</p><p>Công trình dự kiến hoàn thành vào tháng 5/2026, đúng tiến độ phục vụ cho đại lễ tháng 7.</p>',
   'khoi-cong-nha-nghi-hanh-huong-moi-tac-say-2026',
   'cong-dong', 'draft',
   'https://picsum.photos/seed/tacsay8/800/450',
   'Khởi công khu nhà nghỉ 500 giường tại Tắc Sậy, dự kiến hoàn thành tháng 5/2026 phục vụ Đại Lễ.',
   now(), now() - interval '15 days')

ON CONFLICT (id) DO NOTHING;
