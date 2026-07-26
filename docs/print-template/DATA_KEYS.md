# TỪ ĐIỂN DỮ LIỆU MẪU IN (DATA KEYS DICTIONARY)

Tài liệu này tổng hợp toàn bộ các Data Key (biến động) được truyền vào các mẫu in trong hệ thống HungTin, định nghĩa kiểu dữ liệu, ý nghĩa và nguồn gốc của từng key.

## 1. Nhóm Thông Tin Cửa Hàng & Hệ Thống (Store / System Info)

| Key | Kiểu dữ liệu | Bắt buộc | Diễn giải | Nguồn dữ liệu |
| :--- | :--- | :--- | :--- | :--- |
| `{{StoreName}}` | String | Có | Tên cửa hàng/chi nhánh thực hiện giao dịch | Database (`Store.name`) |
| `{{StorePhone}}` | String | Có | Số điện thoại hotline hỗ trợ của cửa hàng | Database (`Store.phone`) |
| `{{StoreAddress}}` | String | Có | Địa chỉ giao dịch trực tiếp của cửa hàng | Database (`Store.address`) |
| `{{Representative}}` | String | Có | Họ và tên người đại diện pháp lý/Trưởng PGD | Database / Settings JSON |

---

## 2. Nhóm Thông Tin Khách Hàng (Customer Info)

| Key | Kiểu dữ liệu | Bắt buộc | Diễn giải | Nguồn dữ liệu |
| :--- | :--- | :--- | :--- | :--- |
| `{{CustomerName}}` | String | Có | Họ và tên đầy đủ của khách hàng | Database (`Customer.full_name`) |
| `{{CustomerPhone}}` | String | Có | Số điện thoại liên hệ của khách hàng | Database (`Customer.phone`) |
| `{{CustomerAddress}}` | String | Có | Địa chỉ thường trú hoặc nơi ở hiện tại | Database (`Customer.address`) |
| `{{IdentityNumber}}` | String | Có | Số chứng minh nhân dân hoặc căn cước công dân | Database (`Customer.identity_card_number`) |
| `{{IdentityIssueDate}}` | String | Không | Ngày cấp CMND/CCCD (định dạng DD/MM/YYYY) | Database (`Customer.identity_card_date`) |
| `{{IdentityIssuePlace}}` | String | Không | Nơi cấp CMND/CCCD (Công an tỉnh/thành phố) | Database (`Customer.identity_card_place`) |

---

## 3. Nhóm Thông Tin Hợp Đồng (Contract Info)

| Key | Kiểu dữ liệu | Bắt buộc | Diễn giải | Nguồn dữ liệu |
| :--- | :--- | :--- | :--- | :--- |
| `{{ContractCode}}` | String | Có | Mã số hợp đồng duy nhất sinh ra từ hệ thống | Database (`PawnContract.contract_code`...) |
| `{{ContractDate}}` | String | Có | Ngày ký kết hợp đồng (định dạng DD/MM/YYYY) | Database (`loan_date`) |
| `{{AssetType}}` | String | Có | Phân loại tài sản (ví dụ: Xe máy, Ô tô, Điện thoại...) | Database (`Commodity.name`) |
| `{{AssetDetail}}` | String | Không | Mô tả chi tiết tài sản (biển số, số khung, số máy) | Database (ghép các trường chi tiết) |
| `{{LoanAmount}}` | Decimal | Có | Số tiền vay bằng số (đã định dạng dấu phân cách) | Database (`loan_amount`) |
| `{{LoanAmountText}}` | String | Có | Số tiền vay bằng chữ tiếng Việt (đầu viết hoa) | Helper function chuyển đổi số thành chữ |
| `{{LoanStartDate}}` | String | Có | Ngày giải ngân / bắt đầu tính phí | Database (`loan_date`) |
| `{{LoanEndDate}}` | String | Có | Ngày đến hạn thanh lý theo số ngày vay | Tính toán (`loan_date` + `loan_days`) |
| `{{InterestRate}}` | Decimal | Không | Lãi suất tính theo % mỗi chu kỳ hoặc mỗi tháng | Database (`interest_rate`) |

---

## 4. Nhóm Chứng Từ Thu Chi Khác (Vouchers Info)

| Key | Kiểu dữ liệu | Bắt buộc | Diễn giải | Nguồn dữ liệu |
| :--- | :--- | :--- | :--- | :--- |
| `{{VoucherCode}}` | String | Có | Mã số phiếu thu hoặc phiếu chi | Database (`voucher_code`) |
| `{{VoucherDate}}` | String | Có | Thời gian lập chứng từ thu chi | Database (`created_at` / `voucher_date`) |
| `{{Amount}}` | Decimal | Có | Số tiền thu hoặc chi bằng số | Database (`amount`) |
| `{{RecipientName}}` | String | Có | Tên đối tác, người nộp hoặc người nhận tiền | Database (`recipient_name` / `partner_name`) |
| `{{Notes}}` | String | Không | Nội dung chi tiết lý do thu chi tiền mặt | Database (`notes` / `description`) |
| `{{EmployeeName}}` | String | Có | Người lập phiếu thu chi / Thu ngân | Database (`Employee.full_name`) |
