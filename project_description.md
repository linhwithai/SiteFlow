Mô tả Dự án SaaS: Nền tảng Quản lý Dự án Xây dựng (Dành cho AI)
Tầm nhìn & Mục tiêu
Sản phẩm: Nền tảng SaaS quản lý dự án xây dựng.

Đối tượng: Các công ty xây dựng vừa và nhỏ (2−10 người) và kỹ sư tại Việt Nam.

Ngôn ngữ: Ưu tiên Tiếng Việt.

Kiến trúc Công nghệ
Stack: Sử dụng ixartz/SaaS-Boilerplate (Next.js, TypeScript, Tailwind, ShadCN, Drizzle ORM, Clerk).

Cơ sở dữ liệu: PostgreSQL với cơ chế Row-Level Security (RLS) để đảm bảo bảo mật dữ liệu đa người thuê.

Lưu trữ file: Cloudinary, có khả năng tự động watermark và tạo thumbnail.

Xác thực: Clerk, với sự hỗ trợ cho mô hình Organization.

Giao diện: Progressive Web App (PWA) tối ưu cho mobile, dễ sử dụng ngoài công trường.

Tích hợp AI: Bot (Telegram/Zalo) + n8n + AI Agent.

Kiến trúc Dữ liệu
Mô hình cấp bậc: Organization → Projects → Daily Logs / Tasks → Photos / Documents / Comments.

Chiến lược Multi-tenancy: Áp dụng RLS dựa trên organizationId để phân tách dữ liệu giữa các tổ chức.

Hệ thống Vai trò
Cấp Tổ chức: Owner/Admin, Member.

Cấp Dự án: Project Manager, Site Engineer, Supervisor.

Tính năng Cốt lõi (Giai đoạn MVP)
Quản lý Dự án (CRUD): Triển khai các chức năng tạo, đọc, cập nhật và xóa dự án.

Quản lý Daily Logs (CRUD): Xây dựng các chức năng CRUD cho Daily Logs, liên kết với một dự án cụ thể.

Quản lý File: Tích hợp Cloudinary để xử lý việc upload và lưu trữ ảnh/video.

Bot Endpoint: Tạo API endpoint để nhận và xử lý dữ liệu từ n8n workflow.

Giao diện: Thiết kế giao diện Dashboard và các form cần thiết cho Projects và Daily Logs trên nền tảng PWA.

Yêu cầu Phát triển & Bảo mật
Yêu cầu cốt lõi:

Scaffold hệ thống bằng boilerplate đã chỉ định.

Triển khai đầy đủ các tính năng MVP như đã liệt kê.

Đảm bảo cấu trúc dữ liệu tuân thủ mô hình cấp bậc đã mô tả.

Yêu cầu bảo mật:

Áp dụng RLS nghiêm ngặt để phân quyền dữ liệu.

Đảm bảo các API endpoints được bảo vệ đúng cách và chỉ cho phép người dùng được xác thực truy cập.

Khả năng mở rộng:

Thiết kế hệ thống với tư duy mở rộng.

Code phải sạch, module hóa, dễ bảo trì để thêm các tính năng phức tạp hơn như Tasks và Comments trong tương lai.
