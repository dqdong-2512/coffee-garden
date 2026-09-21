# Coffee Garden

Coffee Garden là nền tảng gọi món và vận hành dành cho mô hình một quán. Hệ thống hỗ trợ khách gọi món bằng QR, nhân viên gọi món tại POS, quy trình bếp, thanh toán, tồn kho, chốt ngày và báo cáo quản lý.

## Chức năng chính

- Trang chủ công khai và menu gọi món theo từng bàn.
- Danh sách bàn và POS dành cho nhân viên.
- Màn hình bếp với trạng thái order trực tiếp và phiếu bếp có thể in.
- Ghi nhận thanh toán tiền mặt và chuyển khoản.
- Báo cáo doanh thu, chi phí, lợi nhuận ước tính, tồn kho và chốt ngày.
- Quản lý món, danh mục, bàn, mã QR, công thức và biến động kho.
- Một tài khoản Super Admin được bảo vệ và các tài khoản nhân viên do quán cấp với quyền Gọi món, Bếp và Kiểm toán có thể kết hợp.

## Khởi chạy nhanh

Yêu cầu:

- Node.js 22.12 trở lên.
- Docker Desktop đang chạy Docker Engine.

```powershell
npm install
Copy-Item .env.example .env
npm run db:start
npm run db:deploy
npm run db:seed
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

Dữ liệu seed local tạo các tài khoản dùng để review:

| Quyền truy cập | Tên đăng nhập | Mật khẩu |
| --- | --- | --- |
| Super Admin | `owner` | `coffee-owner-local` |
| Bếp | `kitchen` | `coffee-kitchen-local` |
| Gọi món và POS | `cashier` | `coffee-cashier-local` |

Các tài khoản này chỉ dùng khi phát triển ở local. Seed chỉ tạo tài khoản còn thiếu và không ghi đè mật khẩu của tài khoản đã tồn tại.

## Các trang thường dùng

| Khu vực | URL |
| --- | --- |
| Trang chủ công khai | `http://localhost:3000/` |
| Khách gọi món tại bàn T12 | `http://localhost:3000/order/T12` |
| Đăng nhập nhân viên | `http://localhost:3000/login` |
| Nhân viên chọn bàn | `http://localhost:3000/staff/tables` |
| POS nhân viên | `http://localhost:3000/pos` |
| Màn hình bếp | `http://localhost:3000/kitchen` |
| Dashboard quản lý | `http://localhost:3000/owner/dashboard` |
| Supabase Studio local | `http://127.0.0.1:54323` |

Các mã bàn được seed là `T01` đến `T12`.

## Tài liệu

- [Mục lục tài liệu](docs/README.md)
- [Phát triển ở local](docs/LOCAL_DEVELOPMENT.md)
- [Hướng dẫn sử dụng cho nhân viên và quản lý](docs/USER_GUIDE.md)
- [Kiến trúc và bảo mật](docs/ARCHITECTURE.md)
- [Kiểm thử và nghiệm thu](docs/TESTING.md)
- [Triển khai và vận hành](docs/DEPLOYMENT.md)
- [Sổ tay nhân viên bản Word](docs/Huong-Dan-Su-Dung-Coffee-Garden.docx)

## Kiểm tra dự án

```powershell
npm test
npm run lint
npm run build
npm run test:db
```

`npm run test:db` yêu cầu database local đã được khởi động, migrate và seed.

## Định hướng production

Sử dụng gói hosting cho phép kinh doanh đối với ứng dụng Next.js và PostgreSQL được quản lý tại khu vực gần Việt Nam. Cấu hình HTTPS, backup, secret production và mã QR của từng bàn trước khi nhận order thật. Thực hiện đầy đủ theo [hướng dẫn triển khai và vận hành](docs/DEPLOYMENT.md).
