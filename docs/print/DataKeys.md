# Từ điển Dữ liệu (Print Data Keys) - HungTin

Tài liệu này định nghĩa tất cả các từ khóa biến (`{{DataKey}}`) có thể sử dụng khi thiết kế hoặc chỉnh sửa mẫu in HTML. Khi render mẫu in, hệ thống sẽ tự động quét và thay thế các từ khóa này bằng giá trị thực từ hệ thống.

## Danh sách các Từ khóa Biến chung (Common Keys)

Áp dụng cho tất cả mẫu in (`CD_01_001`, `TC_01_001`, `TG_01_001`):

| Từ khóa Biến | Ý nghĩa chức năng | Nguồn dữ liệu thực tế |
| :--- | :--- | :--- |
| **`{{ContractCode}}`** | Mã số hợp đồng | `contract.contract_code` (Ví dụ: `CD-2026-0001`) |
| **`{{ContractDate}}`** | Ngày lập hợp đồng | `contract.loan_date` (định dạng ngày Việt Nam `DD/MM/YYYY`) |
| **`{{StoreName}}`** | Tên cửa hàng / Đơn vị cho vay | `store.name` |
| **`{{StoreAddress}}`** | Địa chỉ của cửa hàng | `store.address` |
| **`{{StorePhone}}`** | Hotline / SĐT cửa hàng | `store.phone` |
| **`{{Representative}}`** | Họ tên người đại diện cửa hàng | Phân tích từ trường `store.notes` (JSON hoặc văn bản) |
| **`{{CustomerName}}`** | Họ tên đầy đủ của khách hàng | `contract.customer.full_name` (Ví dụ: `NGUYỄN VĂN A`) |
| **`{{CustomerPhone}}`** | Số điện thoại khách hàng | `contract.customer.phone` |
| **`{{CustomerAddress}}`** | Địa chỉ thường trú/tạm trú của khách | `contract.customer.address` |
| **`{{IdentityNumber}}`** | Số CMND/CCCD của khách | `contract.customer.identity_card_number` |
| **`{{IdentityIssueDate}}`** | Ngày cấp CMND/CCCD | `contract.customer.identity_card_date` (định dạng `DD/MM/YYYY`) |
| **`{{IdentityIssuePlace}}`** | Nơi cấp CMND/CCCD | `contract.customer.identity_card_place` |
| **`{{CustomerBankAccount}}`**| Số tài khoản ngân hàng khách | `contract.customer.bank_account_number` |
| **`{{CustomerBankName}}`** | Tên ngân hàng của khách hàng | `contract.customer.bank_name` |
| **`{{LoanAmount}}`** | Số tiền vay dạng số có dấu phẩy | `contract.loan_amount` (Ví dụ: `10,000,000`) |
| **`{{LoanAmountText}}`** | Số tiền vay bằng chữ tiếng Việt | Biên dịch từ số tiền gốc (Ví dụ: `Mười triệu đồng`) |
| **`{{LoanStartDate}}`** | Ngày giải ngân / Bắt đầu hợp đồng | `contract.loan_date` (định dạng `DD/MM/YYYY`) |
| **`{{LoanEndDate}}`** | Ngày đáo hạn hợp đồng | Tính từ `loan_date` + `loan_days`/`loan_duration` |
| **`{{InterestRate}}`** | Mức lãi suất hoặc lệ phí vay | `contract.interest_rate` kèm theo chu kỳ tính lãi |

---

## Từ khóa Đặc thù theo Phân hệ (Module-Specific Keys)

### 1. Phân hệ Cầm đồ (Pawn)
* **`{{AssetType}}`**
  * Ý nghĩa: Tên nhóm/danh mục tài sản cầm cố.
  * Nguồn dữ liệu: `contract.commodity.name` (Ví dụ: `Xe máy`).
* **`{{AssetDetail}}`**
  * Ý nghĩa: Chi tiết mô tả tài sản cầm cố.
  * Nguồn dữ liệu: Gộp từ tên tài sản (`asset_name`), biển số (`license_plate`), số khung (`chassis_number`), số máy (`engine_number`).

### 2. Phân hệ Trả góp (Installment)
* **`{{RepaymentAmount}}`**
  * Ý nghĩa: Tổng số tiền phải trả bao gồm cả gốc lẫn lãi.
  * Nguồn dữ liệu: `contract.repayment_amount` (Ví dụ: `12,000,000`).
* **`{{PeriodType}}`**
  * Ý nghĩa: Đơn vị tính kỳ trả góp (ngày, tuần, tháng).
  * Nguồn dữ liệu: `contract.period_type` (Ví dụ: `ngày`).
* **`{{LoanDuration}}`**
  * Ý nghĩa: Tổng thời gian vay.
  * Nguồn dữ liệu: `contract.loan_duration` (Ví dụ: `50`).
* **`{{CycleDays}}`**
  * Ý nghĩa: Chu kỳ đóng tiền góp (mấy ngày một kỳ).
  * Nguồn dữ liệu: `contract.cycle_days` (Ví dụ: `1` có nghĩa là đóng góp hàng ngày).
* **`{{PaymentScheduleTable}}`**
  * Ý nghĩa: Đoạn mã HTML render bảng danh sách các kỳ đóng tiền trả góp chi tiết kèm cột kỳ, hạn đóng, số tiền kỳ, trạng thái đã đóng hay chưa.
  * Nguồn dữ liệu: Tự động tổng hợp từ mảng `contract.payments`.

---

## Cách nhúng biến vào HTML thiết kế mới

Để nhúng dữ liệu vào mã HTML, bạn chỉ cần gõ đúng tên biến đặt trong hai dấu ngoặc nhọn.

*Ví dụ khi thiết kế:*
```html
<p>Họ tên khách hàng: <strong>{{CustomerName}}</strong></p>
<p>Số tiền vay: <strong>{{LoanAmount}} VNĐ</strong> (Bằng chữ: <em>{{LoanAmountText}}</em>)</p>
```
Hệ thống in sẽ tự động chuyển đổi thành:
> Họ tên khách hàng: **NGUYỄN VĂN A**
>
> Số tiền vay: **10,000,000 VNĐ** (Bằng chữ: *Mười triệu đồng*)
