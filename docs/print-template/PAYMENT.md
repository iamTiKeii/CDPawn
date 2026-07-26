# TÀI LIỆU MẪU IN PHIẾU CHI TIỀN MẶT (PAYMENT TEMPLATES)

Tài liệu này chi tiết cấu hình và đặc tả kỹ thuật của mẫu in Phiếu chi tiền mặt trong hệ thống HungTin.

---

## 1. Mẫu in: Phiếu chi tiền mặt tiêu chuẩn

### Mã mẫu đề xuất
`PC_01_001`

### Tên mẫu
Phiếu chi tiền mặt (Chứng từ xuất quỹ)

### Module
Quản lý thu chi (Vouchers)

### Loại mẫu
Chứng từ kế toán quỹ mặt

### Diễn giải
Sử dụng để in ra và ký nhận khi hệ thống thực hiện chi tiền mặt đầu ra (như chi trả lương nhân viên, chi phí mặt bằng, chi mua văn phòng phẩm, chi sửa chữa cửa hàng...).

### Điều kiện sử dụng
- Có giao dịch xuất quỹ tiền mặt (loại chứng từ `payment`).
- Người dùng nhấn nút in phiếu chi trong danh mục Quản lý thu chi (`Vouchers.tsx`).

### API lấy dữ liệu
- Endpoint backend: `GET /api/vouchers/payments`

### Data Key áp dụng

| Key | Kiểu dữ liệu | Bắt buộc | Diễn giải | Nguồn dữ liệu |
| :--- | :--- | :--- | :--- | :--- |
| `{{StoreName}}` | String | Có | Chi nhánh thực hiện chi tiền | `Store.name` |
| `{{VoucherCode}}` | String | Có | Số phiếu chi duy nhất (Ví dụ: `PC-0001`) | `Voucher.voucher_code` |
| `{{RecipientName}}`| String | Có | Họ tên người nhận tiền mặt | `Voucher.recipient_name` |
| `{{Amount}}` | Decimal | Có | Số tiền chi bằng số | `Voucher.amount` |
| `{{AmountText}}` | String | Có | Số tiền viết bằng chữ | Helper function |
| `{{Notes}}` | String | Không | Lý do chi tiền | `Voucher.notes` / `description` |
| `{{VoucherDate}}` | String | Có | Ngày giờ xuất quỹ | `Voucher.created_at` |
| `{{EmployeeName}}` | String | Có | Nhân viên lập phiếu / Thủ quỹ | `Employee.full_name` |

### Hiện trạng kỹ thuật
- **Chưa có file HTML độc lập**: Đang được định nghĩa trực tiếp dạng khối JSX trong file `Vouchers.tsx` (dòng 469 đến 530) dưới dạng cấu trúc lớp CSS `.print-area`.
- **Đề xuất chuẩn hóa**: Tách cấu trúc HTML phiếu chi sang file `PC_01_001.html` đặt tại `frontend/templates/` để dễ dàng căn chỉnh lề (margin) phù hợp với các dòng máy in nhiệt K80 thông dụng của cửa hàng.
