-- ================================================================
-- CẬP NHẬT ẢNH BÌA cho bài viết Nhật ký chứng nhân (loi-chung)
-- Chạy trong Supabase Dashboard > SQL Editor
-- ================================================================

-- 1. Cha Diệp chữa lành cho con trai tôi (Chữa bệnh)
UPDATE articles SET thumbnail_url = 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&q=80'
WHERE id = '33333333-0000-0000-0000-000000000001';

-- 2. Nhờ Cha Diệp, gia đình con được bình an (Gia đình)
UPDATE articles SET thumbnail_url = 'https://picsum.photos/seed/giadinh-binhan/800/450'
WHERE id = '33333333-0000-0000-0000-000000000002';

-- 3. Thi đậu đại học nhờ cầu nguyện cùng Cha Diệp (Học tập)
UPDATE articles SET thumbnail_url = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80'
WHERE id = '33333333-0000-0000-0000-000000000003';

-- 4. Cha Diệp phù hộ qua tai nạn giao thông (Hành trình)
UPDATE articles SET thumbnail_url = 'https://images.unsplash.com/photo-1468818438311-4bab781ab9b8?w=800&q=80'
WHERE id = '33333333-0000-0000-0000-000000000004';

-- 5. Tìm được việc làm tốt nhờ Cha Diệp (Nghề nghiệp)
UPDATE articles SET thumbnail_url = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80'
WHERE id = '33333333-0000-0000-0000-000000000005';

-- 6. Hôn nhân được hàn gắn nhờ Cha Diệp (Vợ chồng)
UPDATE articles SET thumbnail_url = 'https://picsum.photos/seed/honnhan-hangan/800/450'
WHERE id = '33333333-0000-0000-0000-000000000006';

-- 7. Con được cứu sống nhờ ơn Cha Diệp (Trẻ em)
UPDATE articles SET thumbnail_url = 'https://picsum.photos/seed/treem-cuusong/800/450'
WHERE id = '33333333-0000-0000-0000-000000000007';

-- 8. Mẹ ung thư giai đoạn cuối được chữa lành (Hy vọng)
UPDATE articles SET thumbnail_url = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80'
WHERE id = '33333333-0000-0000-0000-000000000008';

-- 9. Người thân quay lại đạo nhờ Cha Diệp (Nhà thờ)
UPDATE articles SET thumbnail_url = 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&q=80'
WHERE id = '33333333-0000-0000-0000-000000000009';

-- 10. Vượt qua khủng hoảng tâm lý nhờ Cha Diệp (Thiên nhiên bình an)
UPDATE articles SET thumbnail_url = 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80'
WHERE id = '33333333-0000-0000-0000-000000000010';

-- 11. Bài tạo từ testimony publish (theo slug)
UPDATE articles SET thumbnail_url = 'https://picsum.photos/seed/ungthuchualanhontac/800/450'
WHERE slug = 'loi-chung-7f5612c095';

-- Fallback: bắt tất cả bài loi-chung còn thiếu ảnh hoặc URL bị lỗi cũ
UPDATE articles
SET thumbnail_url = 'https://picsum.photos/seed/loichung-default/800/450'
WHERE category = 'loi-chung'
  AND status = 'published'
  AND thumbnail_url NOT LIKE 'https://%';
