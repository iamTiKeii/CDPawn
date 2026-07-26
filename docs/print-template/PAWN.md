# TÀI LIỆU MẪU IN PHÂN HỆ CẦM ĐỒ (PAWN TEMPLATES)

Tài liệu này chi tiết cấu hình và đặc tả kỹ thuật của các mẫu in áp dụng trong nghiệp vụ Cầm đồ của hệ thống HungTin.

---

## 1. Mẫu in: Hợp đồng cầm đồ tính theo Lãi suất

### Mã mẫu
`CD_01_001`

### Tên mẫu
Hợp đồng cầm đồ (Mẫu lãi suất)

### Module
Cầm đồ (Pawn)

### Loại mẫu
Lãi suất cố định/định kỳ

### Diễn giải
Mẫu hợp đồng cầm đồ chính thức, áp dụng khi cửa hàng tính phí lãi vay theo tỷ lệ % cố định trên một chu kỳ/ngày xác định. Hợp đồng kiêm phiếu chi tiền mặt.

### Điều kiện sử dụng
- Hợp đồng cầm đồ được tạo mới hoặc đang hoạt động.
- Người dùng chọn cấu hình mẫu in là "Mẫu lãi suất" (lưu trong `localStorage` key `pawn_print_template` giá trị `interest`).

### API lấy dữ liệu
- Giao diện gọi trực tiếp từ ViewModel chứa thông tin chi tiết hợp đồng đã tải.
- Endpoint chi tiết hợp đồng trên backend: `GET /api/pawn/:id`

### Data Key áp dụng

| Key | Kiểu dữ liệu | Bắt buộc | Diễn giải |
| :--- | :--- | :--- | :--- |
| `{{StoreName}}` | String | Có | Tên cửa hàng nhận cầm tài sản |
| `{{StorePhone}}` | String | Có | Hotline liên hệ của cửa hàng |
| `{{StoreAddress}}` | String | Có | Địa chỉ giao dịch của cửa hàng |
| `{{Representative}}` | String | Có | Trưởng PGD / Đại diện bên cầm đồ |
| `{{ContractCode}}` | String | Có | Mã giao dịch hợp đồng cầm đồ (Ví dụ: `CD-0001`) |
| `{{ContractDate}}` | String | Có | Ngày lập hợp đồng cầm đồ |
| `{{CustomerName}}` | String | Có | Họ và tên khách hàng đi cầm |
| `{{CustomerPhone}}` | String | Có | Số điện thoại liên hệ của khách hàng |
| `{{CustomerAddress}}` | String | Có | Nơi đăng ký thường trú hoặc địa chỉ hiện tại |
| `{{IdentityNumber}}` | String | Có | Số CCCD/CMND của khách hàng |
| `{{IdentityIssueDate}}` | String | Không | Ngày cấp thẻ căn cước công dân |
| `{{IdentityIssuePlace}}` | String | Không | Cơ quan cấp thẻ căn cước |
| `{{AssetType}}` | String | Có | Loại tài sản nhận cầm (Ví dụ: Xe máy, Ô tô...) |
| `{{AssetDetail}}` | String | Không | Chi tiết tài sản: Biển số, số máy, số khung... |
| `{{LoanAmount}}` | Decimal | Có | Tổng số tiền vay bằng số |
| `{{LoanAmountText}}` | String | Có | Số tiền bằng chữ tiếng Việt |
| `{{LoanStartDate}}` | String | Có | Ngày ký/giải ngân |
| `{{LoanEndDate}}` | String | Có | Ngày hết hạn hợp đồng / Ngày thanh lý dự kiến |
| `{{InterestRate}}` | Decimal | Có | Mức phần trăm lãi suất cố định |

### File HTML nguồn
[hop-dong-cam-do-lai-suat.html](file:///Users/suns/Downloads/OutSource/HungTin/frontend/templates/hop-dong-cam-do-lai-suat.html)

### File Markdown nguồn
[hop-dong-cam-do-lai-suat.md](file:///Users/suns/Downloads/OutSource/HungTin/frontend/templates/hop-dong-cam-do-lai-suat.md)

### Người được phép sử dụng
- Giao dịch viên
- Quản trị viên chi nhánh / Trưởng phòng giao dịch
- Quản trị viên hệ thống

### Ghi chú
Bản in hiển thị điều khoản cam kết số 1 có hiển thị mức phần trăm phí: `"Tự nguyện chi trả lệ phí: {{InterestRate}}%/T"`.

---

## 2. Mẫu in: Hợp đồng cầm đồ theo Lãi thỏa thuận

### Mã mẫu
`CD_02_001`

### Tên mẫu
Hợp đồng cầm đồ (Mẫu lãi thỏa thuận)

### Module
Cầm đồ (Pawn)

### Loại mẫu
Lãi thỏa thuận dân sự

### Diễn giải
Mẫu hợp đồng áp dụng khi hai bên tự nguyện thỏa thuận miệng hoặc thỏa thuận ngoài về lãi phí mà không ghi con số phần trăm cụ thể vào văn bản hợp đồng in ra để bảo mật thông tin lãi suất.

### Điều kiện sử dụng
- Người dùng chọn cấu hình mẫu in là "Mẫu thỏa thuận" (lưu trong `localStorage` key `pawn_print_template` giá trị `negotiated`).

### API lấy dữ liệu
- Endpoint chi tiết hợp đồng trên backend: `GET /api/pawn/:id`

### Data Key áp dụng
Tương tự mẫu `CD_01_001` nhưng không sử dụng key `{{InterestRate}}`.

### File HTML nguồn
[hop-dong-cam-do-lai-thoa-thuan.html](file:///Users/suns/Downloads/OutSource/HungTin/frontend/templates/hop-dong-cam-do-lai-thoa-thuan.html)

### File Markdown nguồn
[hop-dong-cam-do-lai-thoa-thuan.md](file:///Users/suns/Downloads/OutSource/HungTin/frontend/templates/hop-dong-cam-do-lai-thoa-thuan.md)

### Người được phép sử dụng
- Giao dịch viên, Quản trị viên.

### Ghi chú
Bản in hiển thị điều khoản cam kết số 1 là: `"Tự nguyện chi trả lệ phí: Thỏa thuận"`.
