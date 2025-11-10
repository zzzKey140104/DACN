# 🔐 Giải thích chi tiết về JWT_SECRET

## 1. JWT là gì?

**JWT (JSON Web Token)** là một chuẩn mở (RFC 7519) để truyền thông tin an toàn giữa các bên dưới dạng JSON object. Token này có thể được ký (signed) để đảm bảo tính toàn vẹn và xác thực.

### Cấu trúc của JWT Token:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIn0.signature
     └─ Header ───────────────┘ └─ Payload ───────────────┘ └─ Signature ─┘
```

- **Header**: Chứa thông tin về thuật toán mã hóa (ví dụ: HS256)
- **Payload**: Chứa dữ liệu (claims) như user ID, email, thời gian hết hạn
- **Signature**: Chữ ký số được tạo bằng JWT_SECRET để đảm bảo token không bị giả mạo

## 2. JWT_SECRET là gì?

**JWT_SECRET** là một chuỗi bí mật (secret key) dùng để:
- **Ký (sign)** token khi tạo mới
- **Xác thực (verify)** token khi nhận được từ client

### Tại sao cần JWT_SECRET?

Giống như con dấu của công ty:
- Khi **tạo token** (đăng nhập): Server dùng JWT_SECRET để "đóng dấu" vào token
- Khi **kiểm tra token** (gửi request): Server dùng JWT_SECRET để "kiểm tra dấu" xem token có phải do server tạo ra không

Nếu ai đó biết JWT_SECRET, họ có thể:
- Tạo token giả mạo với bất kỳ user ID nào
- Đăng nhập với tư cách user khác
- Truy cập các API yêu cầu authentication

## 3. JWT Authentication Flow trong dự án

### Bước 1: User đăng nhập (Login)
**File:** `backend/controllers/authController.js` (dòng 44-91)

```javascript
// 1. User gửi email và password
const { email, password } = req.body;

// 2. Kiểm tra email và password
const user = await User.findByEmail(email);
const isValidPassword = await bcrypt.compare(password, user.password);

// 3. Nếu đúng, tạo JWT token bằng JWT_SECRET
const token = jwt.sign(
  { id: user.id, email: user.email },  // Payload: thông tin user
  process.env.JWT_SECRET,               // Secret key để ký token
  { expiresIn: '7d' }                   // Token hết hạn sau 7 ngày
);

// 4. Trả về token cho client
return successResponse(res, { token, user: {...} });
```

**Ví dụ token được tạo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNjE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Bước 2: Client lưu token
**File:** `frontend/src/contexts/AuthContext.js` (dòng 20-25)

```javascript
// Frontend lưu token vào localStorage
localStorage.setItem('token', tokenData);
```

### Bước 3: Client gửi request với token
**File:** `frontend/src/services/api.js` (dòng 12-18)

```javascript
// Tự động thêm token vào header mỗi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;  // Thêm vào header
  }
  return config;
});
```

**Ví dụ request:**
```
GET /api/favorites
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Bước 4: Server xác thực token
**File:** `backend/middleware/auth.js` (dòng 8-44)

```javascript
const authenticateToken = async (req, res, next) => {
  // 1. Lấy token từ header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN" -> "TOKEN"

  // 2. Kiểm tra có token không
  if (!token) {
    return errorResponse(res, 'Token không được cung cấp', 401);
  }

  // 3. Xác thực token bằng JWT_SECRET
  const decoded = await verifyToken(token, process.env.JWT_SECRET);
  // Nếu token không hợp lệ hoặc JWT_SECRET sai -> throw error

  // 4. Lấy thông tin user từ database
  const user = await User.findById(decoded.id);

  // 5. Gắn thông tin user vào request để controller sử dụng
  req.user = {
    id: user.id,
    email: decoded.email,
    role: user.role || 'reader'
  };

  next(); // Cho phép request tiếp tục
};
```

### Bước 5: Controller sử dụng thông tin user
**File:** `backend/routes/favorites.js` (dòng 6-8)

```javascript
// Route yêu cầu authentication
router.get('/', authenticateToken, favoriteController.getByUser);
//                      ↑
//              Middleware kiểm tra token trước

// Trong controller, có thể dùng req.user.id
```

## 4. Các nơi sử dụng JWT_SECRET trong code

### 4.1. Tạo token (Sign)
**File:** `backend/controllers/authController.js`
- **Dòng 71-75**: Tạo token khi user đăng nhập
- **Sử dụng:** `jwt.sign(payload, JWT_SECRET, options)`

### 4.2. Xác thực token (Verify)
**File:** `backend/middleware/auth.js`
- **Dòng 23**: Xác thực token từ client
- **Sử dụng:** `jwt.verify(token, JWT_SECRET)`

### 4.3. Validation
**File:** `backend/server.js`
- **Dòng 16**: Kiểm tra JWT_SECRET có tồn tại không khi khởi động
- **Dòng 34-35**: Cảnh báo nếu dùng giá trị mặc định

**File:** `backend/controllers/authController.js`
- **Dòng 65-68**: Kiểm tra JWT_SECRET trước khi tạo token

**File:** `backend/middleware/auth.js`
- **Dòng 18-21**: Kiểm tra JWT_SECRET trước khi verify token

## 5. Các routes yêu cầu JWT_SECRET

### Routes cần authentication (có sử dụng JWT_SECRET):

1. **Favorites** (`backend/routes/favorites.js`)
   - `GET /api/favorites` - Lấy danh sách yêu thích
   - `POST /api/favorites/toggle` - Thêm/xóa yêu thích
   - `GET /api/favorites/check/:comicId` - Kiểm tra đã yêu thích chưa

2. **Likes** (`backend/routes/likes.js`)
   - `POST /api/likes/toggle` - Thích/bỏ thích
   - `GET /api/likes/check/:comicId` - Kiểm tra đã thích chưa

3. **History** (`backend/routes/history.js`)
   - `GET /api/history` - Lấy lịch sử đọc
   - `GET /api/history/comic/:comicId` - Lịch sử của một truyện
   - `POST /api/history` - Lưu lịch sử đọc

4. **Users** (`backend/routes/users.js`)
   - `GET /api/users/:id` - Lấy thông tin user

5. **Admin** (`backend/routes/admin.js`)
   - Tất cả routes admin (quản lý truyện, chương, v.v.)

### Routes KHÔNG cần authentication:
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập (nhưng tạo token cần JWT_SECRET)
- `GET /api/comics` - Xem danh sách truyện
- `GET /api/chapters/:id` - Đọc chương

## 6. Ví dụ minh họa

### Scenario: User muốn xem danh sách truyện yêu thích

```
1. User đã đăng nhập → có token trong localStorage
   Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

2. Frontend gửi request:
   GET /api/favorites
   Headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }

3. Backend nhận request → authenticateToken middleware chạy:
   - Lấy token từ header
   - Dùng JWT_SECRET để verify token
   - Nếu hợp lệ → decode payload → lấy user.id
   - Gắn req.user = { id: 1, email: "user@example.com", role: "reader" }

4. Controller chạy:
   - Dùng req.user.id để lấy danh sách yêu thích của user đó
   - Trả về kết quả

5. Nếu token không hợp lệ:
   - verifyToken() throw error
   - Trả về 403 "Token không hợp lệ"
```

## 7. Tại sao JWT_SECRET phải bí mật?

### Nếu JWT_SECRET bị lộ:

**Kẻ tấn công có thể:**
1. Tạo token giả mạo:
   ```javascript
   const fakeToken = jwt.sign(
     { id: 999, email: "admin@example.com" },
     "your_secret_key_here_change_in_production" // JWT_SECRET bị lộ
   );
   ```

2. Gửi request với token giả:
   ```
   GET /api/admin/comics
   Authorization: Bearer [fakeToken]
   ```

3. Server sẽ chấp nhận token vì nó được ký bằng JWT_SECRET đúng!

### Giải pháp:
- ✅ Dùng JWT_SECRET ngẫu nhiên, mạnh (128+ ký tự)
- ✅ Không commit JWT_SECRET lên Git
- ✅ Mỗi môi trường (dev, staging, production) dùng JWT_SECRET khác nhau
- ✅ Thay đổi JWT_SECRET định kỳ nếu nghi ngờ bị lộ

## 8. Cách tạo JWT_SECRET mạnh

Chạy script:
```bash
cd backend
node generate-secret.js
```

Script sẽ tạo một chuỗi ngẫu nhiên 128 ký tự (64 bytes hex), ví dụ:
```
901bdb6c93e478b37320464c42025e18efdabf4b6cea09bbc5521212538d04ace1668a254ad9811cbb10288165c50b70be446a86a4947e8ae0c9b9a6a0ca389b
```

## 9. Tóm tắt

| Khái niệm | Mô tả |
|-----------|-------|
| **JWT** | Token chứa thông tin user, được ký bằng JWT_SECRET |
| **JWT_SECRET** | Secret key để ký và verify token |
| **jwt.sign()** | Tạo token mới (dùng khi đăng nhập) |
| **jwt.verify()** | Kiểm tra token có hợp lệ không (dùng trong middleware) |
| **authenticateToken** | Middleware bảo vệ các routes cần authentication |
| **Bearer Token** | Format token trong HTTP header: `Authorization: Bearer <token>` |

---

**Lưu ý quan trọng:**
- ⚠️ JWT_SECRET phải được giữ bí mật tuyệt đối
- ⚠️ Không dùng giá trị mặc định trong production
- ⚠️ Mỗi môi trường nên có JWT_SECRET riêng

