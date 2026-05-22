-- ================================================================
-- SEED DỮ LIỆU MẪU — Ban Quản Trị (BQT)
-- Chạy trong Supabase Dashboard > SQL Editor
--
-- Bước 1: Tạo bảng nếu chưa có (CREATE TABLE IF NOT EXISTS)
-- Bước 2: Xóa dữ liệu cũ, insert dữ liệu mẫu
-- ================================================================

-- ── 0. TẠO BẢNG NẾU CHƯA CÓ ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS bqt_members (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  department   text NOT NULL,
  role         text NOT NULL,
  photo_url    text,
  phone        text,
  email        text,
  facebook_url text,
  term_year    integer,
  is_active    boolean NOT NULL DEFAULT true,
  notes        text,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bqt_meetings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text,
  meeting_date date NOT NULL,
  attendees    text,
  content      text,
  tasks        jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS bqt_finances (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type         text NOT NULL CHECK (type IN ('thu', 'chi')),
  entry_date   date NOT NULL,
  amount       numeric NOT NULL DEFAULT 0,
  category     text NOT NULL DEFAULT '',
  description  text,
  partner_name text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bqt_members  DISABLE ROW LEVEL SECURITY;
ALTER TABLE bqt_meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE bqt_finances DISABLE ROW LEVEL SECURITY;

-- ── 1. XÓA DỮ LIỆU CŨ ────────────────────────────────────────────
TRUNCATE bqt_members, bqt_meetings, bqt_finances RESTART IDENTITY CASCADE;


-- ── 1. THÀNH VIÊN BQT ─────────────────────────────────────────────
-- 14 thành viên, đủ một người mỗi chức vụ, nhiệm kỳ 2025–2027

-- Ảnh từ pravatar.cc — miễn phí, 1:1, 70 ảnh người thật khác nhau
-- Nữ: img 1–47  |  Nam: img 48–70

INSERT INTO bqt_members
  (id, name, department, role, photo_url, phone, email, term_year, is_active, sort_order, created_at)
VALUES

  -- Ban Thường trực (4 thành viên)
  ('bb000001-0000-0000-0000-000000000001',
   'Maria | Nguyễn Thị Bích Loan', 'thuong-truc', 'Trưởng ban',
   'https://i.pravatar.cc/300?img=47',
   '0901 123 456', 'bichloan.bqt@gmail.com', 2025, true, 1, now()),

  ('bb000001-0000-0000-0000-000000000002',
   'Giuse | Trần Văn Minh', 'thuong-truc', 'Phó ban Nội vụ',
   'https://i.pravatar.cc/300?img=68',
   '0912 234 567', 'tranvanminh.bqt@gmail.com', 2025, true, 2, now()),

  ('bb000001-0000-0000-0000-000000000003',
   'Têrêsa | Lê Thị Thu Hương', 'thuong-truc', 'Phó ban Ngoại vụ',
   'https://i.pravatar.cc/300?img=44',
   '0923 345 678', 'lethuhuong.bqt@gmail.com', 2025, true, 3, now()),

  ('bb000001-0000-0000-0000-000000000004',
   'Phêrô | Nguyễn Văn Tài', 'thuong-truc', 'Thủ quỹ',
   'https://i.pravatar.cc/300?img=65',
   '0934 456 789', 'nguyenvantai.bqt@gmail.com', 2025, true, 4, now()),

  -- Ban Kinh nguyện (2 thành viên)
  ('bb000002-0000-0000-0000-000000000001',
   'Marta | Trần Thị Bạch Tuyết', 'kinh-nguyen', 'Điều phối cầu nguyện',
   'https://i.pravatar.cc/300?img=38',
   '0945 567 890', 'bachthuyet.bqt@gmail.com', 2025, true, 1, now()),

  ('bb000002-0000-0000-0000-000000000002',
   'Gioan | Phạm Văn Dũng', 'kinh-nguyen', 'Hỗ trợ phụng vụ',
   'https://i.pravatar.cc/300?img=60',
   '0956 678 901', 'phamvandung.bqt@gmail.com', 2025, true, 2, now()),

  -- Ban Hành hương (4 thành viên)
  ('bb000003-0000-0000-0000-000000000001',
   'Phaolô | Lê Minh Tuấn', 'hanh-huong', 'Trưởng ban Hành hương',
   'https://i.pravatar.cc/300?img=57',
   '0967 789 012', 'leminhtuan.bqt@gmail.com', 2025, true, 1, now()),

  ('bb000003-0000-0000-0000-000000000002',
   'Anna | Nguyễn Thị Lan', 'hanh-huong', 'Điều phối đối tác',
   'https://i.pravatar.cc/300?img=25',
   '0978 890 123', 'nguyenthilan.bqt@gmail.com', 2025, true, 2, now()),

  ('bb000003-0000-0000-0000-000000000003',
   'Antôn | Trần Thanh Hải', 'hanh-huong', 'Hậu cần & Logistics',
   'https://i.pravatar.cc/300?img=52',
   '0989 901 234', 'tranthanhhai.bqt@gmail.com', 2025, true, 3, now()),

  ('bb000003-0000-0000-0000-000000000004',
   'Rosa | Võ Thị Mai', 'hanh-huong', 'Quản lý đăng ký & Thu chi',
   'https://i.pravatar.cc/300?img=33',
   '0901 012 345', 'vothimai.bqt@gmail.com', 2025, true, 4, now()),

  -- Ban Truyền thông (4 thành viên)
  ('bb000004-0000-0000-0000-000000000001',
   'Tôma | Nguyễn Trọng Khải', 'truyen-thong', 'Trưởng ban Truyền thông',
   'https://i.pravatar.cc/300?img=70',
   '0912 123 456', 'nguyentrongkhai.bqt@gmail.com', 2025, true, 1, now()),

  ('bb000004-0000-0000-0000-000000000002',
   'Maria | Nguyễn Thị Hồng Nhung', 'truyen-thong', 'MC',
   'https://i.pravatar.cc/300?img=15',
   '0923 234 567', 'hongnhung.bqt@gmail.com', 2025, true, 2, now()),

  ('bb000004-0000-0000-0000-000000000003',
   'Giuse | Đinh Văn Long', 'truyen-thong', 'Kỹ thuật âm thanh & Livestream',
   'https://i.pravatar.cc/300?img=62',
   '0934 345 678', 'dinhvanlong.bqt@gmail.com', 2025, true, 3, now()),

  ('bb000004-0000-0000-0000-000000000004',
   'Têrêsa | Phan Thị Mỹ Linh', 'truyen-thong', 'Hình ảnh & Video',
   'https://i.pravatar.cc/300?img=9',
   '0945 456 789', 'phanmylinh.bqt@gmail.com', 2025, true, 4, now())

ON CONFLICT (id) DO NOTHING;


-- ── 2. BIÊN BẢN HỌP ──────────────────────────────────────────────
-- 5 biên bản họp, tháng 1–5/2026

INSERT INTO bqt_meetings
  (id, title, meeting_date, attendees, content, tasks, created_at, updated_at)
VALUES

  -- Họp tháng 1: Kế hoạch hành hương đầu năm
  ('cc000001-0000-0000-0000-000000000001',
   'Họp triển khai kế hoạch hành hương Q1/2026',
   '2026-01-15',
   'Loan (TB), Minh (PNV), Hương (PNg), Tài (TQ), Tuấn (BHH), Khải (BTT)',
   '<h3>Nội dung cuộc họp</h3>
<p><strong>1. Kế hoạch hành hương quý I/2026</strong></p>
<p>Ban Hành hương báo cáo đã liên hệ được 3 đơn vị vận chuyển cho chuyến tháng 3. Dự kiến tổ chức 2 đợt: 07–08/3 và 14–15/3 nhân dịp giỗ Cha 12/3.</p>
<p><strong>2. Lịch cầu nguyện đầu năm</strong></p>
<p>Ban Kinh nguyện xác nhận duy trì lịch cầu nguyện hàng tuần, phối hợp Ban Truyền thông livestream đầy đủ các buổi.</p>
<p><strong>3. Tài chính đầu năm</strong></p>
<p>Thủ quỹ báo cáo số dư quỹ từ năm 2025 chuyển sang: 45.200.000 ₫. Kế hoạch thu – chi quý I được thông qua.</p>',
   '[
     {"text": "Xác nhận đơn vị vận chuyển cho đợt hành hương tháng 3", "assignee": "Anna Lan", "done": true},
     {"text": "Lên lịch cầu nguyện tháng 1–2 và thông báo lên app", "assignee": "Bạch Tuyết", "done": true},
     {"text": "Lập dự toán thu chi quý I trình Ban Thường trực", "assignee": "Rosa Mai", "done": true},
     {"text": "Cập nhật thông tin hành hương lên app và mạng xã hội", "assignee": "Hồng Nhung", "done": false}
   ]'::jsonb,
   now() - interval '120 days', now() - interval '120 days'),

  -- Họp tháng 2: Chuẩn bị lễ giỗ Cha 12/3
  ('cc000001-0000-0000-0000-000000000002',
   'Họp chuẩn bị đại lễ giỗ Cha Phanxicô 12/3',
   '2026-02-10',
   'Loan (TB), Minh (PNV), Hương (PNg), Tài (TQ), Tuyết (BKN), Tuấn (BHH), Khải (BTT), Nhung (MC)',
   '<h3>Nội dung cuộc họp</h3>
<p><strong>1. Phân công chuẩn bị lễ giỗ Cha 12/3/2026</strong></p>
<p>Họp toàn ban để phân công nhiệm vụ cho đại lễ giỗ Cha. Dự kiến đón tiếp 500–700 khách hành hương trong hai ngày 12–13/3.</p>
<p><strong>2. Kịch bản chương trình lễ giỗ</strong></p>
<p>Ban Truyền thông trình bày kịch bản dẫn chương trình. MC Hồng Nhung phụ trách dẫn xuyên suốt. Kỹ thuật âm thanh kiểm tra thiết bị trước 7/3.</p>
<p><strong>3. Hậu cần và đón tiếp</strong></p>
<p>Ban Hành hương đảm nhận toàn bộ hậu cần, sắp xếp chỗ nghỉ và bố trí cơm trưa cho đoàn xa.</p>',
   '[
     {"text": "Hoàn thiện kịch bản lễ giỗ và gửi Trưởng ban duyệt", "assignee": "Hồng Nhung", "done": true},
     {"text": "Kiểm tra và test toàn bộ thiết bị âm thanh, livestream", "assignee": "Đinh Long", "done": true},
     {"text": "Liên hệ đặt cơm hộp cho 600 khách ngày 12–13/3", "assignee": "Thanh Hải", "done": true},
     {"text": "Đăng thông báo lễ giỗ lên app và mạng xã hội trước 28/2", "assignee": "Mỹ Linh", "done": true},
     {"text": "Chuẩn bị vật phẩm phụng vụ: nến, hoa, ảnh Cha", "assignee": "Gioan Dũng", "done": false}
   ]'::jsonb,
   now() - interval '98 days', now() - interval '98 days'),

  -- Họp tháng 3: Tổng kết lễ giỗ và kế hoạch Q2
  ('cc000001-0000-0000-0000-000000000003',
   'Họp tổng kết lễ giỗ Cha và kế hoạch Q2/2026',
   '2026-03-20',
   'Loan (TB), Minh (PNV), Hương (PNg), Tài (TQ), Tuyết (BKN), Dũng (BKN), Tuấn (BHH), Lan (BHH), Hải (BHH), Mai (BHH), Khải (BTT)',
   '<h3>Nội dung cuộc họp</h3>
<p><strong>1. Tổng kết lễ giỗ Cha 12/3/2026</strong></p>
<p>Lễ giỗ diễn ra tốt đẹp với hơn 650 khách hành hương tham dự. Livestream đạt 2.400 lượt xem trực tiếp. Không có sự cố đáng kể. Ban Thường trực ghi nhận và khen ngợi sự chuẩn bị chu đáo của tất cả các ban.</p>
<p><strong>2. Tổng kết tài chính lễ giỗ</strong></p>
<p>Thu từ quyên góp trong 2 ngày lễ: 18.700.000 ₫. Chi phí tổ chức: 9.200.000 ₫. Chênh lệch dương: 9.500.000 ₫ nhập quỹ chung.</p>
<p><strong>3. Kế hoạch hành hương quý II/2026</strong></p>
<p>Dự kiến 3 chuyến hành hương: tháng 4 (du lịch tâm linh An Giang), tháng 5 (hành hương kỷ niệm 1 năm), tháng 6 (hành hương kết hợp thiện nguyện).</p>',
   '[
     {"text": "Viết báo cáo tổng kết lễ giỗ gửi Ban Thường trực", "assignee": "Trọng Khải", "done": true},
     {"text": "Lập kế hoạch chi tiết 3 chuyến hành hương quý II", "assignee": "Lê Minh Tuấn", "done": false},
     {"text": "Đăng recap lễ giỗ (ảnh + video) lên app và mạng xã hội", "assignee": "Mỹ Linh", "done": false},
     {"text": "Cập nhật báo cáo tài chính tháng 3", "assignee": "Rosa Mai", "done": false}
   ]'::jsonb,
   now() - interval '60 days', now() - interval '60 days'),

  -- Họp tháng 4: Chuẩn bị hành hương tháng 5
  ('cc000001-0000-0000-0000-000000000004',
   'Họp chuẩn bị chuyến hành hương kỷ niệm 1 năm',
   '2026-04-18',
   'Loan (TB), Minh (PNV), Tài (TQ), Tuấn (BHH), Lan (BHH), Hải (BHH), Mai (BHH), Khải (BTT), Long (BTT)',
   '<h3>Nội dung cuộc họp</h3>
<p><strong>1. Chuẩn bị chuyến hành hương kỷ niệm tháng 5</strong></p>
<p>Chuyến hành hương tháng 5 là chuyến đặc biệt kỷ niệm 1 năm thành lập cộng đồng. Dự kiến 120–150 thành viên tham gia, kết hợp thánh lễ ngoài trời.</p>
<p><strong>2. Mở rộng mạng lưới CTV</strong></p>
<p>Ban Ngoại vụ báo cáo đã kết nối thêm 8 CTV mới tại TP.HCM, Cần Thơ và Đồng Nai. Kế hoạch tổ chức buổi giới thiệu online cho CTV vào cuối tháng 4.</p>
<p><strong>3. Kế hoạch nội dung tháng 5</strong></p>
<p>Ban Truyền thông trình bày kế hoạch: 3 bài/tuần, ưu tiên video ngắn giới thiệu chuyến hành hương kỷ niệm và hoạt động cộng đồng.</p>',
   '[
     {"text": "Mở form đăng ký hành hương kỷ niệm tháng 5 trên app", "assignee": "Rosa Mai", "done": true},
     {"text": "Liên hệ linh mục đồng hành cho thánh lễ ngoài trời", "assignee": "Gioan Dũng", "done": false},
     {"text": "Tổ chức buổi giới thiệu online cho CTV mới", "assignee": "Hương PNg", "done": false},
     {"text": "Sản xuất video teaser chuyến hành hương kỷ niệm", "assignee": "Mỹ Linh", "done": false},
     {"text": "Liên hệ đặt dịch vụ vận chuyển cho 150 người", "assignee": "Anna Lan", "done": false}
   ]'::jsonb,
   now() - interval '31 days', now() - interval '31 days'),

  -- Họp tháng 5: Sơ kết 5 tháng đầu năm
  ('cc000001-0000-0000-0000-000000000005',
   'Họp sơ kết 5 tháng đầu năm & Kế hoạch Đại Lễ',
   '2026-05-14',
   'Toàn thể Ban Quản Trị (14 thành viên)',
   '<h3>Nội dung cuộc họp</h3>
<p><strong>1. Sơ kết hoạt động 5 tháng đầu năm 2026</strong></p>
<p>Tổng số chuyến hành hương đã tổ chức: 4 chuyến, tổng lượt khách: 780 người. Tỷ lệ hài lòng qua khảo sát: 94%. Các buổi cầu nguyện được duy trì đều đặn, lượt xem livestream tăng 35% so với cùng kỳ.</p>
<p><strong>2. Tài chính 5 tháng đầu năm</strong></p>
<p>Tổng thu: 103.200.000 ₫. Tổng chi: 48.700.000 ₫. Số dư hiện tại: 54.500.000 ₫. Tình hình tài chính ổn định và minh bạch, được toàn ban thông qua.</p>
<p><strong>3. Chuẩn bị Đại Lễ Phong Chân Phước tháng 7/2026</strong></p>
<p>Ban Thường trực thông báo cộng đồng sẽ tổ chức hành hương đặc biệt nhân Đại Lễ. Giao Ban Hành hương xây dựng kế hoạch tổng thể trong tháng 6. Đây là sự kiện lớn nhất từ trước đến nay của cộng đồng — toàn ban cam kết dồn lực chuẩn bị.</p>',
   '[
     {"text": "Xây dựng kế hoạch tổng thể hành hương Đại Lễ tháng 7", "assignee": "Lê Minh Tuấn", "done": false},
     {"text": "Viết báo cáo sơ kết 5 tháng gửi toàn thể hội viên", "assignee": "Trọng Khải", "done": false},
     {"text": "Lên kế hoạch truyền thông tháng 6 hướng về Đại Lễ", "assignee": "Hồng Nhung", "done": false},
     {"text": "Cập nhật báo cáo tài chính sơ kết 5 tháng", "assignee": "Rosa Mai", "done": false}
   ]'::jsonb,
   now() - interval '5 days', now() - interval '5 days')

ON CONFLICT (id) DO NOTHING;


-- ── 3. THU CHI TÀI CHÍNH ─────────────────────────────────────────
-- 10 khoản thu + 3 khoản chi trong năm 2026

INSERT INTO bqt_finances
  (id, type, entry_date, amount, category, description, partner_name, created_at)
VALUES

  -- ── THU ──────────────────────────────────────────────────────────
  ('dd000001-0000-0000-0000-000000000001',
   'thu', '2026-01-05', 5000000, '', 'Hội viên đóng phí quản lý tháng 1', null, now()),

  ('dd000001-0000-0000-0000-000000000002',
   'thu', '2026-01-20', 12000000, '', 'Tài trợ thiết bị livestream từ nhóm ân nhân TP.HCM', null, now()),

  ('dd000001-0000-0000-0000-000000000003',
   'thu', '2026-02-03', 5000000, '', 'Hội viên đóng phí quản lý tháng 2', null, now()),

  ('dd000001-0000-0000-0000-000000000004',
   'thu', '2026-02-25', 18500000, '', 'Thu phí đăng ký hành hương đợt 1 tháng 3 (37 người)', null, now()),

  ('dd000001-0000-0000-0000-000000000005',
   'thu', '2026-03-12', 18700000, '', 'Quyên góp tại lễ giỗ Cha ngày 12–13/3/2026', null, now()),

  ('dd000001-0000-0000-0000-000000000006',
   'thu', '2026-03-28', 22000000, '', 'Thu phí đăng ký hành hương tháng 4 (44 người)', null, now()),

  ('dd000001-0000-0000-0000-000000000007',
   'thu', '2026-04-05', 5000000, '', 'Hội viên đóng phí quản lý tháng 4', null, now()),

  ('dd000001-0000-0000-0000-000000000008',
   'thu', '2026-04-18', 8000000, '', 'Tài trợ in ấn tài liệu hành hương kỷ niệm 1 năm', null, now()),

  ('dd000001-0000-0000-0000-000000000009',
   'thu', '2026-05-03', 25000000, '', 'Thu phí đăng ký hành hương kỷ niệm tháng 5 (50 người)', null, now()),

  ('dd000001-0000-0000-0000-000000000010',
   'thu', '2026-05-10', 4200000, '', 'Quyên góp trong các buổi cầu nguyện tháng 4–5', null, now()),

  -- ── CHI ──────────────────────────────────────────────────────────
  ('dd000002-0000-0000-0000-000000000001',
   'chi', '2026-03-07', 9200000, '', 'Chi tổ chức lễ giỗ Cha 12/3 (cơm đoàn, vật phẩm phụng vụ, in ấn)', null, now()),

  ('dd000002-0000-0000-0000-000000000002',
   'chi', '2026-03-15', 16800000, '', 'Chi vận chuyển và hậu cần hành hương đợt 1 tháng 3', null, now()),

  ('dd000002-0000-0000-0000-000000000003',
   'chi', '2026-04-22', 22500000, '', 'Chi vận chuyển, lưu trú và hậu cần hành hương tháng 4', null, now())

ON CONFLICT (id) DO NOTHING;
