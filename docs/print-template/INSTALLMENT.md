# TÀI LIỆU MẪU IN PHÂN HỆ VAY TRẢ GÓP (INSTALLMENT TEMPLATES)

Tài liệu này chi tiết cấu hình và đề xuất chuẩn hóa mẫu in áp dụng trong nghiệp vụ Cho vay Trả góp (gốc + lãi chia đều theo kỳ) của hệ thống HungTin.

---

## 1. Mẫu in đề xuất: Hợp đồng cho vay trả góp theo kỳ

### Mã mẫu đề xuất
`TG_01_001`

### Tên mẫu
Hợp đồng cho vay trả góp (Kiêm lịch thanh toán định kỳ)

### Module
Trả góp (Installment)

### Loại mẫu
Gốc và lãi chia đều / Lịch trả nợ định kỳ

### Diễn giải
Mẫu hợp đồng in ra khi khách hàng thực hiện gói vay trả góp. Hợp đồng cần đính kèm bảng lịch trình đóng tiền chi tiết từng kỳ (gồm số kỳ, ngày phải đóng, số tiền gốc + lãi mỗi kỳ) để khách hàng theo dõi thực hiện.

### Hiện trạng hệ thống
- **Chưa có mẫu in riêng biệt**: Hiện tại hệ thống chưa thiết kế tệp mẫu in riêng cho Trả góp. Khi chọn chức năng in từ danh sách, hệ thống đang bị lỗi hiển thị hoặc tự động trỏ về cấu hình giao diện của mẫu Cầm đồ (`isUnsecuredPrint = false`), dẫn đến việc hiển thị các trường không liên quan như "Tài sản", "Biển kiểm soát", "Số khung/số máy".
- **Lịch đóng tiền**: Màn hình chi tiết hợp đồng trả góp (`InstallmentDetail.tsx`) có nút "In lịch đóng tiền" nhưng thực hiện qua hàm gọi trình duyệt `window.print()` toàn màn hình mà chưa có mẫu hóa đơn/lịch đóng chuyên nghiệp dạng phiếu A4/A5.

### Đề xuất chuẩn hóa thiết lập mẫu `TG_01_001`
Thiết lập tệp mẫu `TG_01_001.html` độc lập hỗ trợ bảng lịch đóng tiền định kỳ:

#### API lấy dữ liệu bổ sung
- Endpoint: `GET /api/installment/:id` (trả về dữ liệu chi tiết hợp đồng và danh sách mảng kỳ đóng phí `payments`).

#### Data Key bổ sung đặc thù cho Trả góp

| Key | Kiểu dữ liệu | Bắt buộc | Diễn giải | Nguồn dữ liệu |
| :--- | :--- | :--- | :--- | :--- |
| `{{RepaymentAmount}}` | Decimal | Có | Tổng số tiền phải trả cả gốc và lãi | `disbursed_amount` + lãi |
| `{{PeriodType}}` | String | Có | Kỳ hạn trả góp (theo ngày hoặc theo tháng) | `InstallmentContract.period_type` |
| `{{LoanDuration}}` | Integer | Có | Tổng số kỳ hạn đăng ký trả góp | `InstallmentContract.loan_duration` |
| `{{CycleDays}}` | Integer | Có | Tần suất kỳ hạn (ví dụ: 1 ngày đóng 1 lần) | `InstallmentContract.cycle_days` |
| `{{PaymentScheduleTable}}`| HTML Table | Có | Bảng lịch trình chi tiết ngày đóng và số tiền | Vòng lặp map qua `payments` |

#### Định dạng Bảng lịch đóng tiền (`{{PaymentScheduleTable}}`)
Bảng in ra sẽ hiển thị cấu trúc rõ ràng:
```html
<table class="schedule-table">
  <thead>
    <tr>
      <th>Kỳ số</th>
      <th>Hạn đóng</th>
      <th>Số tiền kỳ</th>
      <th>Trạng thái</th>
    </tr>
  </thead>
  <tbody>
    <!-- Render danh sách kỳ đóng phí thực tế -->
  </tbody>
</table>
```
