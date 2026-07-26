# TÀI LIỆU MẪU IN BÁO CÁO GIAO DỊCH KHÁCH HÀNG (CUSTOMER TEMPLATES)

Tài liệu này định nghĩa đặc tả mẫu in đề xuất phục vụ việc in ấn sao kê/lịch sử giao dịch hoặc thông tin chi tiết của một Khách hàng trong hệ thống HungTin.

---

## 1. Mẫu in đề xuất: Biên bản đối chiếu sao kê công nợ khách hàng

### Mã mẫu đề xuất
`KH_01_001`

### Tên mẫu
Biên bản đối chiếu sao kê công nợ khách hàng

### Module
Khách hàng (Customer)

### Loại mẫu
Sao kê giao dịch / Báo cáo công nợ

### Diễn giải
Sử dụng để in sao kê toàn bộ lịch sử đóng lãi, nợ gốc, dư nợ hiện tại của một khách hàng cụ thể khi khách hàng có nhu cầu đối soát số liệu hoặc khi xảy ra tranh chấp công nợ.

### Điều kiện sử dụng
- Nhân viên vào màn hình chi tiết thông tin Khách hàng hoặc lịch sử giao dịch và bấm nút "In sao kê".

### API lấy dữ liệu bổ sung
- Endpoint backend đề xuất: `GET /api/customers/:id/statement` (trả về chi tiết công nợ kèm lịch sử tất cả hợp đồng và thu chi liên quan).

### Data Key áp dụng

| Key | Kiểu dữ liệu | Bắt buộc | Diễn giải | Nguồn dữ liệu |
| :--- | :--- | :--- | :--- | :--- |
| `{{StoreName}}` | String | Có | Tên chi nhánh quản lý khách hàng | `Store.name` |
| `{{CustomerName}}` | String | Có | Họ tên khách hàng | `Customer.full_name` |
| `{{CustomerPhone}}` | String | Có | Số điện thoại | `Customer.phone` |
| `{{CustomerAddress}}`| String | Có | Địa chỉ | `Customer.address` |
| `{{IdentityNumber}}` | String | Có | Số CCCD/CMND | `Customer.identity_card_number` |
| `{{TotalContracts}}` | Integer | Có | Tổng số hợp đồng khách hàng đã thực hiện | Đếm số lượng hợp đồng |
| `{{CurrentBalance}}` | Decimal | Có | Dư nợ gốc hiện tại của khách hàng | Tổng hợp dư nợ |
| `{{StatementTable}}` | HTML Table | Có | Bảng chi tiết danh sách giao dịch nộp/vay | Mảng lịch sử giao dịch |
