-- Cập nhật bảng notifications để thêm type cho comments
ALTER TABLE notifications 
MODIFY COLUMN type ENUM('new_chapter', 'comic_completed', 'new_comment', 'comment_liked') NOT NULL;

-- Cho phép comic_id có thể NULL (vì comment có thể ở chapter)
ALTER TABLE notifications 
MODIFY COLUMN comic_id INT DEFAULT NULL;

