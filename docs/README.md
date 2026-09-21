# Tài liệu Coffee Garden

Thư mục này chứa các tài liệu được duy trì cho việc phát triển, kiểm thử, vận hành và sử dụng Coffee Garden.

## Bắt đầu từ đây

| Tài liệu | Đối tượng | Mục đích |
| --- | --- | --- |
| [Phát triển tại local](LOCAL_DEVELOPMENT.md) | Lập trình viên và người review | Cài dependency, khởi động PostgreSQL, tạo dữ liệu mẫu và chạy ứng dụng tại local. |
| [Hướng dẫn sử dụng cho nhân viên và quản lý](USER_GUIDE.md) | Nhân viên, giám sát và chủ quán | Sử dụng các trang vận hành, xử lý order, xem báo cáo và quản lý quyền nhân viên. |
| [Kiến trúc và bảo mật](ARCHITECTURE.md) | Lập trình viên và người vận hành kỹ thuật | Hiểu cấu trúc ứng dụng, ranh giới dữ liệu, xác thực và phân quyền. |
| [Kiểm thử và nghiệm thu](TESTING.md) | Lập trình viên và người review bản phát hành | Chạy kiểm tra tự động và nghiệm thu toàn bộ quy trình thực tế. |
| [Triển khai và vận hành](DEPLOYMENT.md) | Chủ quán và người phụ trách triển khai | Chuẩn bị môi trường production, triển khai, sao lưu, chạy thử và khôi phục sự cố. |
| [Sổ tay nhân viên để in](Huong-Dan-Su-Dung-Coffee-Garden.docx) | Nhân viên và người đào tạo | Tài liệu vận hành dễ in, được tạo từ hướng dẫn sử dụng trên web. |

## Quy tắc quản lý tài liệu

- Giữ `README.md` ở thư mục gốc ngắn gọn và dùng làm điểm bắt đầu của dự án.
- Đặt nội dung chi tiết vào đúng tài liệu phụ trách chủ đề đó.
- Cập nhật `USER_GUIDE.md` và sổ tay để in khi trang vận hành hoặc quyền truy cập thay đổi.
- Cập nhật `ARCHITECTURE.md` khi xác thực, model database hoặc ranh giới feature thay đổi.
- Cập nhật `DEPLOYMENT.md` khi biến môi trường hoặc lệnh phát hành thay đổi.
- Không lưu mật khẩu, chuỗi kết nối hoặc secret của production trong tài liệu.
