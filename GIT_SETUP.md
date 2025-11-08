# Hướng dẫn đẩy code lên GitHub

## Bước 1: Khởi tạo Git repository (nếu chưa có)

```bash
# Kiểm tra xem đã có git chưa
git status

# Nếu chưa có, khởi tạo
git init
```

## Bước 2: Thêm tất cả các file vào staging

```bash
# Thêm tất cả file (trừ những file trong .gitignore)
git add .

# Kiểm tra các file đã được thêm
git status
```

## Bước 3: Commit lần đầu

```bash
git commit -m "Initial commit: Truyện GG website"
```

## Bước 4: Tạo repository trên GitHub

1. Đăng nhập vào GitHub
2. Click vào dấu `+` ở góc trên bên phải
3. Chọn "New repository"
4. Đặt tên repository (ví dụ: `truyen-gg`)
5. Chọn Public hoặc Private
6. **KHÔNG** tích vào "Initialize this repository with a README" (vì đã có code rồi)
7. Click "Create repository"

## Bước 5: Kết nối với GitHub và push code

```bash
# Thêm remote repository (thay YOUR_USERNAME và YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Đổi tên branch chính thành main (nếu đang dùng master)
git branch -M main

# Push code lên GitHub
git push -u origin main
```

## Bước 6: Xác thực (nếu cần)

- Nếu GitHub yêu cầu authentication, bạn có thể:
  - Sử dụng Personal Access Token thay vì password
  - Hoặc cấu hình SSH key

## Các lệnh Git hữu ích

### Xem trạng thái
```bash
git status
```

### Xem lịch sử commit
```bash
git log
```

### Thêm file mới
```bash
git add <tên-file>
# hoặc
git add .
```

### Commit thay đổi
```bash
git commit -m "Mô tả thay đổi"
```

### Push lên GitHub
```bash
git push origin main
```

### Pull code từ GitHub
```bash
git pull origin main
```

### Xem các branch
```bash
git branch
```

### Tạo branch mới
```bash
git checkout -b feature/tên-tính-năng
```

### Chuyển branch
```bash
git checkout main
```

## Lưu ý quan trọng

1. **KHÔNG commit file `.env`** - File này chứa thông tin nhạy cảm
2. **KHÔNG commit `node_modules/`** - Đã được ignore trong .gitignore
3. **KHÔNG commit `backend/uploads/`** - Chứa file upload của user
4. Luôn kiểm tra `git status` trước khi commit
5. Viết commit message rõ ràng, mô tả đúng thay đổi

## Troubleshooting

### Lỗi: "remote origin already exists"
```bash
# Xóa remote cũ
git remote remove origin
# Thêm lại
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### Lỗi: "failed to push some refs"
```bash
# Pull code từ GitHub trước
git pull origin main --rebase
# Sau đó push lại
git push origin main
```

### Xóa file đã commit nhầm
```bash
# Xóa file khỏi git nhưng giữ lại ở local
git rm --cached <tên-file>
# Commit
git commit -m "Remove file from git"
# Push
git push origin main
```

