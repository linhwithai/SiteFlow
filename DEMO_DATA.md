# Demo Data cho SiteFlow

## 🎯 Mục đích
Tạo dữ liệu mẫu để test chức năng CRUD Projects mà không cần cấu hình database.

## 📁 Files Demo Data

### 1. `scripts/demo-data.json`
Chứa 10 dự án mẫu với đầy đủ thông tin:
- **Chung cư Green Tower** - 500 tỷ VNĐ (ACTIVE)
- **Trường học Quốc tế ABC** - 200 tỷ VNĐ (ACTIVE)
- **Bệnh viện Đa khoa XYZ** - 800 tỷ VNĐ (COMPLETED)
- **Trung tâm Thương mại DEF** - 600 tỷ VNĐ (ON_HOLD)
- **Nhà máy Sản xuất GHI** - 300 tỷ VNĐ (CANCELLED)
- **Khu dân cư JKL** - 150 tỷ VNĐ (PLANNING)
- **Cầu vượt MNO** - 400 tỷ VNĐ (ACTIVE)
- **Sân bay Quốc tế PQR** - 1.2 nghìn tỷ VNĐ (ACTIVE)
- **Metro Line 3** - 2 nghìn tỷ VNĐ (PLANNING)
- **Khu công nghiệp STU** - 1 nghìn tỷ VNĐ (COMPLETED)

### 2. `scripts/seed-projects.ts`
Script TypeScript để import demo data vào database thực.

### 3. Mock API Endpoints
- `/api/projects/mock` - Trả về danh sách dự án mẫu
- `/api/projects/stats/mock` - Trả về thống kê dự án mẫu

## 🚀 Cách sử dụng

### Option 1: Demo UI (Không cần database)
1. Chạy ứng dụng: `npm run dev`
2. Truy cập: `http://localhost:3000/dashboard/projects/demo`
3. Xem UI với dữ liệu mẫu

### Option 2: Với Database thực
1. Cấu hình database theo `DATABASE_SETUP.md`
2. Chạy migrations: `npm run db:migrate`
3. Import demo data: `npm run db:seed`
4. Truy cập: `http://localhost:3000/dashboard/projects`

## 📊 Thống kê Demo Data

- **Tổng dự án**: 10
- **Đang thực hiện**: 4
- **Hoàn thành**: 2
- **Tạm dừng**: 1
- **Hủy bỏ**: 1
- **Lập kế hoạch**: 2
- **Tổng ngân sách**: 7.55 nghìn tỷ VNĐ
- **Ngân sách trung bình**: 755 tỷ VNĐ

## 🎨 Features được test

### ✅ Project List
- Hiển thị danh sách dự án với pagination
- Filter theo trạng thái, thành phố, tỉnh
- Search theo tên, mô tả, địa chỉ
- Responsive design

### ✅ Project Stats
- Thống kê tổng quan
- Biểu đồ trạng thái dự án
- Thống kê ngân sách

### ✅ Project Detail
- Xem chi tiết dự án
- Thông tin đầy đủ (địa chỉ, ngân sách, thời gian)
- Actions (Edit, Delete)

### ✅ Project Form
- Form tạo/chỉnh sửa dự án
- Validation đầy đủ
- UI/UX thân thiện

## 🔧 Customization

Để thay đổi demo data:
1. Chỉnh sửa `scripts/demo-data.json`
2. Restart ứng dụng
3. Refresh trang demo

## 📝 Notes

- Demo data sử dụng `organizationId: "org_demo_1"`
- Tất cả dự án đều `isActive: true`
- Dates được format theo ISO string
- Budget được tính bằng VNĐ
