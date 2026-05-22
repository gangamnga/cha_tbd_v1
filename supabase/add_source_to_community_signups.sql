-- Thêm cột source để phân loại nguồn đăng ký cộng đồng
ALTER TABLE community_signups
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'khac';

-- Index để query nhanh theo source
CREATE INDEX IF NOT EXISTS idx_community_signups_source
  ON community_signups (source);

-- Các giá trị hợp lệ: 'hanh-huong', 'internet', 'y-chi', 'loi-chung', 'khac'
