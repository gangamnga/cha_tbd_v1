-- ─────────────────────────────────────────────────────────────────
-- HỒ SƠ TƯ LIỆU CHÍNH THỨC: TÂN CHÂN PHƯỚC PHANXICÔ TRƯƠNG BỬU DIỆP
-- Cập nhật Lược Sử, Phong Chân Phước, Phong Thánh và Hành Trình Đức Tin
-- Đã hiệu đính chính xác theo Văn thư công bố của Tòa Thánh & Giáo phận Cần Thơ
-- ─────────────────────────────────────────────────────────────────


-- ── 1. LƯỢC SỬ (bio_facts) ───────────────────────────────────────
TRUNCATE bio_facts;
INSERT INTO bio_facts (label, value, sort_order) VALUES
  ('Họ và tên',  'Trương Bửu Diệp',                                                                   1),
  ('Tên thánh',  'Phanxicô (Tên chính thức trong hồ sơ Giáo luật của HĐGMVN)',                               2),
  ('Ngày sinh',  '01/01/1897 — Rửa tội: 02/02/1897',                                                   3),
  ('Quê quán',   'Họ đạo Cồn Phước, làng Tấn Đức (nay: xã Long Kiến, huyện Chợ Mới, tỉnh An Giang)',                 4),
  ('Thân phụ',   'Ông Micae Trương Văn Đặng (1860–1935)',                                              5),
  ('Thân mẫu',   'Bà Lucia Lê Thị Thanh (1862–1904)',                                                  6),
  ('Thụ phong',  '1924 tại Đền thờ Ngã Ba sông Phnom Penh, Campuchia',                                      7),
  ('Mục vụ',     'Cha sở Giáo xứ Tắc Sậy (1930–1946)',                                                8),
  ('Tử đạo',     '12/03/1946 tại Cây Gừa (Bạc Liêu cũ) — Hy sinh để bảo vệ đàn chiên',                    9),
  ('Tôn hiệu',   'Chân phước (Á thánh) — Sắc lệnh Tòa Thánh công nhận tử đạo ký ngày 25/11/2024',              10),
  ('Lễ kính',    'Ngày 12 tháng 3 hằng năm (Được phép cử hành phụng vụ từ sau ngày 03/07/2026)',              11);


-- ── 2. PHONG CHÂN PHƯỚC – CÁC GIAI ĐOẠN (beatification_steps) ──
TRUNCATE beatification_steps;
INSERT INTO beatification_steps (year, title, detail, done, highlight, sort_order) VALUES
  ('1997', 'Khởi sự thu thập tư liệu',
   'Giáo phận Cần Thơ bắt đầu các bước sơ khởi, thu thập chứng cứ và lời chứng của các nhân chứng lịch sử về cuộc đời Cha Trương Bửu Diệp.',
   true, false, 1),
  ('2012', 'Tòa Thánh phê chuẩn mở án điều tra',
   'Bộ Tuyên Thánh ban hành văn thư "Nihil Obstat" (Không có gì ngăn trở). Vụ án phong thánh chính thức được mở ở cấp Tòa Thánh, ngài nhận tôn hiệu Tôi tớ Chúa.',
   true, false, 2),
  ('2014', 'Bế mạc cấp Giáo phận & Chuyển hồ sơ về Roma',
   'Giáo phận Cần Thơ hoàn tất thu thập chứng từ, niêm phong và chuyển giao toàn bộ hồ sơ gốc sang Bộ Tuyên Thánh tại Vatican để bước vào giai đoạn Thẩm định Trung ương.',
   true, false, 3),
  ('25/11/2024', 'Đức Thánh Cha phê chuẩn sắc lệnh Tử Đạo',
   'Trong cuộc tiếp kiến Tổng trưởng Bộ Phong Thánh, Đức Giáo Hoàng đã chính thức phê chuẩn sắc lệnh nhìn nhận ơn tử đạo vì sự căm thù đức tin của Tôi tớ Chúa Phanxicô Trương Bửu Diệp.',
   true, true, 4),
  ('02/07/2026', 'Đại lễ Tuyên phong Chân phước',
   'Thánh lễ tôn phong Chân phước chính thức được cử hành tại Trung tâm Hành hương Tắc Sậy, do Đức Hồng y Luis Antonio Tagle (Đại diện Đức Thánh Cha) chủ sự trước hàng triệu tín hữu.',
   true, true, 5);


-- ── 3. TIẾN TRÌNH PHONG THÁNH (canonization_steps) ────────────
TRUNCATE canonization_steps;
INSERT INTO canonization_steps (year, title, detail, done, highlight, sort_order) VALUES
  ('2026+', 'Khởi động tiến trình xin phong Hiển Thánh',
   'Sau đại lễ phong Chân phước, hồ sơ mục vụ của Tân Chân phước Phanxicô Trương Bửu Diệp tiếp tục chuyển sang giai đoạn theo dõi để hướng tới bậc Hiển thánh toàn cầu.',
   false, false, 1),
  ('TBD', 'Điều tra và phê chuẩn phép lạ thứ hai',
   'Theo giáo luật, cần có thêm một phép lạ y khoa được Hội đồng Y khoa và Thần học Vatican thẩm định, xảy ra sau mốc phong Chân phước nhờ lời cầu bầu của ngài.',
   false, false, 2),
  ('TBD', 'Đức Thánh Cha ban sắc lệnh phong Thánh',
   'Đức Giáo Hoàng phê chuẩn phép lạ thứ hai và ký sắc lệnh tuyên phong hiển thánh.',
   false, false, 3),
  ('TBD', 'Đại lễ phong Hiển Thánh (Canonization)',
   'Đức Thánh Cha chủ sự đại lễ suy tôn Chân phước Phanxicô Trương Bửu Diệp lên bậc Hiển thánh (Bậc Thánh toàn cầu, ghi danh vào Lịch Phụng vụ chung).',
   false, true, 4);


-- ── 4. HÀNH TRÌNH ĐỨC TIN (biography_milestones) — 16 mốc cuộc đời hoàn chỉnh ────────
TRUNCATE biography_milestones;
INSERT INTO biography_milestones (year, title, description, sort_order) VALUES
  ('1897', 'Chào đời và nhận Bí tích Rửa Tội',
   'Cậu bé Phanxicô Trương Bửu Diệp sinh ngày 01/01/1897 tại Họ đạo Cồn Phước, làng Tấn Đức (nay thuộc xã Long Kiến, huyện Chợ Mới, tỉnh An Giang). Ngài được chịu Phép Rửa Tội sau đó vào ngày 02/02/1897.',
   1),

  ('1904', 'Biến cố tuổi thơ và rời quê hương',
   'Thân mẫu là bà Lucia Lê Thị Thanh qua đời khi ngài mới 7 tuổi. Sau đó, thân phụ là ông Micae Trương Văn Đặng dời nhà sang Battambang (Campuchia) làm nghề mộc để mưu sinh và nuôi con.',
   2),

  ('1909', 'Nhập Tiểu chủng viện Cù Lao Giêng',
   'Nhận thấy mầm non ơn gọi nơi ngài, Cha sở họ đạo đã hướng dẫn ngài trở về Việt Nam, nhập học tại Tiểu chủng viện Cù Lao Giêng (An Giang) năm 12 tuổi để bắt đầu con đường tu học.',
   3),

  ('1916', 'Học Đại chủng viện Phnom Penh',
   'Sau khi mãn khóa tại Tiểu chủng viện, thầy Phanxicô Trương Bửu Diệp được cử sang học Triết học và Thần học tại Đại chủng viện Phnom Penh (Campuchia) – trung tâm đào tạo giáo sĩ của vùng thời bấy giờ.',
   4),

  ('1924', 'Thụ phong Linh mục',
   'Ngày 31/08/1924, thầy Phanxicô Trương Bửu Diệp lãnh nhận Thiên chức Linh mục tại Đền thờ Ngã Ba Sông Phnom Penh, do Đức cha Jean-Baptiste Chabalier (Đức giám mục đại diện tông tòa Cao Miên) đặt tay tôn phong.',
   5),

  ('1924', 'Sứ vụ đầu đời tại Họ đạo Hố Trư',
   'Cha mới Phanxicô được bổ nhiệm làm Cha phó họ đạo Hố Trư (Ploutrey) thuộc tỉnh Kandal, Campuchia, chăm sóc mục vụ và nâng đỡ đời sống đức tin cho cộng đồng kiều bào người Việt sinh sống tại đây.',
   6),

  ('1927', 'Làm Giáo sư Tiểu chủng viện Cù Lao Giêng',
   'Bề trên gọi ngài trở lại Việt Nam để đảm nhiệm vai trò Giáo sư tại Tiểu chủng viện Cù Lao Giêng. Ngài đồng hành, giảng dạy và huấn luyện nhân bản cho các thế hệ chủng sinh tương lai trong 2 năm.',
   7),

  ('1930', 'Chính thức nhận nhiệm sở tại Tắc Sậy',
   'Tháng 3 năm 1930, Cha sở Phanxicô Trương Bửu Diệp chính thức về nhận nhiệm sở tại Họ đạo Tắc Sậy (Bạc Liêu). Từ trung tâm này, ngài dấn thân đi xuồng ghe dốc lòng mở rộng và thành lập thêm nhiều họ đạo phụ cận như Khúc Tréo, Bà Đốc, Cam Bô, An Hải, Đầu Sấu...',
   8),

  ('1945', 'Kiên vững ở lại bảo vệ đoàn chiên',
   'Chiến tranh loạn lạc, nhiều người khuyên ngài di tản lên Bạc Liêu hoặc lánh sang nơi an toàn để bảo toàn mạng sống. Ngài từ chối và để lại câu nói bất hủ: "Tôi sống giữa đàn chiên và nếu có chết cũng chết giữa đàn chiên."',
   9),

  ('1946', 'Tử đạo và hiến dâng mạng sống',
   'Ngày 12/03/1946, ngài cùng hơn 70 giáo dân bị một lực lượng vũ trang bắt giam tại lẫm lúa nhà ông Giáo Sự ở Cây Gừa. Cha Diệp đã chủ động gặp những người cầm đầu, tự nguyện nộp mạng sống mình để đổi lấy sự tự do cho toàn bộ giáo dân. Ngài bị sát hại âm thầm ngay trong ngày hôm đó.',
   10),

  ('1946', 'An táng tại Khúc Tréo và cải táng về Tắc Sậy',
   'Sau khi tìm thấy thi thể ngài dưới ao trong tư thế chắp tay cầu nguyện, giáo dân rước ngài về chôn cất tạm tại phòng thánh Nhà thờ Khúc Tréo. Đến năm 1969, hài cốt của ngài mới được bốc dỡ và cải táng di dời về lại Nhà thờ Tắc Sậy cho đến nay.',
   11),

  ('1997', 'Giáo phận khởi sự thu thập hồ sơ',
   'Đúng 51 năm sau ngày ngài qua đời, trước làn sóng tín hữu đổ về Tắc Sậy kính viếng ngày một đông, Giáo phận Cần Thơ bắt đầu các bước thu thập chứng cứ, lời chứng lịch sử để chuẩn bị hồ sơ xin phong thánh.',
   12),

  ('2012', 'Tòa Thánh phê chuẩn danh hiệu "Tôi tớ Chúa"',
   'Ngày 31/10/2012, Bộ Tuyên Thánh tại Vatican ban hành sắc lệnh "Nihil Obstat", chính thức cho phép mở cuộc điều tra quy mô lớn ở cấp Trung ương đối với hồ sơ của ngài.',
   13),

  ('2014', 'Bế mạc cấp Giáo phận và chuyển hồ sơ về Roma',
   'Toàn bộ tài liệu chứng từ dài hàng ngàn trang được hoàn tất. Giáo phận Cần Thơ cử hành thánh lễ bế mạc giai đoạn điều tra diocesan, đóng ấn niêm phong và chuyển giao toàn bộ hồ sơ gốc sang Vatican.',
   14),

  ('25/11/2024', 'Đức Thánh Cha công nhận ơn Tử Đạo',
   'Đức Giáo Hoàng chính thức ký sắc lệnh nhìn nhận ơn tử đạo của Cha Phanxicô Trương Bửu Diệp (bị sát hại vì lòng căm thù đức tin), dọn đường thẳng tiến đến việc tuyên phong Chân phước mà không cần điều tra một phép lạ y khoa trước đó.',
   15),

  ('02/07/2026', 'Đại lễ tôn phong Chân phước tại Tắc Sậy',
   'Đáp ứng văn thư chuẩn y từ Văn phòng Cáo thỉnh Roma, Giáo hội Việt Nam long trọng tổ chức Thánh lễ Tuyên phong Chân phước cho Đấng Đáng kính Phanxicô Trương Bửu Diệp tại Trung tâm Hành hương Tắc Sậy, ghi dấu ấn một mốc son lịch sử vĩ đại.',
   16);
