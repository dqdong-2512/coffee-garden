# Hướng dẫn sử dụng cho nhân viên và quản lý

Tài liệu này hướng dẫn nhân viên, giám sát và chủ quán sử dụng Coffee Garden trong một ngày kinh doanh thông thường. Nội dung bao gồm khách tự gọi món, nhân viên gọi món giúp khách, bếp, thanh toán, báo cáo, quản lý menu và kho, tài khoản nhân viên, phân quyền và chốt ngày.

## Truy cập và phân quyền

Mỗi nhân viên được quán cấp một username và mật khẩu tạm. Không dùng chung tài khoản vì order, thanh toán, chi phí, thay đổi kho và chốt ngày đều được ghi nhận theo nhân viên đang đăng nhập.

| Quyền | Mục đích sử dụng |
| --- | --- |
| Order | Chọn bàn, tạo order tại POS và thu tiền. |
| Bếp | Nhận order, cập nhật trạng thái chế biến, hủy order kèm lý do và in phiếu bếp. |
| Kiểm toán | Xem và quản lý order, thanh toán, doanh thu, chi phí, lợi nhuận, menu, kho, bàn và chốt ngày. |
| Super Admin | Toàn quyền, gồm tài khoản nhân viên, phân quyền, mật khẩu và cấu hình quán. |

Một nhân viên có thể nhận nhiều quyền. Ví dụ, giám sát ca có thể có quyền Order và Kiểm toán, hoặc có cả ba quyền nhân viên. Quán chỉ có duy nhất một tài khoản Super Admin.

## Danh mục trang

### Trang công khai và trang dành cho khách

| Trang | Route | Mục đích |
| --- | --- | --- |
| Trang chủ | `/` | Giới thiệu quán và cung cấp lối vào khu vực nhân viên. |
| Menu tại bàn | `/order/{tableCode}` | Cho khách gọi món tại bàn được xác định bằng QR. |
| Trạng thái order | `/order/{tableCode}/success/{orderId}` | Hiển thị order đã gửi, tổng tiền và trạng thái hiện tại từ bếp. |

### Trang vận hành cho nhân viên

| Trang | Route | Quyền cần có |
| --- | --- | --- |
| Đăng nhập | `/login` | Tài khoản nhân viên đang hoạt động |
| Danh sách bàn | `/staff/tables` | Order |
| POS | `/pos?table=T12` | Order |
| Màn hình bếp | `/kitchen` | Bếp |
| Hóa đơn khách | `/print/receipt/{orderId}` | Order hoặc Kiểm toán |
| Phiếu bếp | `/print/kitchen/{orderId}` | Order, Bếp hoặc Kiểm toán |

### Trang quản lý

| Trang | Route | Quyền cần có | Mục đích |
| --- | --- | --- | --- |
| Dashboard | `/owner/dashboard` | Kiểm toán | Tổng quan hoạt động hôm nay và trong tháng. |
| Order | `/owner/orders` | Kiểm toán | Các order QR và POS gần nhất cùng trạng thái đã lưu. |
| Doanh thu | `/owner/revenue` | Kiểm toán | Doanh thu đã thu theo kỳ, sản phẩm, danh mục và phương thức thanh toán. |
| Thanh toán | `/owner/payments` | Kiểm toán | Order đã và chưa thanh toán, chi tiết giao dịch, in lại hóa đơn và hoàn tác. |
| Chi phí | `/owner/expenses` | Kiểm toán | Ghi nhận và xem chi phí của quán. |
| Lợi nhuận | `/owner/profit` | Kiểm toán | So sánh doanh thu đã thu, giá vốn món và chi phí vận hành. |
| Sản phẩm | `/owner/products` | Kiểm toán | Thêm món, sửa giá và mô tả, bật hoặc tắt bán. |
| Danh mục | `/owner/categories` | Kiểm toán | Sắp xếp nhóm menu và kiểm soát hiển thị. |
| Nguyên liệu | `/owner/inventory` | Kiểm toán | Quản lý nguyên liệu, đơn vị, giá vốn, ngưỡng tồn và công thức. |
| Kho | `/owner/stock` | Kiểm toán | Ghi nhận nhập kho, điều chỉnh kiểm kê và xem sổ biến động. |
| Bàn | `/owner/tables` | Kiểm toán | Thêm bàn, bật hoặc tắt bàn và tải QR. |
| Chốt ngày | `/owner/reports` | Kiểm toán | Đối soát tiền mặt, khóa ngày kinh doanh, xem lịch sử và xuất CSV. |
| Nhân viên | `/owner/staff` | Super Admin | Tạo tài khoản, kết hợp quyền, đặt lại mật khẩu và vô hiệu hóa truy cập. |
| Cấu hình quán | `/owner/settings` | Super Admin | Quản lý thông tin doanh nghiệp và nội dung hóa đơn. |

### Trang chỉ dùng để xem trước

| Trang | Route | Trạng thái hiện tại |
| --- | --- | --- |
| Chi nhánh | `/owner/branches` | Bản xem trước giao diện; chưa quản lý nhiều địa điểm. |
| Phân tích bán hàng | `/owner/sales-analytics` | Bản xem trước giao diện với dữ liệu mẫu. |
| Phân tích sản phẩm | `/owner/product-analytics` | Bản xem trước giao diện với dữ liệu mẫu. |
| Phân tích bữa sáng | `/owner/breakfast-analytics` | Bản xem trước giao diện với dữ liệu mẫu. |

Không dùng số liệu ở các trang chỉ để xem trước cho quyết định tài chính hoặc vận hành.

## Đăng nhập và đăng xuất

1. Mở trang chủ và chọn **Khu vực nhân viên**, hoặc mở `/login`.
2. Nhập username và mật khẩu do quán cấp.
3. Chọn **Đăng nhập**.
4. Hệ thống mở trang chính phù hợp với quyền của tài khoản:
   - Kiểm toán hoặc Super Admin mở Dashboard quản lý.
   - Order mở danh sách bàn.
   - Bếp mở màn hình bếp.
5. Chọn **Đăng xuất** khi rời thiết bị hoặc kết thúc ca.

Nếu tài khoản có nhiều quyền, nhân viên có thể dùng route đã đánh dấu để đi thẳng đến các khu vực được phép.

## Tạo order giúp khách

Nhân viên có quyền Order dùng quy trình này khi khách không quét QR tại bàn.

1. Mở `/staff/tables`.
2. Chọn bàn của khách. Kiểm tra tên và mã bàn trước khi tiếp tục.
3. Tại POS, chọn danh mục và thêm từng món khách yêu cầu.
4. Điều chỉnh số lượng trong phần order.
5. Thêm ghi chú cho món hoặc cả order nếu khách yêu cầu thay đổi cách chế biến.
6. Chọn cách xử lý thanh toán hiển thị trên POS:
   - Chọn Tiền mặt hoặc Chuyển khoản nếu thu tiền ngay.
   - Để order chưa thanh toán nếu khách sẽ trả sau.
7. Chỉ gửi order một lần. Chờ trạng thái thành công trước khi đóng hoặc tải lại trang.
8. In hóa đơn khách hoặc phiếu bếp khi cần.

Server dùng giá hiện tại trong database và tự tính tổng tiền. Gửi lại cùng một yêu cầu sẽ không tạo order trùng.

## Khách gọi món bằng QR

1. Xác nhận QR đặt trên bàn đúng với bàn đó.
2. Hướng dẫn khách quét mã. Mã mở trực tiếp `/order/{tableCode}`.
3. Khách chọn món, số lượng và ghi chú nếu có.
4. Khách kiểm tra tên bàn và tổng tiền rồi gửi order.
5. Trang thành công hiển thị mã order và cập nhật khi bếp đổi trạng thái.

Nếu menu báo bàn không khả dụng, kiểm tra bàn đang được bật trong trang Bàn. Nếu database không hoạt động, báo cho giám sát ca và dùng quy trình offline tạm thời của quán.

## Xử lý order tại bếp

1. Đăng nhập bằng tài khoản có quyền Bếp và mở `/kitchen`.
2. Bật âm báo nếu thiết bị cho phép phát âm thanh.
3. Xem phiếu mới ở cột **Mới**, gồm bàn, số lượng, ghi chú món và ghi chú order.
4. Chọn **Bắt đầu chuẩn bị** khi bắt đầu chế biến.
5. Chọn **Sẵn sàng** khi toàn bộ món đã sẵn sàng để phục vụ.
6. Chọn **Đã phục vụ** sau khi món đến tay khách.
7. Dùng nút máy in để in phiếu bếp 80 mm khi cần.

Để hủy order đang hoạt động, chọn nút hủy, nhập lý do rõ ràng và xác nhận. Trạng thái hủy sẽ được gửi đến trang theo dõi của khách. Khi order chuyển sang Đã phục vụ, hệ thống ghi nhận lượng nguyên liệu tiêu thụ và giá vốn lịch sử của order.

## Thu tiền và kiểm tra thanh toán

### Thu tiền tại POS

Nhân viên có quyền Order có thể thu tiền khi tạo order hoặc từ danh sách **Chờ thanh toán** trong POS.

1. Chọn order chưa thanh toán.
2. Kiểm tra bàn, mã order và số tiền.
3. Chọn Tiền mặt hoặc Chuyển khoản.
4. Với chuyển khoản, nhập mã tham chiếu ngân hàng nếu có.
5. Chỉ xác nhận sau khi đã nhận tiền mặt hoặc thấy giao dịch trong tài khoản ngân hàng của quán.

Phiên bản hiện tại ghi nhận chuyển khoản thủ công và chưa tự động xác minh giao dịch ngân hàng.

### Kiểm tra hoặc hoàn tác trong khu vực quản lý

Nhân viên có quyền Kiểm toán mở `/owner/payments` để xem trạng thái, phương thức, nhân viên thu tiền và hóa đơn. Hoàn tác thanh toán bắt buộc phải nhập lý do. Chỉ dùng chức năng này để sửa giao dịch thu tiền bị ghi nhận sai; order không bị xóa.

## Xem dashboard và doanh thu

Mở `/owner/dashboard` để xem tổng quan hoạt động hiện tại. Trang này dùng order, thanh toán, chi phí và dữ liệu món đã lưu trong database.

Dùng `/owner/revenue` để xem:

- Doanh thu đã thu trong kỳ được chọn.
- Xu hướng doanh thu theo ngày.
- Doanh thu và số lượng theo món.
- Tỷ trọng doanh thu theo danh mục.
- Tỷ trọng theo Tiền mặt và Chuyển khoản.

Doanh thu chỉ bao gồm khoản đã được ghi nhận thanh toán. Order chưa thanh toán và khoản đã hoàn tác không được tính là doanh thu đã thu.

## Ghi chi phí và xem lợi nhuận

### Thêm chi phí

1. Mở `/owner/expenses`.
2. Chọn **Thêm chi phí**.
3. Nhập ngày kinh doanh, danh mục, số tiền, phương thức thanh toán, nhà cung cấp và mô tả.
4. Kiểm tra thông tin rồi lưu.
5. Tải lại trang hoặc đổi kỳ báo cáo để xác nhận chi phí đã xuất hiện.

Dùng mô tả rõ ràng để giám sát khác có thể hiểu khi đối soát.

### Xem lợi nhuận ước tính

Mở `/owner/profit` và chọn kỳ báo cáo. Lợi nhuận ước tính dựa trên doanh thu đã thu, giá vốn công thức được chụp khi order được phục vụ và chi phí vận hành không thuộc nguyên liệu. Kết quả phụ thuộc vào công thức đầy đủ, giá nguyên liệu hiện tại và dữ liệu chi phí chính xác.

## Quản lý menu

### Sản phẩm

Mở `/owner/products` để thêm món hoặc sửa tên, mô tả, danh mục, giá, thứ tự và trạng thái bán. Thay đổi trạng thái bán sẽ xuất hiện trên menu QR của khách. Khi tạm hết món, hãy chuyển sang ngừng bán thay vì xóa món.

### Danh mục

Mở `/owner/categories` để tạo hoặc đổi tên nhóm menu, thay đổi thứ tự và kiểm soát hiển thị. Ẩn danh mục sẽ ẩn các món thuộc danh mục đó khỏi menu khách.

Sau khi đổi menu, mở menu của một bàn trong cửa sổ riêng tư để kiểm tra giao diện khách nhìn thấy.

## Quản lý nguyên liệu, công thức và tồn kho

### Nguyên liệu và công thức

Mở `/owner/inventory` để:

- Thêm hoặc sửa nguyên liệu.
- Chọn đơn vị cơ sở: gram, mililit hoặc phần.
- Đặt giá vốn hiện tại và ngưỡng cảnh báo tồn thấp.
- Khai báo lượng nguyên liệu mỗi món sử dụng.

Độ chính xác của công thức ảnh hưởng trực tiếp đến lượng trừ kho và lợi nhuận ước tính.

### Biến động kho

Mở `/owner/stock` và chọn **Cập nhật kho**.

- Dùng Nhập kho khi nhận hàng. Nhập số lượng và đơn giá.
- Dùng Điều chỉnh kiểm kê sau khi đếm tồn thực tế.
- Xem các dòng Tiêu thụ tự động được tạo khi order được phục vụ.

Không dùng điều chỉnh thủ công để che giấu hao hụt chưa rõ nguyên nhân. Hãy ghi nhận số đếm thật và thêm ghi chú hữu ích để có thể điều tra chênh lệch.

## Quản lý bàn và mã QR

1. Mở `/owner/tables`.
2. Thêm hoặc sửa tên và mã bàn.
3. Giữ bàn ở trạng thái hoạt động khi bàn có thể nhận khách.
4. Chọn **Xem QR** và xác nhận liên kết dùng đúng domain công khai cùng mã bàn.
5. Tải và in mã QR.
6. Quét thử mã đã in trước khi đặt lên bàn.

Tạo và in lại QR sau khi đổi domain production.

## Tạo tài khoản và phân quyền nhân viên

Chỉ Super Admin có thể mở `/owner/staff`.

### Tạo nhân viên

1. Chọn **Thêm nhân viên**.
2. Nhập username duy nhất, viết thường, do quán cấp, ví dụ `dqdong`.
3. Nhập họ tên đầy đủ của nhân viên.
4. Chọn một hoặc nhiều quyền theo nhiệm vụ thực tế.
5. Đặt mật khẩu tạm dài ít nhất tám ký tự, có ít nhất một chữ cái và một chữ số.
6. Lưu tài khoản và gửi thông tin đăng nhập trực tiếp cho nhân viên.

Ví dụ phân quyền:

| Nhiệm vụ | Quyền đề xuất |
| --- | --- |
| Phục vụ hoặc thu ngân | Order |
| Bếp hoặc quầy pha chế | Bếp |
| Kế toán hoặc quản lý vận hành | Kiểm toán |
| Giám sát ca vừa phục vụ vừa kiểm tra hoạt động | Order và Kiểm toán |
| Giám sát thay thế được mọi vị trí | Order, Bếp và Kiểm toán |

### Đổi quyền hoặc trạng thái

Dùng nút sửa bên cạnh nhân viên để đổi tên hiển thị, kết hợp quyền hoặc vô hiệu hóa đăng nhập. Đổi quyền hoặc vô hiệu hóa sẽ làm các session hiện có của nhân viên mất hiệu lực.

Dùng nút hình chìa khóa để đặt mật khẩu tạm mới. Đặt lại mật khẩu cũng làm session cũ mất hiệu lực.

Super Admin duy nhất không thể bị vô hiệu hóa hoặc giảm quyền trong ứng dụng. Chủ quán cần giữ quyền kiểm soát tài khoản này.

## Cấu hình thông tin quán

Chỉ Super Admin có thể mở `/owner/settings`. Cập nhật tên quán, địa chỉ, số điện thoại, mã số thuế và lời cuối hóa đơn. Các giá trị này được dùng chung trong khu vực Quản lý, POS, Bếp, QR bàn và trang in.

## Hoàn tất chốt ngày

1. Xác nhận mọi khoản thanh toán, hoàn tác và chi phí tiền mặt trong ngày đã được nhập.
2. Mở `/owner/reports` và chọn ngày kinh doanh.
3. Kiểm tra tổng đã thu, doanh thu tiền mặt, chuyển khoản, chi phí tiền mặt, order chưa thanh toán và khoản hoàn tác.
4. Nhập tiền mặt có trong két lúc đầu ca.
5. Đếm tiền mặt thực tế trong két và nhập số đã đếm.
6. Kiểm tra số tiền kỳ vọng và chênh lệch do hệ thống tính.
7. Thêm ghi chú bàn giao hoặc giải thích chênh lệch.
8. Chọn **Xác nhận chốt ngày**.
9. Xuất lịch sử chốt dưới dạng CSV khi cần.

Ngày đã xác nhận chốt không thể sửa và mỗi ngày kinh doanh chỉ có một bản ghi. Hãy xử lý lỗi nhập dữ liệu trước khi xác nhận.

## In hóa đơn và phiếu bếp

Trang hóa đơn và phiếu bếp được thiết kế cho máy in 80 mm. Kiểm tra bản xem trước khi in, chọn đúng máy in hóa đơn, đặt khổ giấy 80 mm và tắt đầu trang cùng chân trang của trình duyệt nếu chúng xuất hiện.

Hóa đơn khách hiển thị thông tin quán, món, tổng tiền, trạng thái thanh toán và nhân viên liên quan nếu có. Phiếu bếp làm nổi bật bàn, số lượng và ghi chú chế biến.

## Danh sách kiểm tra cuối ca

1. Xác nhận không bỏ quên phiếu đang hoạt động trên màn hình Bếp.
2. Kiểm tra order chưa thanh toán và khoản đã hoàn tác.
3. Nhập chi phí và phiếu nhập kho còn thiếu.
4. Đếm tiền và hoàn tất Chốt ngày.
5. Thêm ghi chú bàn giao rõ ràng cho ca sau.
6. Đăng xuất trên thiết bị dùng chung.

## Các lỗi thường gặp

| Vấn đề | Cách xử lý |
| --- | --- |
| Không đăng nhập được | Kiểm tra lại username và mật khẩu, sau đó nhờ Super Admin xác nhận tài khoản còn hoạt động hoặc đặt lại mật khẩu. |
| Trang tự chuyển sang nơi khác | Tài khoản không có quyền cần thiết. Nhờ Super Admin kiểm tra lại phân quyền. |
| Order mới không xuất hiện tại Bếp | Kiểm tra chỉ báo kết nối, tải lại trang Bếp và nhờ giám sát kiểm tra `/api/health`. |
| Món không xuất hiện trên menu QR | Xác nhận cả món và danh mục của món đều đang hoạt động. |
| QR mở sai bàn | In lại QR từ trang Bàn và thay nhãn sai. |
| Doanh thu thấp hơn dự kiến | Kiểm tra order chưa thanh toán, khoản hoàn tác và kỳ báo cáo đã chọn. |
| Lợi nhuận không chính xác | Kiểm tra định lượng công thức, giá nguyên liệu, trạng thái Đã phục vụ và dữ liệu chi phí. |
| Tồn kho bị âm | Kiểm tra lượng tiêu thụ gần đây, phiếu nhập, định lượng công thức và điều chỉnh kiểm kê. |
