-- ================================================================
-- SEED: Cùng Cầu Nguyện — Dữ liệu mẫu
-- Gồm: 2 thông báo, 15 ý chỉ, 9 lời kinh, 13 thánh ca
-- Chạy trong Supabase Dashboard > SQL Editor
-- ON CONFLICT DO NOTHING — an toàn khi chạy lại
-- ================================================================


-- ── 1. THÔNG BÁO (announcements) ──────────────────────────────
-- Xoá thông báo cũ nếu có trước khi chèn mới
DELETE FROM announcements WHERE id IN (
  'cccccccc-0000-0000-0000-000000000001',
  'cccccccc-0000-0000-0000-000000000002'
);

INSERT INTO announcements (id, image_url, is_active, content_html) VALUES

  ('cccccccc-0000-0000-0000-000000000001',
   'https://picsum.photos/seed/thongbao-dailephong/600/800',
   true, ''),

  ('cccccccc-0000-0000-0000-000000000002',
   'https://picsum.photos/seed/thongbao-hanhhuong/600/800',
   false, '');


-- ── 2. CHỦ ĐỀ LỜI KINH (bổ sung nếu chưa có) ────────────────
INSERT INTO prayer_themes (id, label, sort_order) VALUES
  ('theme-benhnan',        'Cầu bệnh nhân',          1),
  ('theme-giadia',         'Cầu gia đình',            2),
  ('theme-nghenghiep',     'Cầu ơn nghề nghiệp',     3),
  ('theme-hochanh',        'Cầu ơn học hành',         4),
  ('theme-binhan',         'Cầu bình an',             5),
  ('theme-phongchanphuoc', 'Cầu phong chân phước',    6)
ON CONFLICT (id) DO NOTHING;


-- ── 3. LỜI KINH — 3 bài bổ sung (đã có 6, thêm đủ 9) ────────
INSERT INTO prayers (id, title, content, themes, sort_order, is_active) VALUES

  ('aaaaaaaa-0000-0000-0000-000000000007',
   'Kinh Lạy Cha',
   E'Lạy Cha chúng con ở trên trời,\nChúng con nguyện danh Cha cả sáng,\nnước Cha trị đến,\ný Cha thể hiện dưới đất cũng như trên trời.\n\nXin Cha cho chúng con hôm nay lương thực hàng ngày,\nVà tha nợ chúng con,\nnhư chúng con cũng tha kẻ có nợ chúng con.\n\nXin chớ để chúng con sa chước cám dỗ,\nnhưng cứu chúng con cho khỏi sự dữ.\n\nAmen.',
   ARRAY['theme-binhan'], 7, true),

  ('aaaaaaaa-0000-0000-0000-000000000008',
   'Kinh Kính Mừng',
   E'Kính mừng Maria đầy ơn phúc,\nĐức Chúa Trời ở cùng Bà,\nBà có phúc lạ hơn mọi người nữ,\nvà Giêsu con lòng Bà gồm phúc lạ.\n\nThánh Maria, Đức Mẹ Chúa Trời,\ncầu cho chúng con là kẻ có tội,\nkhi nay và trong giờ lâm tử.\n\nAmen.',
   ARRAY['theme-binhan', 'theme-phongchanphuoc'], 8, true),

  ('aaaaaaaa-0000-0000-0000-000000000009',
   'Kinh Cầu Ơn Nghề Nghiệp',
   E'Lạy Chúa là nguồn mọi ơn lành,\n\nChúng con cảm tạ Chúa đã ban cho chúng con công việc để mưu sinh và phục vụ tha nhân.\n\nXin Chúa chúc lành cho công việc của chúng con hằng ngày, ban cho chúng con sức khỏe, trí tuệ và sự kiên nhẫn để hoàn thành tốt bổn phận.\n\nXin giúp chúng con làm việc với lòng ngay thẳng, không tham lam và luôn tôn trọng phẩm giá người khác.\n\nNhờ lời chuyển cầu của Cha Phanxicô Xaviê Trương Bửu Diệp, xin Chúa ban ơn cho chúng con trong công việc.\n\nAmen.',
   ARRAY['theme-nghenghiep'], 9, true)

ON CONFLICT (id) DO NOTHING;


-- ── 4. ALBUM THÁNH CA (bổ sung nếu chưa có) ──────────────────
INSERT INTO hymn_playlists (id, label, sort_order) VALUES
  ('playlist-hanh-huong', 'Hành hương Tắc Sậy', 1),
  ('playlist-kinh-sang',  'Kinh sáng / Kinh tối', 2),
  ('playlist-mua-chay',   'Mùa Chay', 3)
ON CONFLICT (id) DO NOTHING;


-- ── 5. THÁNH CA — 7 bài bổ sung (đã có 6, thêm đủ 13) ───────
INSERT INTO hymns (id, title, artist, youtube_url, image_url, playlists, sort_order, is_active) VALUES

  ('bbbbbbbb-0000-0000-0000-000000000007',
   'Kinh Sáng Dâng Ngày',
   'Ca đoàn Tắc Sậy',
   null,
   'https://picsum.photos/seed/kinhhsang-danggay/400/300',
   ARRAY['playlist-kinh-sang'], 7, true),

  ('bbbbbbbb-0000-0000-0000-000000000008',
   'Kinh Tối Tạ Ơn',
   'Lm. Thái Nguyên',
   null,
   'https://picsum.photos/seed/kinhhtoi-taon/400/300',
   ARRAY['playlist-kinh-sang'], 8, true),

  ('bbbbbbbb-0000-0000-0000-000000000009',
   'Kinh Truyền Tin',
   'Ca đoàn Hiệp Nhất',
   null,
   'https://picsum.photos/seed/kinhtruyen-tin/400/300',
   ARRAY['playlist-kinh-sang'], 9, true),

  ('bbbbbbbb-0000-0000-0000-000000000010',
   'Đường Thánh Giá',
   'Lm. Nguyễn Duy',
   null,
   'https://picsum.photos/seed/duong-thanhgia/400/300',
   ARRAY['playlist-mua-chay'], 10, true),

  ('bbbbbbbb-0000-0000-0000-000000000011',
   'Lạy Cha Thương Xót',
   'Nhóm Cung Thánh Bạc Liêu',
   null,
   'https://picsum.photos/seed/laycha-thuongxot/400/300',
   ARRAY['playlist-mua-chay'], 11, true),

  ('bbbbbbbb-0000-0000-0000-000000000012',
   'Thánh Ca Mùa Chay – Về Với Cha',
   'Ca đoàn Thánh Phanxicô',
   null,
   'https://picsum.photos/seed/muachay-vevoicha/400/300',
   ARRAY['playlist-mua-chay'], 12, true),

  ('bbbbbbbb-0000-0000-0000-000000000013',
   'Hành Hương Về Tắc Sậy',
   'Đức Quang & Ca đoàn',
   null,
   'https://picsum.photos/seed/hanhhuong-tacsay/400/300',
   ARRAY['playlist-hanh-huong'], 13, true)

ON CONFLICT (id) DO NOTHING;


-- ── 6. Ý CHỈ CẦU NGUYỆN (15 mẫu) ─────────────────────────────
DELETE FROM prayer_intentions WHERE id IN (
  'dddddddd-0000-0000-0000-000000000001',
  'dddddddd-0000-0000-0000-000000000002',
  'dddddddd-0000-0000-0000-000000000003',
  'dddddddd-0000-0000-0000-000000000004',
  'dddddddd-0000-0000-0000-000000000005',
  'dddddddd-0000-0000-0000-000000000006',
  'dddddddd-0000-0000-0000-000000000007',
  'dddddddd-0000-0000-0000-000000000008',
  'dddddddd-0000-0000-0000-000000000009',
  'dddddddd-0000-0000-0000-000000000010',
  'dddddddd-0000-0000-0000-000000000011',
  'dddddddd-0000-0000-0000-000000000012',
  'dddddddd-0000-0000-0000-000000000013',
  'dddddddd-0000-0000-0000-000000000014',
  'dddddddd-0000-0000-0000-000000000015'
);

INSERT INTO prayer_intentions (id, name, location, categories, content, status, created_at) VALUES

  ('dddddddd-0000-0000-0000-000000000001',
   'Maria Nguyễn Thị Lan',
   'TP. Hồ Chí Minh',
   ARRAY['Bệnh tật & chữa lành'],
   'Kính xin Cha Trương Bửu Diệp chuyển cầu cho mẹ tôi đang bệnh nặng tại bệnh viện Chợ Rẫy, xin Chúa ban ơn chữa lành và sức mạnh cho cả gia đình.',
   'pending', now() - interval '1 day'),

  ('dddddddd-0000-0000-0000-000000000002',
   'Giuse Trần Văn Minh',
   'Bạc Liêu',
   ARRAY['Gia đình & hôn nhân'],
   'Xin cầu nguyện cho gia đình con đang gặp nhiều khó khăn, vợ chồng thường xuyên xung đột. Xin Cha Diệp cầu bầu cho gia đình con được bình an và yêu thương.',
   'pending', now() - interval '2 days'),

  ('dddddddd-0000-0000-0000-000000000003',
   'Anna Lê Thị Hoa',
   'Cần Thơ',
   ARRAY['Học hành & thi cử'],
   'Con sắp thi đại học. Xin Cha Diệp cầu cho con được bình tĩnh, nhớ bài và đạt kết quả tốt để không phụ lòng cha mẹ.',
   'pending', now() - interval '3 days'),

  ('dddddddd-0000-0000-0000-000000000004',
   'Têrêsa Phạm Thị Thu',
   'Cà Mau',
   ARRAY['Công việc & nghề nghiệp'],
   'Kính xin các lời cầu nguyện cho tôi đang tìm việc làm sau 3 tháng thất nghiệp. Gia đình tôi rất khó khăn, hai con nhỏ cần nuôi dưỡng.',
   'pending', now() - interval '4 days'),

  ('dddddddd-0000-0000-0000-000000000005',
   'Gioan Võ Văn Thành',
   'Sóc Trăng',
   ARRAY['Bệnh tật & chữa lành', 'Tâm hồn & hoán cải'],
   'Xin cầu cho người bạn thân của tôi đang điều trị ung thư giai đoạn 2. Anh ấy chưa biết Chúa, xin Cha Diệp cầu cho anh nhận ra tình yêu Chúa.',
   'pending', now() - interval '5 days'),

  ('dddddddd-0000-0000-0000-000000000006',
   'Catarina Nguyễn Thị Bích',
   'Kiên Giang',
   ARRAY['Tài chính & kinh tế'],
   'Gia đình tôi vừa trải qua vụ mất mùa lớn, nợ nần chồng chất. Xin Cha Diệp cầu bầu cùng Chúa để chúng tôi vượt qua giai đoạn khó khăn này.',
   'pending', now() - interval '6 days'),

  ('dddddddd-0000-0000-0000-000000000007',
   'Phaolô Huỳnh Văn Nam',
   'Đồng Nai',
   ARRAY['Hành trình đức tin', 'Tâm hồn & hoán cải'],
   'Xin cầu cho anh trai tôi đã bỏ đạo 10 năm nay. Mẹ tôi ngày nào cũng khóc vì anh. Xin Cha Diệp cầu để anh tìm lại con đường về với Chúa.',
   'pending', now() - interval '7 days'),

  ('dddddddd-0000-0000-0000-000000000008',
   'Maria Trần Thị Ngọc',
   'Hà Nội',
   ARRAY['Gia đình & hôn nhân'],
   'Tôi chuẩn bị kết hôn vào tháng tới. Xin Cha Diệp cầu cho đôi chúng tôi được Chúa chúc lành, xây dựng gia đình thánh thiện và hạnh phúc bền lâu.',
   'pending', now() - interval '8 days'),

  ('dddddddd-0000-0000-0000-000000000009',
   null,
   'Hậu Giang',
   ARRAY['Người đã qua đời'],
   'Xin cầu cho linh hồn cha tôi vừa mất tuần trước. Ông sống đời sống đức tin trọn vẹn và luôn yêu mến Cha Trương Bửu Diệp. Xin Chúa thương đón nhận linh hồn ông.',
   'pending', now() - interval '9 days'),

  ('dddddddd-0000-0000-0000-000000000010',
   'Bernadette Lý Thị Kim',
   'Tiền Giang',
   ARRAY['Tai nạn & hiểm nguy'],
   'Con trai tôi vừa gặp tai nạn giao thông, đang nằm ICU. Xin toàn thể cộng đồng và Cha Diệp cầu nguyện cho con tôi qua khỏi nguy hiểm.',
   'pending', now() - interval '10 days'),

  -- 5 ý chỉ đã được cầu nguyện
  ('dddddddd-0000-0000-0000-000000000011',
   'Stêphanô Bùi Văn Long',
   'Vĩnh Long',
   ARRAY['Bệnh tật & chữa lành'],
   'Xin cầu cho tôi trước ca phẫu thuật tim vào tuần tới. Tôi rất sợ nhưng tôi tin tưởng vào Cha Diệp và lòng thương xót Chúa.',
   'prayed', now() - interval '15 days'),

  ('dddddddd-0000-0000-0000-000000000012',
   'Maria Đặng Thị Lan Anh',
   'Bến Tre',
   ARRAY['Học hành & thi cử', 'Tâm hồn & hoán cải'],
   'Cầu cho con gái tôi đang du học nước ngoài, xa nhà cô bé hay buồn và sao nhãng đức tin. Xin Cha Diệp cầu bầu cho con bé luôn gần Chúa.',
   'prayed', now() - interval '18 days'),

  ('dddddddd-0000-0000-0000-000000000013',
   'Giuse Phan Văn Đức',
   'Trà Vinh',
   ARRAY['Công việc & nghề nghiệp', 'Tài chính & kinh tế'],
   'Xin cầu cho công ty chúng tôi đang gặp khó khăn tài chính. Có 20 nhân viên phụ thuộc vào công ty, xin Chúa mở đường cho chúng tôi.',
   'prayed', now() - interval '20 days'),

  ('dddddddd-0000-0000-0000-000000000014',
   'Anê Nguyễn Thị Mỹ Duyên',
   'Long An',
   ARRAY['Ơn gọi & đời tu'],
   'Xin cầu cho em tôi đang phân vân về ơn gọi tu trì. Em có lòng đạo đức và muốn dâng mình cho Chúa nhưng còn sợ. Xin Cha Diệp soi sáng cho em.',
   'prayed', now() - interval '22 days'),

  ('dddddddd-0000-0000-0000-000000000015',
   null,
   'An Giang',
   ARRAY['Định cư & di dân'],
   'Gia đình tôi đang làm thủ tục định cư nước ngoài để đoàn tụ với con cái. Hồ sơ bị từ chối nhiều lần. Xin Cha Diệp cầu bầu để hồ sơ lần này được chấp thuận.',
   'prayed', now() - interval '25 days');
