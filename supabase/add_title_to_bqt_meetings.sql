-- Thêm cột tiêu đề cuộc họp cho bảng bqt_meetings
ALTER TABLE bqt_meetings
  ADD COLUMN IF NOT EXISTS title text;
