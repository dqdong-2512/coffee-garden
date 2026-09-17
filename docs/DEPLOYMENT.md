# Triển khai Coffee Garden

Tài liệu này dùng cho mô hình một quán với Next.js trên Vercel và PostgreSQL/Supabase được quản lý. Không dùng `prisma migrate dev` hoặc database local cho môi trường bán hàng thật.

## 1. Chuẩn bị dịch vụ

1. Tạo một PostgreSQL project gần Việt Nam và bật backup tự động hằng ngày.
2. Tạo Vercel project từ repository Coffee Garden bằng gói cho phép sử dụng thương mại.
3. Chuẩn bị domain chính, ví dụ `order.coffeegarden.vn`.
4. Giữ database và Vercel trong cùng hoặc gần khu vực để giảm độ trễ.

## 2. Environment variables

Thiết lập các biến sau trong Vercel. Chỉ cấp chúng cho Production và Preview khi Preview có database riêng.

| Biến | Mục đích |
| --- | --- |
| `DATABASE_URL` | URL pooled dùng khi ứng dụng chạy |
| `DIRECT_URL` | URL direct dùng cho Prisma migration |
| `AUTH_SESSION_SECRET` | Secret ngẫu nhiên tối thiểu 32 ký tự |
| `PUBLIC_APP_URL` | Origin HTTPS công khai, không có path |
| `SEED_OWNER_USERNAME` | Tên đăng nhập Owner đầu tiên |
| `SEED_OWNER_PASSWORD` | Mật khẩu Owner khởi tạo |
| `SEED_CASHIER_USERNAME` | Tên đăng nhập Thu ngân khởi tạo |
| `SEED_CASHIER_PASSWORD` | Mật khẩu Thu ngân khởi tạo |
| `SEED_KITCHEN_USERNAME` | Tên đăng nhập Bếp khởi tạo |
| `SEED_KITCHEN_PASSWORD` | Mật khẩu Bếp khởi tạo |

Tạo session secret bằng Node.js:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Không ghi secret vào Git, ảnh chụp màn hình hoặc tài liệu nội bộ. Sau lần seed đầu tiên, đổi cả ba mật khẩu trong Owner → Nhân viên và có thể xóa các biến `SEED_*_PASSWORD` khỏi runtime environment.

## 3. Release đầu tiên

Chạy các bước này từ môi trường bảo mật có các biến production:

```powershell
npm ci
npm run production:seed-check
npm run db:deploy
npm run db:seed
npm run build
```

Sau đó deploy bằng Vercel, gắn domain và chạy:

```powershell
npm run production:smoke -- https://order.coffeegarden.vn
```

`/api/health` phải trả HTTP 200 với `status: "ok"` và `database: "ok"`. Không đưa quán vào vận hành khi endpoint trả 503.

Các release sau chỉ cần `production:check`, `db:deploy`, test, build và deploy. Không chạy lại seed như một bước thường xuyên.

## 4. Backup và khôi phục

- Bật backup hằng ngày của nhà cung cấp PostgreSQL và giữ tối thiểu 7 bản gần nhất.
- Tạo một backup thủ công ngay trước migration hoặc thay đổi dữ liệu lớn.
- Mỗi tháng, khôi phục một backup vào project tạm và kiểm tra đăng nhập, order, payment, tồn kho và chốt ngày.
- Ghi lại thời điểm backup gần nhất. Với quán này, mục tiêu mất dữ liệu tối đa là 24 giờ; nếu cần thấp hơn, bật point-in-time recovery của nhà cung cấp.
- Không coi file CSV chốt ngày là bản backup database.

## 5. Pilot 3–7 ngày

### Ngày chuẩn bị

- Nhập tên quán, địa chỉ, điện thoại, MST và lời nhắn hóa đơn.
- Đổi toàn bộ mật khẩu seed, tạo tài khoản riêng cho từng nhân viên và khóa tài khoản không dùng.
- Nhập menu, giá, công thức, tồn đầu kỳ và chi phí cố định thực tế.
- In lại QR từng bàn sau khi domain production hoạt động.
- Thử máy in 80mm trên thiết bị POS và Kitchen.

### Ngày 1–2

- Chạy các order thử: QR, POS, tiền mặt, chuyển khoản, hủy món và hủy thu.
- Đối chiếu song song với sổ hoặc quy trình hiện tại.
- Chốt ngày và so sánh tiền hệ thống với tiền thực đếm.

### Ngày 3–7

- Dùng hệ thống cho giao dịch thật nhưng giữ quy trình giấy dự phòng.
- Kiểm tra `/api/health`, order chưa thu, tồn âm và chênh lệch tiền mỗi ngày.
- Chỉ bỏ quy trình dự phòng khi không còn lỗi chặn bán hàng trong ba ngày liên tiếp.

## 6. Rollback

- Nếu giao diện hoặc server lỗi, chuyển traffic về deployment Vercel ổn định gần nhất.
- Nếu migration gây lỗi, dừng ghi dữ liệu, giữ nguyên database và khôi phục từ backup vào một project khác để điều tra.
- Không tự ý chạy `prisma migrate reset`, xóa migration hoặc reset database production.
