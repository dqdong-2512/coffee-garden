# Triển khai và vận hành

Tài liệu vận hành này chuẩn bị Coffee Garden cho một quán kinh doanh, sử dụng dịch vụ host Next.js và PostgreSQL được quản lý. Không dùng database local hoặc `prisma migrate dev` cho hệ thống đang bán hàng.

## Dịch vụ production

1. Tạo một dự án PostgreSQL được quản lý tại Singapore hoặc khu vực lân cận và bật sao lưu tự động hằng ngày.
2. Tạo dự án hosting từ repository Coffee Garden trên gói cho phép sử dụng thương mại.
3. Chuẩn bị domain HTTPS công khai, ví dụ `order.coffeegarden.vn`.
4. Đặt ứng dụng web và database ở các khu vực gần nhau để giảm độ trễ cho khách tại Việt Nam.
5. Dùng database production và preview riêng nếu bản preview cần lưu dữ liệu thật.

Vercel và Supabase PostgreSQL được quản lý là hướng triển khai hiện được đề xuất. Có thể dùng nhà cung cấp Next.js và PostgreSQL thương mại tương đương.

## Biến môi trường

Cấu hình các giá trị sau trên nền tảng hosting. Chỉ cấp secret của production cho môi trường Production. Chỉ cấp cho Preview khi Preview dùng database tách biệt.

| Biến | Mục đích |
| --- | --- |
| `DATABASE_URL` | URL PostgreSQL qua connection pool cho ứng dụng đang chạy. |
| `DIRECT_URL` | URL PostgreSQL trực tiếp cho Prisma migration. |
| `AUTH_SESSION_SECRET` | Secret ngẫu nhiên cho session, dài ít nhất 32 ký tự. |
| `PUBLIC_APP_URL` | Origin HTTPS công khai, không có path ở cuối. |
| `SEED_OWNER_USERNAME` | Username của Super Admin đầu tiên và duy nhất. |
| `SEED_OWNER_PASSWORD` | Mật khẩu ban đầu của Super Admin. |
| `SEED_CASHIER_USERNAME` | Username nhân viên ban đầu có quyền Order. |
| `SEED_CASHIER_PASSWORD` | Mật khẩu ban đầu của nhân viên Order. |
| `SEED_KITCHEN_USERNAME` | Username nhân viên ban đầu có quyền Bếp. |
| `SEED_KITCHEN_PASSWORD` | Mật khẩu ban đầu của nhân viên Bếp. |

Tạo session secret bằng Node.js:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Không đưa secret vào Git, ảnh chụp màn hình, ticket hoặc tài liệu. Sau lần seed đầu, đổi toàn bộ mật khẩu khởi tạo trong trang Nhân viên. Có thể xóa biến mật khẩu seed khỏi môi trường chạy sau khi các tài khoản cần thiết đã tồn tại.

## Phát hành lần đầu

Chạy các lệnh sau từ môi trường tin cậy đã có biến production:

```powershell
npm ci
npm run production:seed-check
npm run db:deploy
npm run db:seed
npm run build
```

Triển khai ứng dụng, gắn domain rồi chạy:

```powershell
npm run production:smoke -- https://order.coffeegarden.vn
```

`/api/health` phải trả HTTP 200 với cả `status` và `database` là `ok`. Không bắt đầu bán hàng khi endpoint này trả 503.

Các lần phát hành tiếp theo cần chạy `production:check`, `db:deploy`, test tự động, production build, triển khai và smoke test. Không chạy seed như một bước thường xuyên sau lần phát hành đầu.

## Chuẩn bị cho quán

Trước khi nhận order thật:

- Đổi toàn bộ mật khẩu seed.
- Giữ tài khoản Super Admin duy nhất dưới quyền kiểm soát của chủ quán.
- Tạo tài khoản riêng cho từng nhân viên và chỉ cấp quyền cần cho công việc.
- Nhập tên quán, địa chỉ, điện thoại, mã số thuế và lời cuối hóa đơn thật.
- Thay món mẫu, giá, công thức, giá nguyên liệu, tồn đầu và chi phí bằng dữ liệu thật.
- Xác nhận domain công khai và in lại QR của mọi bàn.
- Test từng máy in 80 mm trên đúng thiết bị và trình duyệt sẽ dùng tại quán.
- Xác nhận quy trình Tiền mặt và Chuyển khoản phù hợp cách đối soát thực tế của quán.

## Sao lưu và khôi phục

- Bật sao lưu hằng ngày của nhà cung cấp và giữ ít nhất bảy bản gần nhất.
- Tạo bản sao lưu thủ công ngay trước migration hoặc thay đổi dữ liệu lớn.
- Mỗi tháng khôi phục một bản sao vào dự án tạm và test đăng nhập, gọi món, thanh toán, kho và chốt ngày.
- Ghi lại lần sao lưu và test khôi phục thành công gần nhất.
- Ban đầu, đặt mục tiêu mất dữ liệu tối đa là 24 giờ. Bật khôi phục theo thời điểm nếu quán cần mục tiêu ngắn hơn.
- File CSV chốt ngày đã xuất không phải là bản sao lưu database.

## Giai đoạn chạy thử

Chạy thử có kiểm soát từ ba đến bảy ngày trước khi phụ thuộc hoàn toàn vào hệ thống cho mọi giao dịch.

### Ngày chuẩn bị

- Hoàn tất danh sách chuẩn bị cho quán ở trên.
- In và quét QR của mọi bàn.
- Test order QR của khách, order POS của nhân viên, thay đổi trạng thái Bếp, hóa đơn và phiếu bếp.

### Ngày một và ngày hai

- Chạy các order QR và POS đại diện bằng Tiền mặt và Chuyển khoản.
- Test hủy order và hoàn tác thanh toán với lý do rõ ràng.
- Đối soát ứng dụng với sổ hoặc quy trình giấy hiện tại của quán.
- Hoàn tất Chốt ngày và so sánh tiền mặt kỳ vọng với tiền thực tế.

### Ngày ba đến ngày bảy

- Dùng hệ thống cho giao dịch thật và vẫn giữ quy trình dự phòng tạm thời của quán.
- Kiểm tra `/api/health`, order chưa thanh toán, tồn kho âm và chênh lệch tiền mặt mỗi ngày.
- Chỉ ngừng quy trình dự phòng sau ba ngày vận hành liên tiếp không có lỗi cản trở bán hàng.

## Công việc vận hành định kỳ

- Xử lý sớm health check thất bại và cảnh báo database.
- Kiểm tra khoản chờ thanh toán và giao dịch hoàn tác bất thường hằng ngày.
- Hoàn tất Chốt ngày cho từng ngày kinh doanh.
- Rà soát quyền nhân viên khi nhiệm vụ thay đổi và vô hiệu hóa tài khoản ngay khi nhân viên nghỉ việc.
- Theo dõi tồn thấp, tồn âm và cập nhật công thức cùng giá nguyên liệu.
- Áp dụng dependency và migration qua bản phát hành đã review, không sửa trực tiếp trên server đang bán hàng.

## Quay lại phiên bản ổn định

Nếu bản phát hành ứng dụng lỗi, chuyển traffic về bản triển khai ổn định gần nhất.

Nếu migration gây lỗi dữ liệu:

1. Dừng thao tác ghi của ứng dụng.
2. Giữ nguyên database bị ảnh hưởng để điều tra.
3. Khôi phục bản sao lưu an toàn gần nhất vào một dự án database khác.
4. Kiểm tra đăng nhập, gọi món, thanh toán, kho và chốt ngày trước khi chuyển traffic.

Không chạy `prisma migrate reset`, xóa lịch sử migration hoặc reset database production để xử lý sự cố đang diễn ra.
