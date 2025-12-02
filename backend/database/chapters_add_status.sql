-- Thêm trường status vào bảng chapters
ALTER TABLE chapters 
ADD COLUMN status ENUM('open', 'closed') DEFAULT 'open' AFTER views;

-- Cập nhật tất cả các chương hiện có thành 'open'
UPDATE chapters SET status = 'open' WHERE status IS NULL;

