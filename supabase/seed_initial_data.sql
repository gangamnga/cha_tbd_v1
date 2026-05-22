-- ================================================================
-- SEED INITIAL DATA — Cha Phanxicô Xaviê Trương Bửu Diệp
-- Chạy trong Supabase Dashboard > SQL Editor
--
-- LƯU Ý: Script này TRUNCATE và INSERT lại toàn bộ.
-- Chỉ chạy lần đầu hoặc khi muốn reset về dữ liệu mẫu.
-- ================================================================

-- ── 0. XÓA DỮ LIỆU CŨ (theo thứ tự an toàn) ──────────────────
-- Không TRUNCATE: announcements, mass_schedule, mass_schedule_meta,
--                 locations  → anh điền dữ liệu thật qua admin UI
TRUNCATE
  homepage_config,
  prayer_themes,
  prayers,
  hymns,
  articles,
  testimonies,
  bio_facts,
  biography_milestones,
  beatification_steps,
  canonization_steps,
  pilgrimage_trips,
  pilgrimage_registrations,
  prayer_intentions,
  community_info,
  mass_schedule,
  mass_schedule_meta
RESTART IDENTITY CASCADE;

-- Đảm bảo community_info có đủ tất cả các cột cần thiết
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS name             text;
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS badge            text;
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS sort_order       int DEFAULT 0;
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS hours            text;
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS address          text;
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS phone            text;
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS email            text;
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS website1         text;
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS website2         text;
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS facebook_url     text;
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS instagram_url    text;
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS tiktok_url       text;
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS youtube_url      text;
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS viber_qr_url     text;
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS whatsapp_qr_url  text;
ALTER TABLE community_info ADD COLUMN IF NOT EXISTS updated_at       timestamptz DEFAULT now();

-- hymn_playlists có thể chưa có trong schema gốc
CREATE TABLE IF NOT EXISTS hymn_playlists (
  id          text PRIMARY KEY,
  label       text NOT NULL,
  cover_image text,
  sort_order  int DEFAULT 0
);
ALTER TABLE hymn_playlists DISABLE ROW LEVEL SECURITY;
TRUNCATE hymn_playlists;

-- prayer_themes cũng có thể chưa có
CREATE TABLE IF NOT EXISTS prayer_themes (
  id         text PRIMARY KEY,
  label      text NOT NULL,
  sort_order int DEFAULT 0
);
ALTER TABLE prayer_themes DISABLE ROW LEVEL SECURITY;


-- ── 1. THÔNG BÁO ───────────────────────────────────────────────
-- (Bỏ qua — anh điền dữ liệu thật qua admin UI)


-- ── 2. CHỦ ĐỀ LỜI KINH ────────────────────────────────────────
INSERT INTO prayer_themes (id, label, sort_order) VALUES
  ('theme-benhnan',        'Cầu bệnh nhân',          1),
  ('theme-giadia',         'Cầu gia đình',            2),
  ('theme-nghenghiep',     'Cầu ơn nghề nghiệp',     3),
  ('theme-hochanh',        'Cầu ơn học hành',         4),
  ('theme-binhan',         'Cầu bình an',             5),
  ('theme-phongchanphuoc', 'Cầu phong chân phước',    6);


-- ── 3. LỜI KINH ───────────────────────────────────────────────
INSERT INTO prayers (id, title, content, themes, sort_order, is_active) VALUES

  ('aaaaaaaa-0000-0000-0000-000000000001',
   'Kinh Cầu Cha Phanxicô Xaviê Trương Bửu Diệp',
   E'Lạy Cha Phanxicô Xaviê Trương Bửu Diệp kính mến,\n\nChúa đã thương cho Cha được ơn can đảm chịu tử đạo vì đức tin và nguyện hy sinh mạng sống để bảo vệ đoàn chiên.\n\nXin Cha thương đến chúng con và chuyển cầu cùng Chúa ban cho chúng con ơn phần hồn phần xác mà chúng con đang cần thiết.\n\nXin Chúa chóng phong thánh cho Cha để danh Chúa được cả sáng và Giáo Hội Việt Nam thêm vui mừng.\n\nAmen.',
   ARRAY['theme-binhan', 'theme-phongchanphuoc'], 1, true),

  ('aaaaaaaa-0000-0000-0000-000000000002',
   'Kinh Cầu Bệnh Nhân',
   E'Lạy Chúa Giêsu,\n\nChúa đã chữa lành bệnh tật và ủi an những kẻ đau khổ trong cuộc đời trần thế.\n\nXin Chúa thương nhìn đến người bệnh nhân đang đau khổ này, xin chữa lành phần xác lẫn phần hồn cho họ theo ý Chúa.\n\nNhờ lời chuyển cầu của Cha Trương Bửu Diệp, xin Chúa ban ơn lành sức khỏe và bình an.\n\nAmen.',
   ARRAY['theme-benhnan'], 2, true),

  ('aaaaaaaa-0000-0000-0000-000000000003',
   'Kinh Cầu Gia Đình',
   E'Lạy Chúa,\n\nXin ban bình an và hạnh phúc cho gia đình chúng con.\n\nXin Chúa ở cùng chúng con trong mọi hoàn cảnh cuộc sống, giúp chúng con yêu thương nhau như Chúa đã yêu thương chúng con.\n\nXin phù hộ cha mẹ, vợ chồng và con cái chúng con luôn sống thuận hòa thương yêu trong ánh sáng Chúa.\n\nAmen.',
   ARRAY['theme-giadia'], 3, true),

  ('aaaaaaaa-0000-0000-0000-000000000004',
   'Kinh Cầu Ơn Học Hành',
   E'Lạy Chúa,\n\nXin ban cho con ơn khôn ngoan để hiểu biết và trí nhớ để ghi nhớ những điều con học.\n\nXin giúp con chăm chỉ học tập, sống ngay thẳng và trở thành người có ích cho gia đình và xã hội.\n\nNhờ lời chuyển cầu của Cha Trương Bửu Diệp, xin Chúa ban ơn cho con trong việc học hành.\n\nAmen.',
   ARRAY['theme-hochanh'], 4, true),

  ('aaaaaaaa-0000-0000-0000-000000000005',
   'Kinh Cầu Bình An',
   E'Lạy Chúa là Chúa bình an,\n\nXin ban bình an của Chúa xuống trên tâm hồn chúng con, trên gia đình chúng con và trên đất nước chúng con.\n\nXin Chúa xua tan mọi lo âu, sợ hãi và đem lại cho chúng con bình an thật sự — bình an mà thế gian không thể ban cho.\n\nAmen.',
   ARRAY['theme-binhan'], 5, true),

  ('aaaaaaaa-0000-0000-0000-000000000006',
   'Kinh Kính Thánh Tâm Chúa Giêsu',
   E'Lạy Thánh Tâm Chúa Giêsu,\n\nChúng con phó dâng cuộc đời chúng con trong Thánh Tâm Chúa.\n\nXin Thánh Tâm Chúa ngự trị trong gia đình chúng con, gìn giữ chúng con khỏi mọi tội lỗi và dẫn đưa chúng con về quê hương trên trời.\n\nThánh Tâm Chúa Giêsu, chúng con tín thác vào Chúa!\n\nAmen.',
   ARRAY['theme-binhan', 'theme-giadia'], 6, true);


-- ── 4. DANH SÁCH NHẠC ─────────────────────────────────────────
INSERT INTO hymn_playlists (id, label, sort_order) VALUES
  ('playlist-hanh-huong', 'Hành hương Tắc Sậy', 1),
  ('playlist-kinh-sang',  'Kinh sáng / Kinh tối', 2),
  ('playlist-mua-chay',   'Mùa Chay',             3);


-- ── 5. THÁNH CA ───────────────────────────────────────────────
INSERT INTO hymns (id, title, artist, youtube_url, image_url, playlists, sort_order, is_active) VALUES

  ('bbbbbbbb-0000-0000-0000-000000000001',
   'Con Về Tắc Sậy',
   'Ca đoàn Giáo xứ Tắc Sậy',
   null, null,
   ARRAY['playlist-hanh-huong'], 1, true),

  ('bbbbbbbb-0000-0000-0000-000000000002',
   'Kinh Cầu Cha Diệp',
   'Nhóm Thánh Ca Tắc Sậy',
   null, null,
   ARRAY['playlist-hanh-huong'], 2, true),

  ('bbbbbbbb-0000-0000-0000-000000000003',
   'Về Bên Cha',
   'Ca đoàn Hiệp Nhất',
   null, null,
   ARRAY['playlist-hanh-huong'], 3, true),

  ('bbbbbbbb-0000-0000-0000-000000000004',
   'Lạy Cha Diệp',
   'Nhóm Cung Thánh',
   null, null,
   ARRAY['playlist-hanh-huong'], 4, true),

  ('bbbbbbbb-0000-0000-0000-000000000005',
   'Bài Ca Hành Hương',
   'Đức Quang',
   null, null,
   ARRAY['playlist-hanh-huong'], 5, true),

  ('bbbbbbbb-0000-0000-0000-000000000006',
   'Thánh Ca Kính Cha Diệp',
   'Ca đoàn Thánh Phanxicô',
   null, null,
   ARRAY['playlist-hanh-huong'], 6, true);


-- ── 6. BÀI VIẾT: TIN NHANH / CỘNG ĐỒNG ──────────────────────
INSERT INTO articles (id, title, content, slug, category, status, thumbnail_url, summary, updated_at, created_at) VALUES

  ('11111111-0000-0000-0000-000000000001',
   'Đại Lễ Phong Chân Phước Cha Trương Bửu Diệp – 02/07/2026',
   '<p>Ngày <strong>02 tháng 07 năm 2026</strong> sẽ là ngày trọng đại đối với Giáo Hội Công Giáo Việt Nam khi Đức Thánh Cha chủ sự nghi lễ Phong Chân Phước cho Cha Phanxicô Xaviê Trương Bửu Diệp tại Tắc Sậy, Bạc Liêu.</p><p>Hàng triệu tín hữu từ khắp nơi trên thế giới đã và đang lên kế hoạch hành hương về Tắc Sậy để chứng kiến sự kiện lịch sử này.</p>',
   'dai-le-phong-chan-phuoc-cha-truong-buu-diep-02-07-2026',
   'cong-dong', 'published', null,
   'Ngày 02/07/2026 – Lễ Phong Chân Phước tại Tắc Sậy, Bạc Liêu. Sự kiện lịch sử của Giáo Hội Công Giáo Việt Nam.',
   now(), now() - interval '0 days'),

  ('11111111-0000-0000-0000-000000000002',
   'Cộng đồng Cha Diệp ra mắt website chính thức',
   '<p>Nhằm phục vụ tốt hơn cho cộng đồng tín hữu trong và ngoài nước, website chính thức về Cha Phanxicô Xaviê Trương Bửu Diệp đã chính thức ra mắt.</p><p>Website cung cấp thông tin tiểu sử, lịch hành hương, lịch lễ tại Tắc Sậy và nhiều tài nguyên cầu nguyện phong phú.</p>',
   'cong-dong-cha-diep-ra-mat-website-chinh-thuc',
   'cong-dong', 'published', null,
   'Website chính thức về Cha Phanxicô Xaviê Trương Bửu Diệp ra mắt, phục vụ cộng đồng tín hữu.',
   now(), now() - interval '1 day'),

  ('11111111-0000-0000-0000-000000000003',
   'Chương trình hành hương Tắc Sậy nhân Đại Lễ 2026',
   '<p>Ban tổ chức thông báo chương trình hành hương đặc biệt nhân dịp Lễ Chân Phước Cha Trương Bửu Diệp.</p><p>Chương trình bao gồm Thánh Lễ, viếng mộ, gặp gỡ cộng đồng và nhiều hoạt động tâm linh ý nghĩa trong 3 ngày 2 đêm.</p>',
   'chuong-trinh-hanh-huong-tac-say-dai-le-2026',
   'cong-dong', 'published', null,
   'Chương trình hành hương đặc biệt 3 ngày 2 đêm nhân Đại Lễ Phong Chân Phước tháng 7/2026.',
   now(), now() - interval '2 days');


-- ── 7. BÀI VIẾT: CẨM NANG HÀNH HƯƠNG (category = cam-nang) ──
-- Dùng cho "Góc Hành Hương" trên trang chủ
INSERT INTO articles (id, title, content, slug, category, status, thumbnail_url, summary, updated_at, created_at) VALUES

  ('22222222-0000-0000-0000-000000000001',
   'Cẩm nang hành hương Tắc Sậy từ TP.HCM',
   '<p>Hướng dẫn chi tiết cho hành khách từ TP. Hồ Chí Minh về Tắc Sậy hành hương. Khoảng cách khoảng 280 km, thời gian di chuyển từ 4–5 tiếng.</p><h2>Các phương tiện di chuyển</h2><ul><li><strong>Xe khách:</strong> Nhiều nhà xe chạy tuyến TPHCM–Bạc Liêu hàng ngày, khởi hành từ bến xe Miền Tây và Miền Đông.</li><li><strong>Xe riêng:</strong> Theo Quốc lộ 1 qua Long An, Tiền Giang, Vĩnh Long, Sóc Trăng rồi về Bạc Liêu.</li><li><strong>Máy bay:</strong> Bay Tân Sơn Nhất–Cà Mau, sau đó đi xe khoảng 1 tiếng về Tắc Sậy.</li></ul>',
   'cam-nang-hanh-huong-tac-say-tu-tp-hcm',
   'cam-nang', 'published', null,
   'Hướng dẫn chi tiết hành hương Tắc Sậy từ TP.HCM: phương tiện, lộ trình và lưu ý quan trọng.',
   now(), now() - interval '0 days'),

  ('22222222-0000-0000-0000-000000000002',
   'Những điều cần biết trước khi hành hương Tắc Sậy',
   '<p>Để chuyến hành hương Tắc Sậy trọn vẹn và ý nghĩa, quý hành khách cần chuẩn bị một số điều quan trọng.</p><h2>Trang phục</h2><p>Mặc trang phục lịch sự, kín đáo khi vào nhà thờ. Tránh mặc quần short hoặc áo hở vai.</p><h2>Thời gian tốt nhất</h2><p>Hành hương vào buổi sáng sớm (5:00–8:00) để tham dự Thánh Lễ và không khí mát mẻ hơn.</p>',
   'nhung-dieu-can-biet-truoc-khi-hanh-huong-tac-say',
   'cam-nang', 'published', null,
   'Chuẩn bị trước khi hành hương: trang phục, lịch lễ, lưu ý và những điều không nên bỏ lỡ.',
   now(), now() - interval '1 day'),

  ('22222222-0000-0000-0000-000000000003',
   'Lịch sử và ý nghĩa Đền Thánh Tắc Sậy',
   '<p>Đền Thánh Tắc Sậy tọa lạc tại xã Phú Hưng, huyện Hồng Dân, tỉnh Bạc Liêu – nơi Cha Phanxicô Xaviê Trương Bửu Diệp đã sống, phục vụ và hy sinh vì đức tin suốt 22 năm.</p><p>Nơi đây trở thành điểm hành hương linh thiêng, thu hút hàng triệu tín hữu mỗi năm đến cầu nguyện.</p>',
   'lich-su-y-nghia-den-thanh-tac-say',
   'cam-nang', 'published', null,
   'Lịch sử và ý nghĩa tâm linh của Đền Thánh Tắc Sậy – nơi Cha Diệp hy sinh vì đức tin.',
   now(), now() - interval '2 days'),

  ('22222222-0000-0000-0000-000000000004',
   'Các điểm tham quan quanh Đền Thánh Tắc Sậy',
   '<p>Ngoài Đền Thánh chính, khu vực Tắc Sậy còn có nhiều điểm tham quan tâm linh và văn hóa đáng ghé thăm.</p><ul><li>Nhà thờ Cồn Phước nơi Cha Diệp chịu chức linh mục</li><li>Mộ các giáo dân tử đạo cùng Cha Diệp năm 1946</li><li>Nhà trưng bày di vật và hình ảnh lịch sử</li></ul>',
   'cac-diem-tham-quan-quanh-den-thanh-tac-say',
   'cam-nang', 'published', null,
   'Khám phá các điểm tâm linh và văn hóa xung quanh Đền Thánh Tắc Sậy trong chuyến hành hương.',
   now(), now() - interval '3 days'),

  ('22222222-0000-0000-0000-000000000005',
   'Ăn gì, ở đâu khi hành hương Tắc Sậy',
   '<p>Khu vực Tắc Sậy và Bạc Liêu có nhiều lựa chọn ăn uống và lưu trú phù hợp cho hành khách với nhiều mức giá khác nhau.</p><h2>Lưu trú</h2><p>Nhà nghỉ dân, nhà trọ quanh Đền Thánh giá từ 150.000–300.000đ/đêm. Khách sạn tại TP. Bạc Liêu (cách ~30km) có nhiều lựa chọn hơn.</p>',
   'an-gi-o-dau-khi-hanh-huong-tac-say',
   'cam-nang', 'published', null,
   'Gợi ý ăn uống và lưu trú cho hành khách hành hương Tắc Sậy và vùng Bạc Liêu.',
   now(), now() - interval '4 days'),

  ('22222222-0000-0000-0000-000000000006',
   'Hướng dẫn cầu nguyện tại Đền Thánh Tắc Sậy',
   '<p>Khi đến hành hương tại Đền Thánh Tắc Sậy, quý hành khách có thể tham dự các nghi lễ cầu nguyện sau để chuyến hành hương thêm ý nghĩa.</p><ul><li>Tham dự Thánh Lễ tại nhà thờ chính</li><li>Viếng mộ Cha Diệp và dâng hoa</li><li>Đọc Kinh Kính Cha Diệp tại nơi ngài hy sinh</li><li>Xin lễ cầu nguyện theo ý chỉ riêng</li></ul>',
   'huong-dan-cau-nguyen-tai-den-thanh-tac-say',
   'cam-nang', 'published', null,
   'Hướng dẫn các hình thức cầu nguyện và nghi lễ tại Đền Thánh Tắc Sậy.',
   now(), now() - interval '5 days');


-- ── 8. BÀI VIẾT: NHẬT KÝ ƠN LÀNH (category = loi-chung) ─────
-- Đây là lời chứng đã được đăng lên site (từ testimonies → articles)
ALTER TABLE articles ADD COLUMN IF NOT EXISTS testimony_categories text[] DEFAULT '{}';

INSERT INTO articles (id, title, content, slug, category, status, testimony_categories, summary, thumbnail_url, updated_at, created_at) VALUES

  ('33333333-0000-0000-0000-000000000001',
   'Cha Diệp chữa lành cho con trai tôi',
   '<p>Con trai tôi bị bệnh nặng, các bác sĩ không còn hy vọng. Gia đình tôi đến Tắc Sậy cầu nguyện cùng Cha Diệp và điều kỳ diệu đã xảy ra. Ba tuần sau khi chúng tôi hành hương, kết quả xét nghiệm cho thấy bệnh đã thuyên giảm đáng kể khiến các bác sĩ cũng kinh ngạc.</p><p>Chúng tôi biết đây là ơn lành từ Cha Diệp. Gia đình tôi sẽ không bao giờ quên điều này.</p>',
   'cha-diep-chua-lanh-cho-con-trai-toi',
   'loi-chung', 'published',
   ARRAY['Chữa bệnh'],
   'Ơn lành chữa bệnh qua lời cầu bầu của Cha Trương Bửu Diệp.',
   'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&q=80',
   now(), now() - interval '0 days'),

  ('33333333-0000-0000-0000-000000000002',
   'Nhờ Cha Diệp, gia đình con được bình an',
   '<p>Gia đình tôi trải qua giai đoạn khó khăn: con cái lục đục, chồng thất nghiệp, nợ nần chồng chất. Sau chuyến hành hương Tắc Sậy và nhiều tuần cầu nguyện cùng Cha Diệp, mọi chuyện dần ổn định.</p><p>Chồng tôi tìm được việc làm tốt, các con bắt đầu hiểu nhau hơn. Gia đình tôi tin chắc đây là ơn Cha Diệp ban.</p>',
   'nho-cha-diep-gia-dinh-con-duoc-binh-an',
   'loi-chung', 'published',
   ARRAY['Gia đình'],
   'Ơn bình an gia đình qua lời chuyển cầu của Cha Diệp.',
   'https://images.unsplash.com/photo-1609220136736-443140cfeaa8?w=800&q=80',
   now(), now() - interval '1 day'),

  ('33333333-0000-0000-0000-000000000003',
   'Thi đậu đại học nhờ cầu nguyện cùng Cha Diệp',
   '<p>Năm đó tôi thi đại học và rất lo lắng. Mẹ tôi đến Tắc Sậy cầu nguyện thay cho tôi. Kết quả tôi đậu vào trường mơ ước với điểm số cao hơn dự kiến.</p>',
   'thi-dau-dai-hoc-nho-cau-nguyen-cung-cha-diep',
   'loi-chung', 'published',
   ARRAY['Học tập'],
   'Ơn học hành và thi cử qua lời bầu cử của Cha Trương Bửu Diệp.',
   'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
   now(), now() - interval '2 days'),

  ('33333333-0000-0000-0000-000000000004',
   'Cha Diệp phù hộ qua tai nạn giao thông',
   '<p>Hôm đó tôi bị tai nạn xe máy rất nặng. Mọi người đều nói tôi khó qua khỏi. Nhưng tôi đã hồi phục hoàn toàn. Trong lúc nguy kịch tôi nhớ mình đang đeo ảnh Cha Diệp và đã cầu xin Ngài.</p>',
   'cha-diep-phu-ho-qua-tai-nan-giao-thong',
   'loi-chung', 'published',
   ARRAY['Tai nạn', 'Chữa bệnh'],
   'Sự bảo vệ kỳ diệu trong tai nạn giao thông nhờ Cha Diệp.',
   'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80',
   now(), now() - interval '3 days'),

  ('33333333-0000-0000-0000-000000000005',
   'Tìm được việc làm tốt nhờ Cha Diệp',
   '<p>Suốt mấy tháng thất nghiệp tôi rất nản lòng. Bạn bè khuyên tôi hành hương Tắc Sậy. Chưa đầy một tuần sau chuyến đi tôi nhận được cuộc gọi phỏng vấn và được nhận vào vị trí tốt hơn mong đợi.</p>',
   'tim-duoc-viec-lam-tot-nho-cha-diep',
   'loi-chung', 'published',
   ARRAY['Nghề nghiệp'],
   'Ơn nghề nghiệp qua lời chuyển cầu của Cha Trương Bửu Diệp.',
   'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80',
   now(), now() - interval '4 days'),

  ('33333333-0000-0000-0000-000000000006',
   'Hôn nhân được hàn gắn nhờ Cha Diệp',
   '<p>Vợ chồng tôi suýt ly hôn sau nhiều năm mâu thuẫn. Chúng tôi đến Tắc Sậy cầu nguyện và trao phó hôn nhân trong tay Cha Diệp. Dần dần lòng chúng tôi mở ra và bắt đầu hiểu nhau hơn.</p>',
   'hon-nhan-duoc-han-gan-nho-cha-diep',
   'loi-chung', 'published',
   ARRAY['Gia đình', 'Hôn nhân'],
   'Ơn hàn gắn hôn nhân qua lời bầu cử của Cha Diệp.',
   'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
   now(), now() - interval '5 days'),

  ('33333333-0000-0000-0000-000000000007',
   'Con được cứu sống nhờ ơn Cha Diệp',
   '<p>Đứa con gái nhỏ của tôi bị sốt cao co giật, không phản ứng. Trong lúc chờ xe cấp cứu tôi cầu nguyện với Cha Diệp hết lòng. Con tôi đã thoát nguy và hồi phục hoàn toàn.</p>',
   'con-duoc-cuu-song-nho-on-cha-diep',
   'loi-chung', 'published',
   ARRAY['Chữa bệnh', 'Trẻ em'],
   'Ơn cứu sống trẻ em qua lời cầu bầu của Cha Trương Bửu Diệp.',
   'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80',
   now(), now() - interval '6 days'),

  ('33333333-0000-0000-0000-000000000008',
   'Mẹ ung thư giai đoạn cuối được chữa lành',
   '<p>Mẹ tôi bị ung thư giai đoạn cuối, bác sĩ cho về để chuẩn bị hậu sự. Cả nhà hành hương Tắc Sậy và cầu nguyện liên tục trong một tháng. Kết quả tái khám khiến cả đoàn bác sĩ kinh ngạc khi khối u đã thu nhỏ đáng kể.</p>',
   'me-ung-thu-giai-doan-cuoi-duoc-chua-lanh',
   'loi-chung', 'published',
   ARRAY['Chữa bệnh'],
   'Ơn chữa lành ung thư qua lời chuyển cầu của Cha Diệp.',
   'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80',
   now(), now() - interval '7 days'),

  ('33333333-0000-0000-0000-000000000009',
   'Người thân quay lại đạo nhờ Cha Diệp',
   '<p>Anh trai tôi bỏ đạo nhiều năm. Tôi âm thầm cầu nguyện cùng Cha Diệp xin ơn cho anh. Và rồi một ngày anh tự nguyện xin đi xưng tội mà không cần ai thuyết phục.</p>',
   'nguoi-than-quay-lai-dao-nho-cha-diep',
   'loi-chung', 'published',
   ARRAY['Đức tin'],
   'Ơn trở lại đạo qua lời bầu cử của Cha Trương Bửu Diệp.',
   'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&q=80',
   now(), now() - interval '8 days'),

  ('33333333-0000-0000-0000-000000000010',
   'Vượt qua khủng hoảng tâm lý nhờ Cha Diệp',
   '<p>Tôi từng rơi vào trầm cảm nặng, không muốn sống. Một người bạn đưa tôi đến Tắc Sậy. Ở đó tôi cảm nhận được sự bình an lạ thường, như có một bàn tay vô hình nâng đỡ tâm hồn tôi.</p>',
   'vuot-qua-khung-hoang-tam-ly-nho-cha-diep',
   'loi-chung', 'published',
   ARRAY['Tâm lý', 'Bình an'],
   'Vượt qua khủng hoảng tâm lý qua ơn Cha Trương Bửu Diệp.',
   'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80',
   now(), now() - interval '9 days');


-- ── 8b. LỜI CHỨNG MẪU (testimonies) ───────────────────────────
INSERT INTO testimonies (name, location, categories, title, content, status, created_at) VALUES

  -- PENDING (7)
  ('Nguyễn Thị Bích', 'TP. Hồ Chí Minh',
   ARRAY['Bệnh tật & chữa lành'],
   'Con trai tôi khỏi bệnh thận sau khi cầu nguyện cùng Cha Diệp',
   'Con trai tôi năm nay 14 tuổi bị suy thận mạn giai đoạn 3, bác sĩ nói cần ghép thận sớm. Gia đình chúng tôi đến Tắc Sậy hành hương và cầu nguyện liên tục ba tháng. Đợt tái khám gần nhất kết quả cải thiện đến mức bác sĩ nói chưa cần ghép thận vội. Chúng tôi tin chắc đây là ơn Cha Diệp.',
   'pending', now() - interval '1 day'),

  ('Trần Minh Tuấn', 'Đồng Nai',
   ARRAY['Tai nạn & hiểm nguy'],
   'Xe container lao vào chỗ tôi đứng – tôi thoát nạn lạ thường',
   'Hôm đó tôi đứng ở lề đường chờ xe, bỗng nhiên một xe container mất phanh lao thẳng vào chỗ tôi. Tôi không kịp phản ứng nhưng không hiểu sao người tôi tự bước ra khỏi vùng nguy hiểm dù tôi không ý thức được. Người xung quanh nói không ai hiểu tôi thoát ra bằng cách nào. Tôi tin Cha Diệp đã che chở tôi hôm đó vì buổi sáng tôi vừa cầu nguyện với Ngài.',
   'pending', now() - interval '2 days'),

  ('Phạm Thị Hương', 'Cần Thơ',
   ARRAY['Học hành & thi cử'],
   'Thi đậu lớp 10 chuyên Toán nhờ ơn Cha Diệp',
   'Năm ngoái tôi thi vào lớp 10 chuyên Toán trường tỉnh, điểm chuẩn rất cao. Mẹ tôi khấn Cha Diệp phù hộ cho tôi trước ngày thi. Tôi đỗ với điểm số vượt cả kỳ vọng của thầy cô. Mẹ con tôi đã trở lại Tắc Sậy tạ ơn.',
   'pending', now() - interval '3 days'),

  ('Lê Văn Khoa', 'Tiền Giang',
   ARRAY['Gia đình & hôn nhân', 'Bệnh tật & chữa lành'],
   'Vợ tôi qua cơn nguy kịch sau sinh nhờ lời nguyện cùng Cha',
   'Vợ tôi sinh con thứ hai bị băng huyết nặng, cấp cứu suốt 6 tiếng đồng hồ. Tôi đứng ngoài phòng mổ chỉ biết cầu nguyện xin Cha Diệp cứu vợ tôi. Ơn Chúa và Cha Diệp vợ tôi đã qua khỏi, mẹ con đều bình an. Cả gia đình tôi về Tắc Sậy tạ ơn dịp đầy tháng của con.',
   'pending', now() - interval '4 days'),

  ('Võ Thị Mỹ Lệ', 'Kiên Giang',
   ARRAY['Công việc & nghề nghiệp'],
   'Giữ được công việc khi công ty sắp cắt giảm nhờ Cha Diệp',
   'Công ty tôi thông báo sắp cắt giảm 30% nhân sự, tôi rất lo vì mới có con nhỏ. Tôi cầu nguyện cùng Cha Diệp mỗi tối. Đến ngày công bố danh sách, tên tôi không có trong số bị cắt giảm, thậm chí tôi còn được giữ lại vào bộ phận quan trọng hơn. Tôi biết ơn Cha Diệp vô cùng.',
   'pending', now() - interval '5 days'),

  ('Huỳnh Tấn Phát', 'Bạc Liêu',
   ARRAY['Tâm hồn & hoán cải'],
   'Từ người vô thần đến người tin yêu Cha Diệp',
   'Tôi từng là người không tin vào bất kỳ tôn giáo nào. Người bạn Công Giáo rủ tôi theo hành hương Tắc Sậy. Ban đầu tôi chỉ đi cho vui. Nhưng khi đứng trước mộ Cha Diệp, tự nhiên lòng tôi bị xúc động mạnh và nước mắt cứ trào ra. Từ đó tôi bắt đầu tìm hiểu đức tin và hiện đang học giáo lý để rửa tội.',
   'pending', now() - interval '6 days'),

  ('Nguyễn Hoàng Long', 'An Giang',
   ARRAY['Tài chính & kinh tế'],
   'Thoát cảnh nợ nần nhờ lời chuyển cầu của Cha Diệp',
   'Gia đình tôi vay nợ để làm ăn nhưng thất bại, nợ ngân hàng và chủ nợ bên ngoài gần 800 triệu, có nguy cơ mất nhà. Chúng tôi hành hương Tắc Sậy trong tuyệt vọng. Sau chuyến đó một người thân ở nước ngoài bỗng liên hệ và giúp chúng tôi thoát ra khỏi khoản nợ đó. Điều chúng tôi không bao giờ nghĩ có thể xảy ra.',
   'pending', now() - interval '7 days'),

  -- APPROVED (4)
  ('Trần Thị Thanh Huyền', 'Đồng Tháp',
   ARRAY['Bệnh tật & chữa lành'],
   'Ơn chữa lành ung thư sau hành hương Tắc Sậy',
   'Tôi được chẩn đoán ung thư cổ tử cung giai đoạn 2. Trong thời gian điều trị hóa xạ trị, gia đình tôi hành hương Tắc Sậy hai lần và cầu nguyện không ngơi. Sau 6 tháng điều trị, kết quả kiểm tra cho thấy hết dấu vết ung thư. Bác sĩ nói kết quả tốt hơn nhiều so với dự tính. Tôi tin đây là ơn Cha Diệp đã cầu bầu cho tôi.',
   'approved', now() - interval '8 days'),

  ('Nguyễn Phước Hiếu', 'Sóc Trăng',
   ARRAY['Tai nạn & hiểm nguy'],
   'Sống sót kỳ diệu trong vụ lật tàu trên sông',
   'Chuyến tàu cao tốc tôi đi bị lật úp giữa sông trong đêm tối. Nhiều người không qua khỏi. Tôi không biết bơi nhưng lạ thay cứ nổi lên được dù bị va đập. Đến khi được cứu vớt, tôi phát hiện mình vẫn đang nắm chặt ảnh Cha Diệp trong tay mà không biết mình đã lấy lúc nào.',
   'approved', now() - interval '9 days'),

  ('Lê Thị Diệu Linh', 'Long An',
   ARRAY['Gia đình & hôn nhân'],
   'Con gái bỏ đi được tìm thấy bình an nhờ Cha Diệp',
   'Con gái tôi 17 tuổi bỗng nhiên bỏ nhà đi mà không để lại tin tức, liên lạc không được. Gia đình tôi kêu cầu Cha Diệp tha thiết suốt hai tuần. Đúng ngày 14 con gái tôi tự về nhà, bình an và hối hận. Cháu nói trong thời gian đó có lúc nguy hiểm nhưng luôn có người lạ xuất hiện giúp đỡ kịp thời.',
   'approved', now() - interval '10 days'),

  ('Đỗ Minh Nhật', 'Hậu Giang',
   ARRAY['Ơn gọi & đời tu'],
   'Được sáng tỏ ơn gọi tu trì nhờ Cha Diệp',
   'Nhiều năm tôi phân vân giữa đời thường và ơn gọi tu trì, không dứt khoát được. Tôi đến Tắc Sậy một mình, cầu nguyện dài và thinh lặng trước mộ Cha Diệp. Tôi cảm nhận rõ ràng trong lòng một sự bình an và sáng suốt chưa từng có. Sau chuyến đó tôi xin vào Chủng viện và đang học năm thứ nhất.',
   'approved', now() - interval '11 days'),

  -- REJECTED (2)
  (NULL, 'TP. Hồ Chí Minh',
   ARRAY['Khác'],
   'Cầu thắng số đề',
   'Tôi xin cha diệp cho tôi thắng số đề mà tôi trúng thiệt luôn hai lần liên tiếp.',
   'rejected', now() - interval '12 days'),

  ('Nguyễn Văn Bình', 'Hà Nội',
   ARRAY['Khác'],
   'Cha Diệp linh lắm',
   'Tôi thấy cha diệp rất linh. Ai cũng nói vậy.',
   'rejected', now() - interval '13 days'),

  -- PUBLISHED (5)
  ('Phan Thị Thu Cúc', 'Bến Tre',
   ARRAY['Bệnh tật & chữa lành'],
   'Ba năm chạy thận – nay thận phục hồi nhờ Cha Diệp',
   'Tôi chạy thận nhân tạo suốt ba năm. Gia đình đưa tôi hành hương Tắc Sậy khi không còn hy vọng. Chúng tôi cầu nguyện tha thiết và xin Cha Diệp cầu bầu. Đến lần tái khám sau, chỉ số thận của tôi cải thiện đến mức bác sĩ ngạc nhiên và giảm dần số lần chạy thận. Hiện tôi chỉ còn chạy thận một tuần một lần thay vì ba lần.',
   'published', now() - interval '14 days'),

  ('Đặng Văn Hải', 'Vĩnh Long',
   ARRAY['Tai nạn & hiểm nguy'],
   'Thoát khỏi đám cháy trong đêm tối nhờ Cha Diệp phù hộ',
   'Đêm đó nhà tôi bốc cháy lúc 2 giờ sáng khi cả nhà đang ngủ. Vợ chồng tôi và ba đứa con nhỏ đều thoát ra an toàn dù lửa đã bao vây tứ phía. Hàng xóm ai cũng nói không hiểu chúng tôi ra được bằng cách nào vì không có lối thoát. Trong nhà có ảnh Cha Diệp mà chúng tôi kính ngưỡng bao năm nay.',
   'published', now() - interval '15 days'),

  ('Võ Thị Ngọc Châu', 'Cà Mau',
   ARRAY['Học hành & thi cử'],
   'Đậu thủ khoa khối D nhờ lời nguyện cùng Cha Diệp',
   'Tôi học không giỏi lắm nhưng rất cố gắng. Trước kỳ thi đại học mẹ tôi đưa cả nhà hành hương Tắc Sậy. Kết quả tôi đạt điểm thủ khoa khối D toàn tỉnh và đậu vào Trường Đại học Sư phạm TP.HCM. Thầy cô và bạn bè đều kinh ngạc vì điểm tôi vượt xa dự đoán.',
   'published', now() - interval '16 days'),

  ('Nguyễn Công Danh', 'Trà Vinh',
   ARRAY['Công việc & nghề nghiệp', 'Tài chính & kinh tế'],
   'Sau 8 tháng thất nghiệp tìm được việc tốt nhờ Cha Diệp',
   'Mất việc làm đúng lúc vợ mang thai con đầu lòng, tôi rơi vào tuyệt vọng. Gần 8 tháng nộp hồ sơ khắp nơi mà không ai gọi. Tôi đến Tắc Sậy cầu nguyện với Cha Diệp trong nước mắt. Chưa đầy 10 ngày sau tôi nhận được lời mời làm việc từ một công ty lớn, vị trí và lương tốt hơn công việc cũ.',
   'published', now() - interval '17 days'),

  ('Trần Thị Kim Anh', 'TP. Hồ Chí Minh',
   ARRAY['Định cư & di dân'],
   'Hồ sơ định cư được chấp thuận sau hai lần từ chối',
   'Gia đình tôi nộp hồ sơ bảo lãnh định cư hai lần đều bị từ chối vì lý do kỹ thuật. Lần thứ ba tôi đến Tắc Sậy cầu nguyện với Cha Diệp trước khi nộp. Tôi khấn nếu được duyệt sẽ trở lại Tắc Sậy tạ ơn và giúp đỡ người khó khăn tại đó. Hồ sơ lần này được duyệt suôn sẻ không vướng bất kỳ trở ngại nào.',
   'published', now() - interval '18 days');


-- ── 9. TIỂU SỬ – THÔNG TIN CHÍNH (bio_facts) ──────────────────
INSERT INTO bio_facts (label, value, sort_order) VALUES
  ('Sinh',        '01/01/1897 tại Cồn Phước, làng Tấn Đức, hạt Long Xuyên (nay: xã Long Kiến, An Giang)', 1),
  ('Tên thánh',   'Phanxicô Xaviê – tên thánh bổn mạng',              2),
  ('Thụ phong',   'Linh mục ngày 21/06/1924',                         3),
  ('Mục vụ',      'Cha sở Giáo xứ Tắc Sậy, Bạc Liêu (1924–1946)',   4),
  ('Hy sinh',     'Ngày 12/03/1946 tại Tắc Sậy',                     5),
  ('Phong Chân Phước', '02/07/2026 tại Tắc Sậy, Bạc Liêu',           6),
  ('Lễ kính',     '12 tháng 3 hằng năm',                             7);


-- ── 10. HÀNH TRÌNH ĐỨC TIN (biography_milestones) ─────────────
INSERT INTO biography_milestones (year, title, description, sort_order) VALUES
  ('1897', 'Chào đời',
   'Phanxicô Xaviê Trương Bửu Diệp sinh ngày 01/01/1897 tại Họ đạo Cồn Phước, làng Tấn Đức, hạt Long Xuyên (nay là Giáo xứ Cồn Phước, xã Long Kiến, tỉnh An Giang). Ngài là con trưởng trong một gia đình Công Giáo đạo đức.',
   1),
  ('1924', 'Thụ phong linh mục',
   'Ngày 21/06/1924, thầy Diệp được phong chức linh mục – là một trong những linh mục người Việt hiếm hoi thời bấy giờ.',
   2),
  ('1924', 'Về phục vụ tại Tắc Sậy',
   'Sau khi thụ phong, Cha Diệp được bổ nhiệm về Giáo xứ Tắc Sậy, Bạc Liêu. Ngài phục vụ bà con nơi đây suốt 22 năm với lòng yêu thương vô bờ.',
   3),
  ('1945', 'Thời kỳ chiến tranh bùng nổ',
   'Cuộc chiến tranh bùng nổ khốc liệt. Cha Diệp ở lại bảo vệ và che chở đoàn chiên, từ chối rời bỏ giáo xứ dù nguy hiểm đến tính mạng.',
   4),
  ('1946', 'Hy sinh vì đàn chiên',
   'Ngày 12/03/1946, khi bị bắt và được thả nếu bỏ lại đoàn chiên, Cha Diệp dứt khoát từ chối và anh dũng chịu tử đạo vì đức tin.',
   5),
  ('2026', 'Phong Chân Phước',
   'Ngày 02/07/2026, Đức Thánh Cha long trọng chủ sự Thánh Lễ Phong Chân Phước cho Cha Phanxicô Xaviê Trương Bửu Diệp tại Tắc Sậy.',
   6);


-- ── 11. PHONG CHÂN PHƯỚC – CÁC GIAI ĐOẠN ─────────────────────
INSERT INTO beatification_steps (year, title, detail, done, highlight, sort_order, updated_at) VALUES
  ('1997', 'Hồ sơ điều tra cấp giáo phận',
   'Giáo phận Cần Thơ mở cuộc điều tra sơ bộ về cuộc đời và cái chết của Cha Trương Bửu Diệp theo quy trình phong thánh của Giáo Hội.',
   true, false, 1, now()),
  ('2001', 'Gửi hồ sơ về Roma',
   'Hồ sơ điều tra hoàn chỉnh được gửi lên Bộ Phong Thánh tại Vatican để xem xét và thẩm định.',
   true, false, 2, now()),
  ('2010', 'Công nhận tử đạo',
   'Bộ Phong Thánh chính thức công nhận Cha Diệp là người tử đạo vì đức tin – bước quan trọng trong tiến trình phong thánh.',
   true, true, 3, now()),
  ('2024', 'Phê chuẩn phép lạ',
   'Đức Thánh Cha phê chuẩn phép lạ được công nhận xảy ra qua lời cầu bầu của Cha Diệp sau khi Bộ Phong Thánh thẩm định.',
   true, true, 4, now()),
  ('02/07/2026', 'Lễ Phong Chân Phước',
   'Đức Thánh Cha chủ sự Thánh Lễ Phong Chân Phước tại Đền Thánh Tắc Sậy, Bạc Liêu trước hàng triệu tín hữu.',
   true, true, 5, now());


-- ── 12. TIẾN TRÌNH PHONG THÁNH ────────────────────────────────
INSERT INTO canonization_steps (year, title, detail, done, highlight, sort_order, updated_at) VALUES
  ('2026', 'Khởi động tiến trình sau Chân Phước',
   'Sau lễ Phong Chân Phước, tiến trình xin phong Thánh chính thức được khởi động theo quy định của Giáo Hội.',
   true, false, 1, now()),
  ('2027+', 'Điều tra phép lạ thứ hai',
   'Theo quy định, cần thêm một phép lạ được công nhận xảy ra sau khi phong Chân Phước mới đủ điều kiện phong Thánh.',
   false, false, 2, now()),
  ('TBD', 'Phê chuẩn phép lạ thứ hai',
   'Bộ Phong Thánh xem xét và phê chuẩn phép lạ được cho là xảy ra qua lời cầu bầu của Chân Phước Diệp.',
   false, false, 3, now()),
  ('TBD', 'Lễ Phong Thánh',
   'Đức Thánh Cha chủ sự Thánh Lễ Phong Thánh cho Chân Phước Phanxicô Xaviê Trương Bửu Diệp.',
   false, true, 4, now());


-- ── 13. LỊCH LỄ ───────────────────────────────────────────────
-- (Bỏ qua — anh điền dữ liệu thật qua admin UI)

-- ── 14. ĐỊA CHỈ ───────────────────────────────────────────────
-- (Bỏ qua — anh điền dữ liệu thật qua admin UI)

-- ── 15. LIÊN HỆ CỘNG ĐỒNG ────────────────────────────────────
INSERT INTO community_info (
  name, sort_order,
  hours, address, phone, email,
  website1, website2,
  facebook_url, tiktok_url, youtube_url,
  viber_qr_url, whatsapp_qr_url,
  updated_at
) VALUES (
  'CHATRUONGBUUDIEP', 1,
  '05:00 – 21:00 hàng ngày',
  '26 Đường 1B, KDC Hạnh Phúc, Bình Hưng, TP. HCM',
  '0911 990 226',
  'congdongchadiep@gmail.com',
  'chatruongbuudiep.com', 'chatruongbuudiep.vn',
  'https://www.facebook.com/chatruongbuudiep',
  'https://www.tiktok.com/@chatruongbuudiep',
  'https://www.youtube.com/@chatruongbuudiep',
  '/images/qr-viber.png', '/images/qr-whatsapp.png',
  now()
);

-- ── 16. LỊCH HÀNH HƯƠNG ───────────────────────────────────────
INSERT INTO pilgrimage_trips (id, dates, title, departure, destinations, organizer, description, contact, status, image_url, sort_order, updated_at) VALUES
  ('cccccccc-0000-0000-0000-000000000001',
   '01/07/2026 – 03/07/2026',
   'Hành hương Đại Lễ Phong Chân Phước 2026',
   'TP. Hồ Chí Minh',
   ARRAY['Đền Thánh Tắc Sậy, Bạc Liêu'],
   'Ban Mục Vụ Cộng Đồng',
   'Chuyến hành hương đặc biệt nhân Đại Lễ Phong Chân Phước Cha Phanxicô Xaviê Trương Bửu Diệp (02/07/2026). Hành trình 3 ngày 2 đêm, bao gồm Thánh Lễ Phong Chân Phước, viếng mộ và các nghi lễ tâm linh ý nghĩa.',
   'Liên hệ: 0911 990 226 | congdong@chatruongbuudiep.com',
   'open', null, 1, now()),

  ('cccccccc-0000-0000-0000-000000000002',
   '11/03/2027 – 12/03/2027',
   'Hành hương Lễ Kính Cha Diệp 2027',
   'Nhiều điểm xuất phát',
   ARRAY['Đền Thánh Tắc Sậy, Bạc Liêu'],
   'Giáo xứ Tắc Sậy',
   'Chuyến hành hương hàng năm nhân Lễ Kính Cha Phanxicô Xaviê Trương Bửu Diệp (12/03). Bao gồm Thánh Lễ và viếng thăm Đền Thánh.',
   'Liên hệ Ban Mục Vụ: 0911 990 226',
   'open', null, 2, now());


-- ── 17. GIỜ LỄ ───────────────────────────────────────────────
INSERT INTO mass_schedule_meta (location_name, note) VALUES (
  'Thánh đường Tắc Sậy',
  'Lịch có thể thay đổi theo thông báo của giáo xứ.'
);

INSERT INTO mass_schedule (day_label, times, sort_order) VALUES
  ('Thứ Hai – Thứ Sáu', ARRAY['05:00', '09:00', '17:00'],       1),
  ('Thứ Bảy',           ARRAY['05:00', '09:00', '16:00'],       2),
  ('Chúa Nhật',         ARRAY['05:00', '07:00', '09:00', '17:00'], 3);

-- ── 18. CẤU HÌNH TRANG CHỦ ───────────────────────────────────
INSERT INTO homepage_config (id, config, updated_at)
VALUES ('main', '{
  "tin_nhanh": {
    "hero":   "11111111-0000-0000-0000-000000000001",
    "slot_1": "11111111-0000-0000-0000-000000000002",
    "slot_2": "11111111-0000-0000-0000-000000000003"
  },
  "hanh_huong": {
    "slot_1": "22222222-0000-0000-0000-000000000001",
    "slot_2": "22222222-0000-0000-0000-000000000002",
    "slot_3": "22222222-0000-0000-0000-000000000003",
    "slot_4": "22222222-0000-0000-0000-000000000004",
    "slot_5": "22222222-0000-0000-0000-000000000005",
    "slot_6": "22222222-0000-0000-0000-000000000006"
  },
  "cung_cau_nguyen": {
    "announcement": "55555555-0000-0000-0000-000000000001",
    "loi_kinh_1": "aaaaaaaa-0000-0000-0000-000000000001",
    "loi_kinh_2": "aaaaaaaa-0000-0000-0000-000000000002",
    "loi_kinh_3": "aaaaaaaa-0000-0000-0000-000000000003",
    "loi_kinh_4": "aaaaaaaa-0000-0000-0000-000000000004",
    "loi_kinh_5": "aaaaaaaa-0000-0000-0000-000000000005",
    "loi_kinh_6": "aaaaaaaa-0000-0000-0000-000000000006",
    "thanh_ca_1": "bbbbbbbb-0000-0000-0000-000000000001",
    "thanh_ca_2": "bbbbbbbb-0000-0000-0000-000000000002",
    "thanh_ca_3": "bbbbbbbb-0000-0000-0000-000000000003",
    "thanh_ca_4": "bbbbbbbb-0000-0000-0000-000000000004",
    "thanh_ca_5": "bbbbbbbb-0000-0000-0000-000000000005",
    "thanh_ca_6": "bbbbbbbb-0000-0000-0000-000000000006"
  },
  "chung_nhan": {
    "slot_1":  "33333333-0000-0000-0000-000000000001",
    "slot_2":  "33333333-0000-0000-0000-000000000002",
    "slot_3":  "33333333-0000-0000-0000-000000000003",
    "slot_4":  "33333333-0000-0000-0000-000000000004",
    "slot_5":  "33333333-0000-0000-0000-000000000005",
    "slot_6":  "33333333-0000-0000-0000-000000000006",
    "slot_7":  "33333333-0000-0000-0000-000000000007",
    "slot_8":  "33333333-0000-0000-0000-000000000008",
    "slot_9":  "33333333-0000-0000-0000-000000000009",
    "slot_10": "33333333-0000-0000-0000-000000000010"
  }
}', now())
ON CONFLICT (id) DO UPDATE SET config = EXCLUDED.config, updated_at = EXCLUDED.updated_at;

-- ================================================================
-- XONG! Dữ liệu mẫu đã được nạp vào.
-- Bước tiếp theo: kiểm tra trang admin và trang chủ trên site.
-- ================================================================
