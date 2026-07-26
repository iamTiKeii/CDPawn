# TÀI LIỆU MẪU IN PHIẾU THU TIỀN MẶT (RECEIPT TEMPLATES)

Tài liệu này chi tiết cấu hình và đặc tả kỹ thuật của mẫu in Phiếu thu tiền mặt trong hệ thống HungTin.

---

## 1. Mẫu in: Phiếu thu tiền mặt tiêu chuẩn

### Mã mẫu đề xuất
`PT_01_001`

### Tên mẫu
Phiếu thu tiền mặt (Chứng từ thu tiền)

### Module
Quản lý thu chi (Vouchers)

### Loại mẫu
Chứng từ kế toán quỹ mặt

### Diễn giải
Sử dụng để in ra bàn giao cho khách hàng hoặc lưu trữ nội bộ làm bằng chứng pháp lý mỗi khi hệ thống nhận tiền mặt đầu vào (như thu tiền đóng lãi hợp đồng, khách trả bớt gốc, thu thanh lý tài sản, thu phí dịch vụ khác...).

### Điều kiện sử dụng
- Có giao dịch ghi nhận tăng quỹ tiền mặt (loại chứng từ `receipt`).
- Người dùng nhấn nút biểu tượng máy in cạnh dòng phiếu thu trong danh mục Quản lý thu chi (`Vouchers.tsx`).

### API lấy dữ liệu
- Giao diện lấy thông tin trực tiếp từ ViewModel của dòng phiếu thu đã chọn.
- Endpoint backend: `GET /api/vouchers/receipts` (danh sách) hoặc thông qua dữ liệu nạp sẵn trên bảng giao dịch.

### Data Key áp dụng

| Key | Kiểu dữ liệu | Bắt buộc | Diễn giải | Nguồn dữ liệu |
| :--- | :--- | :--- | :--- | :--- |
| `{{StoreName}}` | String | Có | Cửa hàng thu tiền | `Store.name` |
| `{{VoucherCode}}` | String | Có | Số phiếu thu duy nhất (Ví dụ: `PT-0001`) | `Voucher.voucher_code` |
| `{{RecipientName}}`| String | Có | Họ tên khách hàng / Đối tác nộp tiền | `Voucher.recipient_name` |
| `{{Amount}}` | Decimal | Có | Số tiền thu được bằng số | `Voucher.amount` |
| `{{AmountText}}` | String | Có | Số tiền viết bằng chữ | Helper function chuyển đổi |
| `{{Notes}}` | String | Không | Lý do nộp tiền chi tiết | `Voucher.notes` / `description` |
| `{{VoucherDate}}` | String | Có | Ngày giờ lập phiếu thu | `Voucher.created_at` |
| `{{EmployeeName}}` | String | Có | Nhân viên lập phiếu (Thủ quỹ/Giao dịch viên) | `Employee.full_name` |

### Hiện trạng kỹ thuật
- **Chưa có file HTML độc lập**: Đang được định nghĩa trực tiếp dạng khối JSX trong file `Vouchers.tsx` (dòng 469 đến 530) dưới dạng cấu trúc lớp CSS `.print-area`.
- **Đề xuất chuẩn hóa**: Tách riêng cấu trúc HTML phiếu thu sang file `PT_01_001.html` đặt tại `frontend/templates/` để dễ dàng căn chỉnh lề (margin) phù hợp với các dòng máy in nhiệt K80 thông dụng của cửa hàng.
