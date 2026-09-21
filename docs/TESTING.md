# Kiểm thử và nghiệm thu

Tài liệu này mô tả các bước kiểm tra tự động và quy trình review thực tế cho toàn bộ hoạt động của quán.

## Kiểm tra tự động

Các lệnh sau không cần database đang chạy:

```powershell
npm test
npm run lint
npm run build
```

Khi database local đã chạy, được migrate và seed:

```powershell
npm run test:db
```

Bộ test tự động bao phủ băm mật khẩu, phát hiện session bị sửa, redirect an toàn, tổ hợp quyền, validation, chống trùng order, chuyển trạng thái bếp, tổng tiền và hoàn tác thanh toán, tiêu thụ nguyên liệu, tổng hợp tài chính, vô hiệu hóa session, cấu hình quán và bản ghi chốt ngày không thể sửa.

## Quy trình nghiệm thu end-to-end

1. Mở `/owner/dashboard` khi chưa đăng nhập và xác nhận ứng dụng chuyển đến `/login`.
2. Đăng nhập bằng `owner` và xác nhận nhìn thấy mục Nhân viên và Cấu hình quán.
3. Mở Sản phẩm, chuyển một món sang trạng thái ngừng bán và xác nhận món biến mất khỏi `/order/T12` trong cửa sổ riêng tư. Sau đó bật lại món.
4. Mở Bàn, xem trước QR của T12 và xác nhận liên kết mở `/order/T12`.
5. Đăng nhập bằng `kitchen`. Xác nhận mở được `/kitchen` nhưng không mở được `/owner/dashboard`.
6. Đăng nhập bằng `cashier`, mở `/staff/tables`, chọn bàn, thêm món tại POS, chọn Tiền mặt hoặc Chuyển khoản và gửi order.
7. Xác nhận order POS xuất hiện trên màn hình Bếp và trong danh sách Order quản lý với nguồn `POS`.
8. Tạo một order QR chưa thanh toán và dùng hộp thoại Chờ thanh toán trong POS để thu tiền.
9. Đăng nhập bằng Super Admin hoặc nhân viên có quyền Kiểm toán. Mở Thanh toán và hoàn tác một giao dịch test kèm lý do.
10. Khách tạo order gồm một Bún bò Huế và hai Cà phê sữa. Xác nhận tổng tiền là `115.000 VND`.
11. Chuyển order lần lượt qua Mới, Đang chuẩn bị, Sẵn sàng và Đã phục vụ trong Bếp.
12. Xác nhận trang trạng thái order của khách được cập nhật và order đã phục vụ xuất hiện trong danh sách Order quản lý.
13. Thêm một chi phí test nhỏ và xác nhận dữ liệu vẫn còn sau khi tải lại trang.
14. Mở Dashboard, Doanh thu và Lợi nhuận. Xác nhận order đã thanh toán và chi phí xuất hiện trong kỳ đã chọn.
15. Mở Nguyên liệu, xem một công thức và lưu một thay đổi test nhỏ nếu cần.
16. Mở Kho, ghi nhận nhập kho hoặc điều chỉnh kiểm kê và xác nhận dữ liệu vẫn còn sau khi tải lại trang.
17. Phục vụ một order và xác nhận sổ kho có dòng tự động trừ nguyên liệu.
18. Mở Chốt ngày, nhập tiền mặt đầu ca và tiền mặt kiểm đếm, sau đó kiểm tra số tiền kỳ vọng và chênh lệch.
19. Xác nhận chốt ngày, tải lại trang và xuất lịch sử chốt dưới dạng CSV.
20. Mở Nhân viên, tạo một tài khoản tạm có cả quyền Order và Kiểm toán, sau đó đặt lại mật khẩu.
21. Đăng nhập bằng tài khoản tạm. Sau đó dùng Super Admin vô hiệu hóa tài khoản và xác nhận session hiện có bị từ chối.
22. Lưu tên quán, địa chỉ, điện thoại, mã số thuế và lời cuối hóa đơn trong Cấu hình quán.
23. Xác nhận tên quán đã lưu xuất hiện trong khu vực Quản lý, POS, Bếp và các trang in.
24. In hóa đơn khách và phiếu bếp từ một order POS.
25. In lại hóa đơn cũ từ trang Thanh toán và kiểm tra phương thức thanh toán, tên nhân viên, món, ghi chú và thông tin quán.

## Điều kiện phát hành

Bản phát hành sẵn sàng để review khi tất cả kiểm tra tự động đều đạt, `/api/health` trả HTTP 200 với cả trạng thái ứng dụng và database là `ok`, đồng thời quy trình vận hành có thay đổi vượt qua các bước nghiệm thu liên quan ở trên.
