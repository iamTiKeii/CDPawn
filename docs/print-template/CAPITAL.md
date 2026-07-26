# TÀI LIỆU MẪU IN PHÂN HỆ GÓP VỐN (CAPITAL TEMPLATES)

Tài liệu này chi tiết cấu hình và đặc tả mẫu in đề xuất đối với nghiệp vụ Góp vốn đầu tư / Quản lý nguồn vốn của hệ thống HungTin.

---

## 1. Mẫu in đề xuất: Hợp đồng góp vốn / Hợp tác kinh doanh

### Mã mẫu đề xuất
`GV_01_001`

### Tên mẫu
Hợp đồng góp vốn đầu tư chi nhánh

### Module
Góp vốn (Capital)

### Loại mẫu
Lãi suất cố định đầu tư / Phân chia lợi nhuận

### Diễn giải
Mẫu văn bản thỏa thuận pháp lý ký kết giữa Chủ chuỗi hệ thống (Bên nhận vốn) và Nhà đầu tư cá nhân/Đối tác góp vốn (Bên góp vốn). Thể hiện rõ số tiền đầu tư, ngày góp, hình thức nhận lãi định kỳ (đầu kỳ/cuối kỳ) và cam kết trách nhiệm sử dụng vốn.

### Hiện trạng hệ thống
- Phân hệ quản lý nguồn vốn (`CapitalContracts.tsx`) hiện tại chỉ quản lý danh sách hợp đồng góp vốn trên phần mềm và ghi nhận dòng tiền biến động đầu ngày/cuối ca, chưa hỗ trợ nút in hợp đồng pháp lý cho Nhà đầu tư từ phần mềm.
- Nhà quản trị hiện phải soạn hợp đồng giấy bên ngoài.

### Đề xuất chuẩn hóa thiết lập mẫu `GV_01_001`
Thiết lập mẫu `GV_01_001.html` nhằm chuyên nghiệp hóa công tác huy động vốn:

#### API lấy dữ liệu bổ sung
- Endpoint: `GET /api/capital/contracts/:id`

#### Data Key áp dụng

| Key | Kiểu dữ liệu | Bắt buộc | Diễn giải | Nguồn dữ liệu |
| :--- | :--- | :--- | :--- | :--- |
| `{{StoreName}}` | String | Có | Chi nhánh nhận vốn đầu tư | `Store.name` |
| `{{InvestorName}}` | String | Có | Họ tên đầy đủ của Nhà đầu tư | `CapitalContract.investor_name` |
| `{{InvestorIdCard}}`| String | Có | Số CMND/CCCD nhà đầu tư | `CapitalContract.investor_id_card` |
| `{{InvestorPhone}}` | String | Có | Điện thoại liên hệ của đối tác | `CapitalContract.investor_phone` |
| `{{InvestorAddress}}`| String | Có | Địa chỉ liên lạc thường trú | `CapitalContract.investor_address` |
| `{{CapitalAmount}}` | Decimal | Có | Số tiền góp vốn bằng số | `CapitalContract.amount` |
| `{{CapitalAmountText}}`| String | Có | Số tiền góp vốn bằng chữ tiếng Việt | Helper function |
| `{{InvestmentDate}}`| String | Có | Ngày bàn giao tiền góp vốn | `CapitalContract.investment_date` |
| `{{InterestType}}` | String | Có | Cách thức tính lợi nhuận đầu tư | `InterestType.name` |
| `{{IsUpfrontInterest}}`| Boolean| Có | Nhận lợi nhuận trước hay sau kỳ | `CapitalContract.is_upfront_interest` |
| `{{Representative}}`| String | Có | Đại diện nhận vốn (Chủ cửa hàng) | Database/Settings |
