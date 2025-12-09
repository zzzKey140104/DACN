-- =====================================================
-- COMPLETE DATABASE SCHEMA
-- File này gộp tất cả các migration SQL thành một file duy nhất
-- =====================================================

-- =====================================================
-- PHẦN 1: TẠO DATABASE VÀ SCHEMA CƠ BẢN
-- =====================================================

-- Tạo database
CREATE DATABASE IF NOT EXISTS truyen_gg_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE truyen_gg_db;

-- Bảng users (người dùng)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NULL, -- Cho phép NULL cho Google OAuth accounts
    avatar VARCHAR(500) DEFAULT NULL,
    role ENUM('reader', 'vip', 'admin') DEFAULT 'reader',
    account_status ENUM('active', 'locked', 'banned') DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255) DEFAULT NULL,
    password_reset_token VARCHAR(255) DEFAULT NULL,
    password_reset_expires DATETIME DEFAULT NULL,
    google_id VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email_verification_token (email_verification_token),
    INDEX idx_password_reset_token (password_reset_token),
    INDEX idx_google_id (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng countries (quốc gia)
CREATE TABLE IF NOT EXISTS countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng comics (truyện)
CREATE TABLE IF NOT EXISTS comics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    author VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    cover_image VARCHAR(500) DEFAULT NULL,
    status ENUM('ongoing', 'completed') DEFAULT 'ongoing',
    access_status ENUM('open', 'closed', 'vip') DEFAULT 'open',
    country_id INT DEFAULT NULL,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    follows INT DEFAULT 0,
    total_chapters INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_views (views),
    INDEX idx_updated_at (updated_at),
    INDEX idx_status (status),
    INDEX idx_country_id (country_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng chapters (chương)
CREATE TABLE IF NOT EXISTS chapters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comic_id INT NOT NULL,
    chapter_number INT NOT NULL,
    title VARCHAR(255) DEFAULT NULL,
    content TEXT DEFAULT NULL,
    images JSON DEFAULT NULL,
    views INT DEFAULT 0,
    status ENUM('open', 'closed', 'vip') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE,
    UNIQUE KEY unique_comic_chapter (comic_id, chapter_number),
    INDEX idx_comic_id (comic_id),
    INDEX idx_chapter_number (chapter_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng categories (thể loại)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng comic_categories (quan hệ nhiều-nhiều giữa truyện và thể loại)
CREATE TABLE IF NOT EXISTS comic_categories (
    comic_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (comic_id, category_id),
    FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng favorites (theo dõi)
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    comic_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_comic (user_id, comic_id),
    INDEX idx_user_id (user_id),
    INDEX idx_comic_id (comic_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng likes (thích)
CREATE TABLE IF NOT EXISTS likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    comic_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_comic_like (user_id, comic_id),
    INDEX idx_user_id (user_id),
    INDEX idx_comic_id (comic_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng reading_history (lịch sử đọc)
CREATE TABLE IF NOT EXISTS reading_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    comic_id INT NOT NULL,
    chapter_id INT NOT NULL,
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_comic_history (user_id, comic_id),
    INDEX idx_user_id (user_id),
    INDEX idx_comic_id (comic_id),
    INDEX idx_last_read_at (last_read_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PHẦN 2: BẢNG COMMENTS (BÌNH LUẬN)
-- =====================================================

-- Bảng comments (bình luận)
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    comic_id INT DEFAULT NULL,
    chapter_id INT DEFAULT NULL,
    parent_id INT DEFAULT NULL COMMENT 'ID của comment cha (nếu là reply)',
    content TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_comic_id (comic_id),
    INDEX idx_chapter_id (chapter_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_created_at (created_at),
    INDEX idx_likes_count (likes_count),
    CHECK ((comic_id IS NOT NULL AND chapter_id IS NULL) OR (comic_id IS NULL AND chapter_id IS NOT NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng comment_likes (thích bình luận)
CREATE TABLE IF NOT EXISTS comment_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    comment_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_comment_like (user_id, comment_id),
    INDEX idx_user_id (user_id),
    INDEX idx_comment_id (comment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PHẦN 3: BẢNG NOTIFICATIONS (THÔNG BÁO)
-- =====================================================

-- Bảng notifications (thông báo)
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    comic_id INT DEFAULT NULL,
    type ENUM('new_chapter', 'comic_completed', 'new_comment', 'comment_liked') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    chapter_id INT DEFAULT NULL,
    chapter_number INT DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PHẦN 4: BẢNG PAYMENTS (THANH TOÁN)
-- =====================================================

-- Bảng payments (thanh toán)
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_id VARCHAR(100) NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'success', 'failed', 'expired') DEFAULT 'pending',
    payment_type ENUM('vip_upgrade') DEFAULT 'vip_upgrade',
    qr_code_url TEXT,
    qr_code_data TEXT,
    momo_transaction_id VARCHAR(100) DEFAULT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_order_id (order_id),
    INDEX idx_status (status),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PHẦN 5: DỮ LIỆU MẪU
-- =====================================================

-- Insert dữ liệu mẫu cho countries
INSERT INTO countries (name, slug) VALUES
('Nhật Bản', 'nhat-ban'),
('Hàn Quốc', 'han-quoc'),
('Trung Quốc', 'trung-quoc'),
('Việt Nam', 'viet-nam'),
('Mỹ', 'my')
ON DUPLICATE KEY UPDATE name=name;

-- Insert dữ liệu mẫu cho categories
INSERT INTO categories (name, slug) VALUES
('Hành động', 'hanh-dong'),
('Tình cảm', 'tinh-cam'),
('Hài hước', 'hai-huoc'),
('Kinh dị', 'kinh-di'),
('Phiêu lưu', 'phieu-luu'),
('Siêu nhiên', 'sieu-nhien'),
('Đời thường', 'doi-thuong'),
('Học đường', 'hoc-duong'),
('Fantasy', 'fantasy'),
('Romance', 'romance'),
('Comedy', 'comedy'),
('Drama', 'drama')
ON DUPLICATE KEY UPDATE name=name;

-- Insert truyện mẫu
INSERT INTO comics (title, slug, author, description, cover_image, status, access_status, country_id, views, likes, follows, total_chapters) VALUES
('One Piece', 'one-piece', 'Eiichiro Oda', 'Câu chuyện về Luffy và băng hải tặc Mũ Rơm', '/uploads/comics/one-piece.jpg', 'ongoing', 'open', 1, 15000, 500, 300, 1000),
('Naruto', 'naruto', 'Masashi Kishimoto', 'Câu chuyện về ninja Naruto Uzumaki', '/uploads/comics/naruto.jpg', 'completed', 'open', 1, 12000, 450, 280, 700),
('Dragon Ball', 'dragon-ball', 'Akira Toriyama', 'Cuộc phiêu lưu của Goku', '/uploads/comics/dragon-ball.jpg', 'completed', 'open', 1, 10000, 400, 250, 500)
ON DUPLICATE KEY UPDATE title=title;

-- Insert chương mẫu
INSERT INTO chapters (comic_id, chapter_number, title, images, status, created_at) VALUES
(1, 1, 'Chương 1: Bắt đầu cuộc hành trình', '["/uploads/chapters/one-piece/ch1/page1.jpg", "/uploads/chapters/one-piece/ch1/page2.jpg"]', 'open', NOW()),
(1, 2, 'Chương 2: Gặp gỡ Zoro', '["/uploads/chapters/one-piece/ch2/page1.jpg", "/uploads/chapters/one-piece/ch2/page2.jpg"]', 'open', NOW()),
(2, 1, 'Chương 1: Naruto Uzumaki', '["/uploads/chapters/naruto/ch1/page1.jpg", "/uploads/chapters/naruto/ch1/page2.jpg"]', 'open', NOW())
ON DUPLICATE KEY UPDATE title=title;

-- Liên kết truyện với thể loại
INSERT INTO comic_categories (comic_id, category_id) VALUES
(1, 1), (1, 5), -- One Piece: Hành động, Phiêu lưu
(2, 1), (2, 8), -- Naruto: Hành động, Học đường
(3, 1), (3, 5)  -- Dragon Ball: Hành động, Phiêu lưu
ON DUPLICATE KEY UPDATE comic_id=comic_id;

-- =====================================================
-- GHI CHÚ:
-- =====================================================
-- File này đã gộp tất cả các migration SQL:
-- 1. schema.sql - Schema cơ bản
-- 2. vip_features_migration.sql - Tính năng VIP và account_status
-- 3. auth_features_migration.sql - Email verification, password reset, Google OAuth
-- 4. fix_password_nullable.sql - Cho phép password NULL
-- 5. chapters_add_status.sql - Thêm status cho chapters
-- 6. comments_migration.sql - Bảng comments
-- 7. notifications_migration.sql - Bảng notifications
-- 8. notifications_update_comments.sql - Cập nhật notifications cho comments
-- 9. payment_migration.sql - Bảng payments
-- 
-- Lưu ý: File remove_unused_token_columns.sql KHÔNG được bao gồm vì nó xóa các cột
-- email_verification_token, password_reset_token, password_reset_expires
-- Nếu bạn muốn xóa các cột này, hãy chạy file đó riêng sau khi chạy file này.
-- =====================================================

