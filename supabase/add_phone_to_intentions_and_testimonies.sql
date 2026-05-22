-- Thêm cột số điện thoại cho người gửi ý chỉ cầu nguyện và lời chứng
ALTER TABLE prayer_intentions
  ADD COLUMN IF NOT EXISTS phone text;

ALTER TABLE testimonies
  ADD COLUMN IF NOT EXISTS phone text;
