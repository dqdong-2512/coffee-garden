# Phát triển tại local

Tài liệu này hướng dẫn chạy Coffee Garden tại local với PostgreSQL của Supabase do Docker quản lý. Prisma là công cụ duy nhất quản lý migration trong repository.

## Yêu cầu

- Node.js 22.12 trở lên.
- Docker Desktop đang chạy Docker Engine.
- PowerShell trên Windows hoặc terminal tương đương trên macOS và Linux.

PostgreSQL và pgAdmin được cài trực tiếp trên máy là tùy chọn. Cấu hình mặc định dùng database trong Docker để môi trường phát triển nhất quán.

## Thiết lập lần đầu

Từ thư mục dự án, chạy:

```powershell
npm install
Copy-Item .env.example .env
npm run db:start
npm run db:deploy
npm run db:seed
```

Trên macOS hoặc Linux, thay `Copy-Item .env.example .env` bằng `cp .env.example .env`.

Lần đầu khởi động database, Docker cần tải image nên có thể mất vài phút. URL PostgreSQL local mặc định đã có trong `.env.example`:

```text
postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

## Khởi động ứng dụng web

```powershell
npm run dev
```

Mở `http://localhost:3000`.

## Tài khoản local

| Quyền | Username | Password |
| --- | --- | --- |
| Super Admin | `owner` | `coffee-owner-local` |
| Bếp | `kitchen` | `coffee-kitchen-local` |
| Order và POS | `cashier` | `coffee-cashier-local` |

Chỉ dùng các tài khoản này để review tại local. Đổi toàn bộ mật khẩu mẫu và `AUTH_SESSION_SECRET` trước khi kết nối ứng dụng với database được host bên ngoài.

## Các lệnh database

| Lệnh | Mục đích |
| --- | --- |
| `npm run db:start` | Khởi động các container Supabase tại local. |
| `npm run db:stop` | Dừng container nhưng không xóa dữ liệu. |
| `npm run db:deploy` | Áp dụng các Prisma migration đã lưu trong repository. |
| `npm run db:migrate` | Tạo migration trong quá trình phát triển. |
| `npm run db:seed` | Thêm dữ liệu và tài khoản mẫu còn thiếu. |
| `npm run db:studio` | Mở Prisma Studio. |
| `npm run db:validate` | Kiểm tra Prisma schema. |
| `npm run db:reset` | Tạo lại và seed database local. Lệnh này xóa dữ liệu local. |

Seed có tính lặp an toàn: chỉ tạo record còn thiếu và giữ lại các thay đổi sau đó đối với món ăn, thức uống và mật khẩu nhân viên hiện có.

## Các URL local thường dùng

| Trang | URL |
| --- | --- |
| Khách gọi món tại bàn T12 | `http://localhost:3000/order/T12` |
| Đăng nhập nhân viên | `http://localhost:3000/login` |
| Danh sách bàn cho nhân viên | `http://localhost:3000/staff/tables` |
| Màn hình bếp | `http://localhost:3000/kitchen` |
| Dashboard quản lý | `http://localhost:3000/owner/dashboard` |
| Supabase Studio | `http://127.0.0.1:54323` |
| Endpoint kiểm tra hệ thống | `http://localhost:3000/api/health` |

## Xử lý sự cố

### Lệnh Docker chạy được nhưng database không khởi động

Mở Docker Desktop và chờ Docker Engine báo đang hoạt động. Sau đó chạy lại `npm run db:start`.

### PowerShell không tìm thấy thư mục dự án

Dùng đường dẫn Windows trong PowerShell:

```powershell
Set-Location E:\Projects\coffee-garden
```

Không nhập đường dẫn Windows tại dấu nhắc Linux `docker-desktop:~#`. Hãy thoát shell đó và dùng PowerShell hoặc terminal của Visual Studio Code.

### Trang báo database không khả dụng

Chạy:

```powershell
npm run db:start
npm run db:deploy
npm run db:seed
```

Sau đó khởi động lại `npm run dev` và kiểm tra `http://localhost:3000/api/health`.
