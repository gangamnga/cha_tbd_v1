-- ================================================================
-- SEED LỜI CHỨNG MẪU — Chạy độc lập, không ảnh hưởng dữ liệu khác
-- Chạy trong Supabase Dashboard > SQL Editor
-- ================================================================

TRUNCATE testimonies RESTART IDENTITY CASCADE;

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
