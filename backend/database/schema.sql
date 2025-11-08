-- Tạo database
CREATE DATABASE IF NOT EXISTS truyen_gg_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE truyen_gg_db;

-- Bảng users (người dùng)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) DEFAULT NULL,
    role ENUM('reader', 'admin') DEFAULT 'reader',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

-- Insert dữ liệu mẫu
INSERT INTO countries (name, slug) VALUES
('Nhật Bản', 'nhat-ban'),
('Hàn Quốc', 'han-quoc'),
('Trung Quốc', 'trung-quoc'),
('Việt Nam', 'viet-nam'),
('Mỹ', 'my');

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
('Drama', 'drama');

-- Insert truyện mẫu
INSERT INTO comics (title, slug, author, description, cover_image, status, country_id, views, likes, follows, total_chapters) VALUES
('One Piece', 'one-piece', 'Eiichiro Oda', 'Câu chuyện về Luffy và băng hải tặc Mũ Rơm', '/uploads/comics/one-piece.jpg', 'ongoing', 1, 15000, 500, 300, 1000),
('Naruto', 'naruto', 'Masashi Kishimoto', 'Câu chuyện về ninja Naruto Uzumaki', '/uploads/comics/naruto.jpg', 'completed', 1, 12000, 450, 280, 700),
('Dragon Ball', 'dragon-ball', 'Akira Toriyama', 'Cuộc phiêu lưu của Goku', '/uploads/comics/dragon-ball.jpg', 'completed', 1, 10000, 400, 250, 500);

-- Insert chương mẫu
INSERT INTO chapters (comic_id, chapter_number, title, images, created_at) VALUES
(1, 1, 'Chương 1: Bắt đầu cuộc hành trình', '["/uploads/chapters/one-piece/ch1/page1.jpg", "/uploads/chapters/one-piece/ch1/page2.jpg"]', NOW()),
(1, 2, 'Chương 2: Gặp gỡ Zoro', '["/uploads/chapters/one-piece/ch2/page1.jpg", "/uploads/chapters/one-piece/ch2/page2.jpg"]', NOW()),
(2, 1, 'Chương 1: Naruto Uzumaki', '["/uploads/chapters/naruto/ch1/page1.jpg", "/uploads/chapters/naruto/ch1/page2.jpg"]', NOW());

-- Liên kết truyện với thể loại
INSERT INTO comic_categories (comic_id, category_id) VALUES
(1, 1), (1, 5), -- One Piece: Hành động, Phiêu lưu
(2, 1), (2, 8), -- Naruto: Hành động, Học đường
(3, 1), (3, 5); -- Dragon Ball: Hành động, Phiêu lưu
