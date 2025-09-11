# Database Setup Guide

## 1. Cài đặt PostgreSQL

### Windows:
1. Tải PostgreSQL từ: https://www.postgresql.org/download/windows/
2. Cài đặt với password mặc định hoặc tùy chỉnh
3. Ghi nhớ password để sử dụng trong DATABASE_URL

### macOS:
```bash
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 2. Tạo Database

```sql
-- Kết nối vào PostgreSQL
psql -U postgres

-- Tạo database
CREATE DATABASE siteflow_dev;

-- Tạo user (optional)
CREATE USER siteflow_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE siteflow_dev TO siteflow_user;
```

## 3. Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục gốc với nội dung:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/siteflow_dev"

# Clerk Configuration (thay thế bằng keys thực tế)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_key_here"
CLERK_SECRET_KEY="sk_test_your_secret_key_here"
CLERK_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# Next.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret_here"
```

## 4. Chạy Migrations

```bash
# Chạy migrations để tạo tables
npm run db:migrate

# Xem database trong Drizzle Studio
npm run db:studio
```

## 5. Import Demo Data

```bash
# Chạy script để import demo projects
npm run db:seed
```

## 6. Kiểm tra Database

Sau khi chạy migrations, bạn sẽ có các tables:
- `organization` - Thông tin tổ chức
- `project` - Dự án xây dựng
- `daily_log` - Nhật ký công việc
- `project_photo` - Ảnh dự án
- `todo` - Danh sách công việc

## Troubleshooting

### Lỗi kết nối database:
- Kiểm tra PostgreSQL đã chạy chưa
- Kiểm tra DATABASE_URL có đúng không
- Kiểm tra port 5432 có bị block không

### Lỗi permissions:
- Đảm bảo user có quyền truy cập database
- Kiểm tra password có đúng không

### Lỗi migration:
- Xóa database và tạo lại
- Kiểm tra file migration có lỗi không
