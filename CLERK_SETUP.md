# Clerk Organization Setup Guide

Hướng dẫn thiết lập Clerk Organization cho nền tảng quản lý dự án xây dựng SiteFlow.

## 1. Tạo Clerk Account và Application

1. Truy cập [Clerk Dashboard](https://dashboard.clerk.com)
2. Tạo account mới hoặc đăng nhập
3. Tạo một application mới với tên "SiteFlow Construction Management"

## 2. Cấu hình Organization

1. Trong Clerk Dashboard, điều hướng đến **Organization management**
2. Chọn **Settings**
3. Bật **Enable organization** để cho phép tạo tổ chức
4. Cấu hình các settings sau:
   - **Organization name**: Bắt buộc
   - **Organization slug**: Bắt buộc, unique
   - **Organization logo**: Tùy chọn
   - **Organization metadata**: Tùy chọn

## 3. Cấu hình Environment Variables

Thêm các biến môi trường sau vào file `.env.local`:

```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

## 4. Cấu hình Webhook

1. Trong Clerk Dashboard, điều hướng đến **Webhooks**
2. Tạo webhook mới với URL: `https://yourdomain.com/api/webhooks/clerk/organization`
3. Chọn các events sau:
   - `organization.created`
   - `organization.updated`
   - `organization.deleted`
4. Copy webhook secret và thêm vào `CLERK_WEBHOOK_SECRET`

## 5. Cấu hình Database

Chạy migration để tạo tables và RLS policies:

```bash
# Generate migration
npm run db:generate

# Apply migration (nếu có database)
npm run db:migrate
```

## 6. Cấu hình Organization Roles

Trong Clerk Dashboard, cấu hình các roles sau:

### Organization Roles:
- **org:owner**: Chủ sở hữu tổ chức
- **org:admin**: Quản trị viên tổ chức
- **org:member**: Thành viên tổ chức

### Project Roles (Custom metadata):
- **project:manager**: Quản lý dự án
- **project:site_engineer**: Kỹ sư công trường
- **project:supervisor**: Giám sát viên
- **project:member**: Thành viên dự án

## 7. Testing Organization Flow

1. **Tạo Organization**:
   - Đăng ký user mới
   - Tạo organization trong Clerk
   - Kiểm tra organization được sync vào database

2. **Invite Members**:
   - Mời thành viên vào organization
   - Kiểm tra permissions và access control

3. **Switch Organization**:
   - Test chức năng chuyển đổi giữa các organizations
   - Kiểm tra data isolation

## 8. Security Considerations

- **Row-Level Security (RLS)**: Đã được cấu hình để đảm bảo data isolation
- **API Protection**: Tất cả API endpoints đều được bảo vệ bởi Clerk auth
- **Organization Validation**: Kiểm tra user có quyền truy cập organization

## 9. Troubleshooting

### Lỗi thường gặp:

1. **"Organization not found"**:
   - Kiểm tra webhook có hoạt động không
   - Verify organization được sync vào database

2. **"Permission denied"**:
   - Kiểm tra user có role phù hợp không
   - Verify RLS policies

3. **"Webhook failed"**:
   - Kiểm tra webhook secret
   - Verify webhook URL accessibility

### Debug Commands:

```bash
# Check database connection
npm run db:studio

# Check migration status
npm run db:generate

# Test webhook locally
ngrok http 3000
```

## 10. Production Deployment

1. **Environment Variables**: Cập nhật với production keys
2. **Webhook URL**: Cập nhật với production domain
3. **Database**: Sử dụng production PostgreSQL
4. **SSL**: Đảm bảo HTTPS cho webhook endpoints

## 11. Monitoring

- Monitor webhook delivery trong Clerk Dashboard
- Check database logs cho RLS policy violations
- Monitor organization creation/update rates

---

**Lưu ý**: Đảm bảo test kỹ tất cả flows trước khi deploy production!
