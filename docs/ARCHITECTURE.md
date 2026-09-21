# Kiến trúc và bảo mật

Coffee Garden là ứng dụng Next.js dành cho một quán, sử dụng PostgreSQL. Ứng dụng tách luồng khách tự gọi món khỏi các chức năng nội bộ cần đăng nhập, đồng thời dùng chung menu và database order.

## Công nghệ

- Next.js 16 App Router và React 19.
- TypeScript và Zod để validation.
- PostgreSQL với Prisma ORM và PostgreSQL driver adapter.
- Các service Supabase tại local chạy qua Docker.
- Session nhân viên được ký và lưu trong cookie `HttpOnly`; mật khẩu được băm bằng `scrypt`.

## Các khu vực của ứng dụng

| Khu vực | Vị trí chính | Trách nhiệm |
| --- | --- | --- |
| Route và API | `src/app` | Page, layout, route handler, health check và route in ấn. |
| Menu khách hàng | `src/features/catalog` | Query menu công khai và dữ liệu hiển thị cho khách. |
| Order | `src/features/orders` | Validation, tính tổng tiền, chống gửi trùng, chuyển trạng thái và truy vấn order đã lưu. |
| Xác thực nhân viên | `src/features/auth`, `src/lib/auth` | Kiểm tra đăng nhập, băm mật khẩu, session, phân quyền và điều hướng theo quyền. |
| POS | `src/features/pos` | Nhân viên gọi món, chọn bàn và xem order chưa thanh toán. |
| Thanh toán | `src/features/payments` | Thu tiền, tính tổng từ server và hoàn tác thanh toán. |
| Tài chính | `src/features/finance` | Chi phí, kỳ báo cáo, doanh thu, dòng tiền và lợi nhuận ước tính. |
| Kho | `src/features/inventory` | Nguyên liệu, công thức, nhập kho, điều chỉnh và tự động trừ kho. |
| Chốt ngày | `src/features/closing` | Đối soát tiền mặt, bản ghi chốt không thể sửa và xuất CSV. |
| Cấu hình quán | `src/features/settings` | Tài khoản nhân viên, quyền, đặt lại mật khẩu và thông tin quán. |
| In ấn | `src/features/printing`, `src/ui/print` | Hóa đơn và phiếu bếp 80 mm có kiểm tra quyền. |
| Database | `prisma` | Schema, migration và dữ liệu seed rõ ràng. |

## Mô hình tài khoản và phân quyền

Mỗi nhân viên dùng username và password do quán cấp. Một nhân viên có thể nhận một hoặc nhiều quyền.

| Quyền | Phạm vi truy cập |
| --- | --- |
| Order | Danh sách bàn, POS và thu tiền. |
| Bếp | Màn hình bếp, chuyển trạng thái, hủy order và in phiếu bếp. |
| Kiểm toán | Dashboard quản lý, order, thanh toán, doanh thu, chi phí, lợi nhuận, menu, kho, bàn và chốt ngày. |
| Super Admin | Có toàn bộ quyền, cộng thêm quản lý nhân viên và cấu hình quán. |

Database dùng unique partial index để bảo đảm chỉ có một Super Admin. Service của ứng dụng ngăn vô hiệu hóa hoặc giảm quyền tài khoản này. API tạo nhân viên không cho phép tạo thêm Super Admin.

Khi đổi quyền, vô hiệu hóa tài khoản hoặc đặt lại mật khẩu, hệ thống tăng phiên bản session của nhân viên. Các session hiện có sẽ ngừng hoạt động ngay sau thay đổi.

## Ranh giới tin cậy

- Server tính tổng order từ giá hiện tại trong PostgreSQL; giá do trình duyệt gửi lên bị bỏ qua.
- Nếu `clientRequestId` bị gửi lại, server trả về order đã có thay vì tạo bản ghi trùng.
- Số tiền thanh toán được tính từ tổng tiền của order đã lưu.
- Hoàn tác thanh toán cần quyền Kiểm toán và phải có lý do.
- Việc kiểm tra quyền Order, Bếp, Kiểm toán và Super Admin được thực hiện tại server page và API handler.
- Các route công khai cho khách không để lộ dữ liệu quản lý hoặc nhân viên.

## Tài chính và kho

Doanh thu dùng hóa đơn đã thanh toán. Lợi nhuận ước tính lấy doanh thu trừ giá vốn công thức được chụp lại khi phục vụ order và các chi phí vận hành không thuộc nguyên liệu. Khoản mua nguyên liệu vẫn hiển thị trong báo cáo dòng tiền nhưng không bị trừ hai lần khỏi lợi nhuận ước tính.

Khi bếp chuyển order sang Đã phục vụ, hệ thống ghi nhận lượng nguyên liệu tiêu thụ và lưu giá vốn lịch sử của order. Phiếu nhập kho và điều chỉnh theo kiểm kê thực tế vẫn được lưu trong sổ biến động kho.

## Quy ước quản lý dữ liệu

- Prisma migration được lưu trong `prisma/migrations` và áp dụng bằng `npm run db:deploy` ngoài môi trường phát triển.
- Bộ chạy migration và seed của Supabase bị tắt; Prisma quản lý lịch sử schema.
- Seed chỉ tạo dữ liệu mẫu còn thiếu, không thay thế mật khẩu nhân viên hoặc thay đổi menu đã có.
- Bản ghi chốt ngày không thể sửa và mỗi ngày kinh doanh chỉ có một bản ghi.
