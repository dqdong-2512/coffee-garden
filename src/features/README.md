# Các module nghiệp vụ

Mỗi thư mục trong `src/features` phụ trách validation, query, service và kiểu dữ liệu hiển thị của một nghiệp vụ. Component giao diện sử dụng các module này và không trực tiếp thực hiện transaction với database.

Các module hiện có bao gồm xác thực, menu, order, POS, thanh toán, tài chính, kho, chốt ngày, quản lý, in ấn và cấu hình quán. Xem [Kiến trúc và bảo mật](../../docs/ARCHITECTURE.md) để biết đầy đủ trách nhiệm của từng module và các ranh giới bảo mật.
