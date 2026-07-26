# TÀI LIỆU MẪU IN PHÂN HỆ VAY TÍN CHẤP (UNSECURED LOAN TEMPLATES)

Tài liệu này chi tiết cấu hình và đặc tả kỹ thuật của các mẫu in áp dụng trong nghiệp vụ Cho vay Tín chấp của hệ thống HungTin.

---

## 1. Mẫu in: Hợp đồng cho vay tín chấp tiêu dùng

### Mã mẫu
`TC_01_001`

### Tên mẫu
Hợp đồng cho vay tín chấp (Tự nguyện dân sự)

### Module
Tín chấp (Unsecured)

### Loại mẫu
Lãi suất / Lãi thỏa thuận tùy chọn

### Diễn giải
Mẫu hợp đồng cho vay tín chấp dành cho khách hàng vay tiền mặt không cần cầm cố tài sản vật chất mà dựa trên uy tín cá nhân và thông tin tham chiếu nhân thân.

### Điều kiện sử dụng
- Hợp đồng tín chấp có mã giao dịch bắt đầu bằng `TC-` hoặc danh mục thuộc nhóm `unsecured`.
- Được gọi in trực tiếp từ giao diện Quản lý hợp đồng hoặc trang Chi tiết khoản vay tín chấp.

### API lấy dữ liệu
- Endpoint chi tiết hợp đồng trên backend: `GET /api/unsecured/:id`

### Data Key áp dụng

| Key | Kiểu dữ liệu | Bắt buộc | Diễn giải |
| :--- | :--- | :--- | :--- |
| `{{StoreName}}` | String | Có | Tên đơn vị cho vay giao dịch |
| `{{StorePhone}}` | String | Có | Số hotline hỗ trợ của cửa hàng |
| `{{ContractCode}}` | String | Có | Mã hợp đồng tín chấp (Ví dụ: `TC-0002`) |
| `{{ContractDate}}` | String | Có | Ngày lập hợp đồng |
| `{{Representative}}` | String | Có | Người đại diện bên cho vay |
| `{{StoreAddress}}` | String | Có | Địa chỉ chi nhánh cửa hàng |
| `{{CustomerName}}` | String | Có | Họ và tên người vay tiền |
| `{{IdentityNumber}}` | String | Có | Số chứng minh thư hoặc CCCD khách hàng |
| `{{IdentityIssueDate}}` | String | Không | Ngày cấp thẻ căn cước |
| `{{IdentityIssuePlace}}` | String | Không | Nơi cấp thẻ căn cước |
| `{{CustomerPhone}}` | String | Có | Số điện thoại di động người vay |
| `{{CustomerAddress}}` | String | Có | Nơi ở hiện tại của khách hàng |
| `{{AssetType}}` | String | Có | Hình thức vay tín chấp (Tên gói sản phẩm vay) |
| `{{LoanAmount}}` | Decimal | Có | Số tiền vay giải ngân |
| `{{LoanAmountText}}` | String | Có | Số tiền vay viết bằng chữ tiếng Việt |
| `{{LoanStartDate}}` | String | Có | Ngày bắt đầu giải ngân và tính lãi |
| `{{LoanEndDate}}` | String | Có | Ngày kết thúc khoản vay theo thời hạn |
| `{{InterestRate}}` | Decimal | Không | Lãi suất áp dụng (nếu chọn mẫu Lãi suất) |

### Hiện trạng kỹ thuật
- **Chưa có file HTML/Markdown độc lập**: Hiện tại, mẫu in này đang được lập trình trực tiếp (hardcoded) bên trong mã nguồn React của component quản lý giao dịch (`Contracts.tsx` từ dòng 3345 đến 3500) dựa trên biến điều kiện `isUnsecuredPrint = true`.
- **Đề xuất chuẩn hóa**: Tách phần mã nguồn HTML/CSS này ra thành một tệp mẫu độc lập `TC_01_001.html` đặt trong thư mục `frontend/templates/` để thuận tiện cho việc chỉnh sửa nội dung cam kết pháp lý mà không cần biên dịch lại toàn bộ mã nguồn frontend.

### Người được phép sử dụng
- Giao dịch viên, Quản trị viên chi nhánh.

### Cam kết pháp lý đặc thù
1. Quy định lệ phí theo lãi suất cố định hoặc thỏa thuận (theo lựa chọn).
2. Cam kết về tính trung thực của hồ sơ nhân thân và chịu trách nhiệm hình sự nếu có dấu hiệu lừa đảo chiếm đoạt tài sản hoặc trốn nợ.
3. Quy định về việc tự nguyện hoàn trả gốc, lãi đúng kỳ hạn và chấp nhận các hình thức đôn đốc thu hồi nợ dân sự của bên cho vay.
