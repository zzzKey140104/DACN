# Truyện GG - Website Đọc Truyện Tranh

Website đọc truyện tranh online được xây dựng với React (Frontend) và Node.js Express (Backend), sử dụng MySQL làm cơ sở dữ liệu.

## 📋 Mục lục

- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Tính năng](#tính-năng)
- [Cài đặt](#cài-đặt)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Đóng góp](#đóng-góp)
- [License](#license)

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 18** - UI Framework
- **React Router** - Routing
- **Axios** - HTTP Client
- **Context API** - State Management (Auth, Theme)
- **CSS3** - Styling với responsive design

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database (XAMPP)
- **JWT** - Authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

## Cài đặt

### Yêu cầu hệ thống

- Node.js (v14 trở lên)
- npm hoặc yarn
- XAMPP (để chạy MySQL)
- MySQL Server

### Bước 1: Clone và cài đặt dependencies

```bash
# Cài đặt dependencies cho root, backend và frontend
npm run install-all
```

Hoặc cài đặt từng phần:

```bash
# Root
npm install

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Bước 2: Cấu hình Database

1. Khởi động XAMPP và bật MySQL
2. Mở phpMyAdmin (http://localhost/phpmyadmin)
3. Import file `backend/database/schema.sql` để tạo database và bảng

### Bước 3: Cấu hình Backend

1. Copy file `.env.example` thành `.env` trong thư mục `backend`:

**Windows:**
```bash
cd backend
copy .env.example .env
```

**Linux/Mac:**
```bash
cd backend
cp .env.example .env
```

2. Chỉnh sửa file `.env` với thông tin database của bạn:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=truyen_gg_db
JWT_SECRET=your_secret_key_here_change_in_production
FRONTEND_URL=http://localhost:3000
```

**Lưu ý:** Thay đổi `JWT_SECRET` bằng một chuỗi ngẫu nhiên mạnh khi deploy production!

### Bước 4: Chạy ứng dụng

#### Chạy cả Frontend và Backend cùng lúc:
```bash
npm run dev
```

#### Hoặc chạy riêng biệt:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

- Backend chạy tại: http://localhost:5000
- Frontend chạy tại: http://localhost:3000

## Cấu trúc dự án

```
DACN/
├── backend/
│   ├── config/
│   │   └── database.js          # Cấu hình kết nối MySQL
│   ├── controllers/             # Business logic
│   │   ├── authController.js
│   │   ├── comicController.js
│   │   ├── chapterController.js
│   │   └── userController.js
│   ├── models/                   # Database models/queries
│   │   ├── Comic.js
│   │   ├── Chapter.js
│   │   └── User.js
│   ├── routes/                   # API routes
│   │   ├── auth.js
│   │   ├── comics.js
│   │   ├── chapters.js
│   │   └── users.js
│   ├── middleware/               # Middleware functions
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── utils/                    # Utility functions
│   │   └── response.js
│   ├── database/
│   │   └── schema.sql            # Database schema
│   ├── server.js                 # Entry point
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Common components (Header, Footer, Loading)
│   │   │   └── features/         # Feature-specific components (ComicCard)
│   │   ├── pages/                # Page components
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useComics.js
│   │   │   ├── useComic.js
│   │   │   └── useChapter.js
│   │   ├── contexts/             # React contexts
│   │   │   └── AuthContext.js
│   │   ├── services/            # API services
│   │   │   └── api.js
│   │   ├── utils/                # Utility functions
│   │   │   └── helpers.js
│   │   ├── constants/            # Constants
│   │   │   └── index.js
│   │   ├── styles/               # Global styles
│   │   │   └── global.css
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── package.json
```

## 📡 API Endpoints

### Comics
- `GET /api/comics` - Lấy danh sách truyện (có phân trang, tìm kiếm, lọc theo status, country)
- `GET /api/comics/:id` - Lấy chi tiết truyện
- `GET /api/comics/latest/updates` - Lấy truyện mới cập nhật
- `GET /api/comics/popular/list` - Lấy truyện phổ biến
- `GET /api/comics/category/:categoryId` - Lấy truyện theo thể loại
- `POST /api/comics/:id/views` - Tăng lượt xem truyện

### Chapters
- `GET /api/chapters/:id` - Lấy chi tiết chương
- `GET /api/chapters/comic/:comicId` - Lấy danh sách chương của truyện
- `POST /api/chapters/:id/views` - Tăng lượt xem chương

### Auth
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

### Users
- `GET /api/users/:id` - Lấy thông tin user

### Categories
- `GET /api/categories` - Lấy danh sách thể loại
- `GET /api/categories/:id` - Lấy chi tiết thể loại

### Countries
- `GET /api/countries` - Lấy danh sách quốc gia

### Favorites (Yêu cầu authentication)
- `GET /api/favorites` - Lấy danh sách truyện đã theo dõi
- `POST /api/favorites/toggle` - Bật/tắt theo dõi truyện
- `GET /api/favorites/check/:comicId` - Kiểm tra đã theo dõi chưa

### Likes (Yêu cầu authentication)
- `POST /api/likes/toggle` - Bật/tắt thích truyện
- `GET /api/likes/check/:comicId` - Kiểm tra đã thích chưa

### Reading History (Yêu cầu authentication)
- `GET /api/history` - Lấy lịch sử đọc
- `GET /api/history/comic/:comicId` - Lấy lịch sử đọc của một truyện
- `POST /api/history` - Thêm/cập nhật lịch sử đọc

### Admin (Yêu cầu admin role)
- `GET /api/admin/comics` - Lấy danh sách truyện (admin)
- `POST /api/admin/comics` - Tạo truyện mới
- `PUT /api/admin/comics/:id` - Cập nhật truyện
- `DELETE /api/admin/comics/:id` - Xóa truyện
- `POST /api/admin/chapters` - Tạo chương mới
- `PUT /api/admin/chapters/:id` - Cập nhật chương
- `DELETE /api/admin/chapters/:id` - Xóa chương

## ✨ Tính năng

### Người dùng
- ✅ Xem danh sách truyện với phân trang và bộ lọc
- ✅ Tìm kiếm truyện theo tên, tác giả
- ✅ Xem chi tiết truyện với đầy đủ thông tin
- ✅ Đọc chương truyện với nhiều ảnh
- ✅ Lưu vị trí đọc và tiếp tục đọc từ vị trí đã dừng
- ✅ Đăng ký/Đăng nhập với JWT authentication
- ✅ Theo dõi truyện yêu thích
- ✅ Thích truyện
- ✅ Lịch sử đọc truyện
- ✅ Xem truyện theo thể loại
- ✅ Xem truyện theo quốc gia
- ✅ Dark mode / Light mode
- ✅ Responsive design (mobile, tablet, desktop)

### Admin
- ✅ Quản lý truyện (thêm, sửa, xóa)
- ✅ Quản lý chương (thêm, sửa, xóa)
- ✅ Upload ảnh bìa truyện
- ✅ Upload nhiều ảnh cho một chương
- ✅ Quản lý thể loại và quốc gia

### Hệ thống
- ✅ Tự động tăng lượt xem khi đọc chương
- ✅ Tổng lượt xem truyện = tổng lượt xem các chương
- ✅ Phân quyền người dùng (Reader, Admin)

## 🚀 Deployment

### Chuẩn bị
1. Đảm bảo MySQL đang chạy
2. Cập nhật file `.env` với thông tin production
3. Build frontend: `cd frontend && npm run build`

### Backend
- Sử dụng PM2 hoặc process manager để chạy Node.js
- Cấu hình reverse proxy (Nginx) nếu cần

### Frontend
- Deploy thư mục `build` lên hosting (Vercel, Netlify, hoặc server tĩnh)
- Cấu hình API URL trong `frontend/src/constants/index.js`

## 📝 Ghi chú

- ⚠️ Đảm bảo MySQL đang chạy trên XAMPP trước khi khởi động backend
- ⚠️ Thay đổi `JWT_SECRET` trong file `.env` bằng một chuỗi ngẫu nhiên mạnh khi deploy production
- 📦 File `schema.sql` đã bao gồm dữ liệu mẫu để test
- 📁 Thư mục `backend/uploads/` chứa các file ảnh đã upload (không commit lên git)
- 🔒 Tất cả API endpoints yêu cầu authentication đều cần JWT token trong header: `Authorization: Bearer <token>`

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết

## 👤 Tác giả

Dự án được phát triển bởi [Tên của bạn]

## 🙏 Lời cảm ơn

- React team
- Express.js community
- MySQL/XAMPP
- Tất cả các thư viện open source được sử dụng trong dự án

