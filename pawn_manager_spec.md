# Tài liệu Đặc tả Hệ thống Quản lý Cầm đồ V2 (PawnManagerV2)

## MODULE 1: QUẢN LÝ DANH SÁCH CỬA HÀNG (STORES)

### 1. Ý nghĩa & Vai trò
* Phục vụ mô hình chuỗi cửa hàng cầm đồ (nhiều chi nhánh). Dữ liệu phân loại theo chi nhánh cụ thể thông qua liên kết `store_id`.

### 2. Các trường thông tin chi tiết
* **Tên cửa hàng/chi nhánh (Store Name):** Bắt buộc nhập.
* **Số vốn đầu tư (Investment Capital):** Bắt buộc nhập (VNĐ).
* **Trạng thái hoạt động (Status):** Lựa chọn danh sách (`active`, `suspended`, `closed`).
* **Các thông tin bổ sung khác (Other Info):** Địa chỉ, Số điện thoại, Người quản lý, Ngày thành lập/khai trương, Ghi chú.

### 3. Thiết kế Database: Bảng `stores`
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `name` | `varchar(150)` | NOT NULL, UNIQUE | Tên cửa hàng/chi nhánh. |
| `investment_capital` | `numeric(15, 2)` | NOT NULL, Default: `0` | Số vốn đầu tư ban đầu (VNĐ). |
| `status` | `varchar(20)` | NOT NULL, Default: `'active'` | Trạng thái (`active`, `suspended`, `closed`). |
| `address` | `text` | NULL | Địa chỉ chi tiết. |
| `phone` | `varchar(20)` | NULL | Số điện thoại liên lạc. |
| `opening_date` | `date` | NULL | Ngày khai trương/thành lập. |
| `manager_id` | `uuid` | NULL | Liên kết sang bảng nhân viên quản lý. |
| `notes` | `text` | NULL | Ghi chú thêm. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo cửa hàng trên hệ thống. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

---

## MODULE 2: QUẢN LÝ NHÂN VIÊN, TÀI KHOẢN & PHÂN QUYỀN ĐỘNG (EMPLOYEES & PERMISSIONS)

### 1. Ý nghĩa & Vai trò
* Quản lý thông tin hồ sơ của toàn bộ nhân viên và tài khoản đăng nhập.
* Phân quyền động theo danh mục quyền, gán trực tiếp cho từng tài khoản nhân viên.
* Mỗi nhân viên trực thuộc một cửa hàng/chi nhánh cụ thể thông qua `store_id`.

### 2. Các trường thông tin chi tiết
* **Liên kết cửa hàng (Store Location):** Bắt buộc chọn từ danh sách cửa hàng đang hoạt động.
* **Thông tin cá nhân (Personal Info):** Họ và tên (Bắt buộc), Số điện thoại, Email, Ảnh đại diện.
* **Thông tin tài khoản đăng nhập (Account Info):** Tên đăng nhập (Bắt buộc, duy nhất), Mật khẩu (hash), Trạng thái hoạt động (`active`, `inactive`).
* **Danh mục Quyền hạn (Permissions Mapping):** Gán trực tiếp một danh sách các mã quyền cho nhân viên.

### 3. Thiết kế Database

#### A. Bảng `employees` (Hồ sơ & Tài khoản nhân viên)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `store_id` | `uuid` | NOT NULL, FOREIGN KEY references `stores(id)` | Liên kết tới chi nhánh trực thuộc. |
| `username` | `varchar(50)` | NOT NULL, UNIQUE | Tên đăng nhập. |
| `password_hash` | `varchar(255)` | NOT NULL | Mật khẩu băm bảo mật. |
| `full_name` | `varchar(100)` | NOT NULL | Họ và tên đầy đủ. |
| `phone` | `varchar(20)` | NULL | Số điện thoại liên hệ. |
| `email` | `varchar(100)` | NULL | Địa chỉ email. |
| `avatar_url` | `text` | NULL | URL ảnh đại diện. |
| `status` | `varchar(20)` | NOT NULL, Default: `'active'` | Trạng thái hoạt động. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo tài khoản. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### B. Bảng `permissions` (Danh mục quyền hệ thống)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `code` | `varchar(50)` | NOT NULL, UNIQUE | Mã quyền duy nhất. |
| `name` | `varchar(100)` | NOT NULL | Tên hiển thị thân thiện. |
| `category` | `varchar(50)` | NOT NULL | Nhóm quyền. |
| `description` | `text` | NULL | Mô tả chi tiết. |

#### C. Bảng `employee_permissions` (Liên kết Nhân viên - Quyền hạn)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `employee_id` | `uuid` | NOT NULL, FOREIGN KEY references `employees(id)` ON DELETE CASCADE | ID của nhân viên. |
| `permission_id` | `uuid` | NOT NULL, FOREIGN KEY references `permissions(id)` ON DELETE CASCADE | ID của quyền. |
| (Khóa chính) | | PRIMARY KEY (`employee_id`, `permission_id`) | Đảm bảo không gán trùng lặp. |

---

## MODULE 3: QUẢN LÝ DANH MỤC HÌNH THỨC LÃI (INTEREST RATES / GÓI LÃI)

### 1. Ý nghĩa & Vai trò
* Định nghĩa các phương án tính lãi suất áp dụng khi lập hợp đồng cầm đồ cho khách hàng.
* **Nguyên tắc quản lý:** Danh sách các hình thức lãi suất này là **cố định và duy nhất** (11 loại mặc định). **Không cho phép thêm/xóa** trên giao diện.
* **Khả năng chỉnh sửa:** Được phép cập nhật thuộc tính **Trả gốc kèm theo mỗi kỳ (Is Principal Included in Cycle)** và trạng thái hoạt động.

### 2. Các trường thông tin chi tiết
* Tên hình thức lãi (Cố định), Cách tính lãi (Cố định), Trả gốc kèm theo mỗi kỳ (Sửa), Trạng thái (Sửa), Ghi chú.

### 3. Danh sách các hình thức lãi hỗ trợ & Công thức tính toán
* **Nhóm lãi không kèm gốc:** Lãi ngày (k/triệu), Lãi ngày (k/ngày), Lãi tháng (%) (30 ngày), Lãi tháng (%) (Định kỳ), Lãi tháng (VNĐ) (Định kỳ), Lãi tuần (%), Lãi tuần (VNĐ).
* **Nhóm lãi có kèm gốc:** Lãi phẳng (tháng), Lãi phẳng (ngày), Dư nợ giảm dần (Gốc lãi cố định), Dư nợ giảm dần (Gốc cố định).

### 4. Thiết kế Database: Bảng `interest_types`
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `code` | `varchar(50)` | NOT NULL, UNIQUE | Mã định danh cố định. |
| `name` | `varchar(100)` | NOT NULL | Tên hình thức tính lãi. |
| `calculation_method` | `varchar(30)` | NOT NULL | Cách tính. |
| `is_principal_included` | `boolean` | NOT NULL, Default: `false` | Có gồm gốc mỗi kỳ đóng hay không. |
| `status` | `varchar(20)` | NOT NULL, Default: `'active'` | Trạng thái (`active`, `inactive`). |
| `notes` | `text` | NULL | Ghi chú. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật. |

---

## MODULE 4: CẤU HÌNH DANH MỤC HÀNG HÓA (COMMODITIES / ITEMS)

### 1. Ý nghĩa & Vai trò
* Thiết lập trước các loại tài sản hỗ trợ giao dịch cầm đồ (`pawn`) hoặc tín chấp (`unsecured`).

### 2. Các trường thông tin cấu hình
* Lĩnh vực (Cầm đồ/Tín chấp), Mã hàng, Tên hàng, Trạng thái.
* Giá trị mặc định: Hình thức lãi, Thu lãi trước (checkbox), Số tiền cầm/vay, Lãi mặc định, Kỳ lãi (Period Value - đơn vị tính ngày/tuần/tháng tự chạy theo gói lãi), Số ngày vay mặc định, Thanh lý sau (số ngày).

### 3. Thiết kế Database: Bảng `commodities`
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `category` | `varchar(20)` | NOT NULL, CHECK (`category` IN ('pawn', 'unsecured')) | Phân loại lĩnh vực. |
| `code` | `varchar(50)` | NOT NULL, UNIQUE | Mã hàng hóa. |
| `name` | `varchar(150)` | NOT NULL | Tên loại hàng hóa. |
| `status` | `varchar(20)` | NOT NULL, Default: `'active'` | Trạng thái (`active`, `paused`). |
| `interest_type_id` | `uuid` | NOT NULL, FOREIGN KEY references `interest_types(id)` | Liên kết gói lãi mặc định. |
| `is_upfront_interest` | `boolean` | NOT NULL, Default: `false` | Thu lãi trước hay không. |
| `default_amount` | `numeric(15, 2)` | NOT NULL, Default: `0` | Hạn mức mặc định. |
| `default_interest_rate` | `numeric(10, 2)` | NOT NULL, Default: `0` | Lãi suất mặc định. |
| `default_period_value` | `integer` | NOT NULL, Default: 15 | Kỳ đóng lãi mặc định. |
| `default_loan_days` | `integer` | NOT NULL, Default: `30` | Thời hạn hợp đồng mặc định. |
| `liquidation_after_days` | `integer` | NOT NULL, Default: `10` | Chuyển thanh lý sau n ngày quá hạn. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật. |

---

## MODULE 5: QUẢN LÝ TIỀN ĐẦU NGÀY VÀ QUỸ TIỀN MẶT (DAILY CASH & CASH FUND)

### 1. Ý nghĩa & Vai trò
* **Tiền đầu ngày (Beginning-of-Day Cash):** Tiền mặt có sẵn đầu ngày (chốt cố định).
* **Quỹ tiền mặt (Cash Fund):** Số dư tiền mặt hiện tại trong két (biến động liên tục).

### 2. Các trường thông tin & Tính năng
* Số dư hiển thị (Quỹ hiện tại, Tiền đầu ngày), Lịch sử giao dịch/điều chỉnh quỹ.

### 3. Thiết kế Database

#### A. Bảng `daily_cash`
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `store_id` | `uuid` | NOT NULL, FOREIGN KEY references `stores(id)` | Chi nhánh. |
| `date` | `date` | NOT NULL | Ngày. |
| `beginning_cash` | `numeric(15, 2)` | NOT NULL, Default: `0` | Tiền đầu ngày. |
| `current_cash` | `numeric(15, 2)` | NOT NULL, Default: `0` | Quỹ tiền mặt hiện tại. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật. |
| (Duy nhất) | | UNIQUE (`store_id`, `date`) | Mỗi ngày tại mỗi chi nhánh có 1 dòng số dư quỹ. |

#### B. Bảng `cash_fund_history`
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính lịch sử. |
| `store_id` | `uuid` | NOT NULL, FOREIGN KEY references `stores(id)` | Chi nhánh. |
| `date` | `date` | NOT NULL | Ngày giao dịch. |
| `employee_id` | `uuid` | NOT NULL, FOREIGN KEY references `employees(id)` | Người thực hiện. |
| `amount` | `numeric(15, 2)` | NOT NULL | Số tiền thay đổi (+ tăng, - giảm). |
| `type` | `varchar(30)` | NOT NULL | Loại điều chỉnh. |
| `description` | `text` | NOT NULL | Diễn giải lý do. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian thực hiện. |

---

## MODULE 6: QUẢN LÝ CỘNG TÁC VIÊN (COLLABORATORS)

### 1. Ý nghĩa & Vai trò
* Quản lý thông tin Cộng tác viên giới thiệu hợp đồng (dữ liệu toàn cục chuỗi cửa hàng).

### 2. Các trường thông tin chi tiết
* Họ tên, Mã CTV (duy nhất), Số điện thoại, Thông tin ngân hàng (Ngân hàng, Số tài khoản, Chủ tài khoản), Trạng thái.

### 3. Thiết kế Database: Bảng `collaborators`
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `full_name` | `varchar(100)` | NOT NULL | Họ và tên. |
| `code` | `varchar(50)` | NOT NULL, UNIQUE | Mã CTV duy nhất. |
| `phone` | `varchar(20)` | NULL | Số điện thoại. |
| `bank_name` | `varchar(100)` | NULL | Ngân hàng nhận hoa hồng. |
| `bank_account_number` | `varchar(50)` | NULL | Số tài khoản. |
| `bank_account_holder` | `varchar(100)` | NULL | Tên chủ tài khoản. |
| `status` | `varchar(20)` | NOT NULL, Default: `'active'` | Trạng thái hoạt động. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

---

## MODULE 7: QUẢN LÝ KHÁCH HÀNG (CUSTOMERS)

### 1. Ý nghĩa & Vai trò
* Quản lý chi tiết hồ sơ khách hàng đến giao dịch theo từng chi nhánh (`store_id`).

### 2. Các trường thông tin chi tiết
* **Cơ bản:** Cửa hàng, Họ tên (bắt buộc), Số điện thoại, Địa chỉ, CCCD/Hộ chiếu, Ngày cấp, Nơi cấp, Trạng thái.
* **Nâng cao:** Vợ/Chồng, Bố, Mẹ (mỗi đối tượng gồm: Họ tên, Số điện thoại, Nghề nghiệp).
* **Khác:** Ghi chú nợ xấu, lịch sử đóng lãi.

### 3. Thiết kế Database: Bảng `customers`
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `store_id` | `uuid` | NOT NULL, FOREIGN KEY references `stores(id)` | Chi nhánh quản lý. |
| `full_name` | `varchar(100)` | NOT NULL | Họ và tên. |
| `phone` | `varchar(20)` | NULL | Số điện thoại. |
| `address` | `text` | NULL | Địa chỉ. |
| `identity_card_number` | `varchar(50)` | NULL | Số CCCD/Hộ chiếu. |
| `identity_card_date` | `date` | NULL | Ngày cấp. |
| `identity_card_place` | `varchar(150)` | NULL | Nơi cấp. |
| `spouse_name` | `varchar(100)` | NULL | Họ tên vợ/chồng. |
| `spouse_phone` | `varchar(20)` | NULL | SĐT vợ/chồng. |
| `spouse_job` | `varchar(100)` | NULL | Nghề nghiệp vợ/chồng. |
| `father_name` | `varchar(100)` | NULL | Họ tên bố. |
| `father_phone` | `varchar(20)` | NULL | SĐT bố. |
| `father_job` | `varchar(100)` | NULL | Nghề nghiệp bố. |
| `mother_name` | `varchar(100)` | NULL | Họ tên mẹ. |
| `mother_phone` | `varchar(20)` | NULL | SĐT mẹ. |
| `mother_job` | `varchar(100)` | NULL | Nghề nghiệp mẹ. |
| `status` | `varchar(20)` | NOT NULL, CHECK (`status` IN ('active', 'inactive', 'blacklist')) | Trạng thái khách hàng (gồm cả blacklist). |
| `notes` | `text` | NULL | Ghi chú thêm. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật. |

---

## MODULE 8: QUẢN LÝ HỢP ĐỒNG GÓP VỐN (CAPITAL INVESTMENT CONTRACTS)

### 1. Ý nghĩa & Vai trò
* Hợp đồng góp vốn/vay vốn đầu tư bổ sung dòng vốn hoạt động tại các chi nhánh.
* **Quy tắc dòng tiền:** Tự động tăng quỹ tiền mặt khi lập hợp đồng hoạt động. Tự động đồng bộ đảo ngược/hoàn trả quỹ khi sửa đổi số tiền hoặc xóa hợp đồng.

### 2. Các trường thông tin chi tiết
* Nhà đầu tư: Họ tên (bắt buộc), CMND, Điện thoại, Địa chỉ.
* Hợp đồng: Số tiền đầu tư (bắt buộc), Ngày góp (bắt buộc), Gói lãi, Thu lãi trước, Ghi chú, Trạng thái.

### 3. Thiết kế Database: Bảng `capital_contracts`
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `store_id` | `uuid` | NOT NULL, FOREIGN KEY references `stores(id)` | Chi nhánh nhận vốn. |
| `investor_name` | `varchar(100)` | NOT NULL | Tên nhà đầu tư. |
| `investor_id_card` | `varchar(50)` | NULL | Số CCCD/Hộ chiếu. |
| `investor_phone` | `varchar(20)` | NULL | Số điện thoại. |
| `investor_address` | `text` | NULL | Địa chỉ. |
| `amount` | `numeric(15, 2)` | NOT NULL, Default: `0` | Số tiền góp (VNĐ). |
| `investment_date` | `date` | NOT NULL | Ngày góp vốn. |
| `interest_type_id` | `uuid` | NULL, FOREIGN KEY references `interest_types(id)` | Hình thức lãi. |
| `is_upfront_interest` | `boolean` | NOT NULL, Default: `false` | Có thu lãi trước. |
| `status` | `varchar(20)` | NOT NULL, Default: `'active'` | Trạng thái (`active`, `completed`, `cancelled`). |
| `notes` | `text` | NULL | Ghi chú. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật. |

---

## MODULE 9: QUẢN LÝ HỢP ĐỒNG CẦM ĐỒ (PAWN CONTRACTS)

### 1. Ý nghĩa & Vai trò
* Nghiệp vụ cốt lõi quản lý khách hàng thế chấp tài sản giải ngân tiền mặt.
* **Mã tự tăng động:** Định dạng `HDxxxx`, tự động bù số `0` ở trước cho độ dài 4 số; khi sequence vượt mốc 9999 sẽ tự động mở rộng (ví dụ: `HD10000`) không giới hạn.
* **Quy tắc dòng tiền giải ngân & sửa/xóa:** Tự động trừ quỹ giải ngân thực tế (khấu trừ lãi trước nếu có). Khi sửa đổi hoặc xóa hợp đồng, tự động hoàn trả quỹ tiền mặt, xóa biên nhận đóng lãi/gốc và nhật ký quỹ tương ứng để tránh chênh lệch số liệu.

### 2. Các trường thông tin chi tiết
* Khách hàng: Họ tên (bắt buộc), Mã hợp đồng (tự sinh, duy nhất), Số CCCD, Điện thoại, Địa chỉ.
* Khoản vay: Loại tài sản, Tên tài sản cụ thể, Tổng tiền vay, Thu lãi trước, Hình thức lãi, Số ngày vay, Kỳ lãi (Period Value - đơn vị động theo gói lãi), Lãi phí, Ngày vay.
* Khác: Nhân viên thu (bắt buộc), Cộng tác viên, Ghi chú.
* Tài sản: Biển kiểm soát, Số khung, Số máy.

### 3. Thiết kế Database: Bảng `pawn_contracts`
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `store_id` | `uuid` | NOT NULL, FOREIGN KEY references `stores(id)` | Chi nhánh thực hiện. |
| `contract_code` | `varchar(50)` | NOT NULL, UNIQUE | Mã hợp đồng (ví dụ: `HD0001`, `HD10000`). |
| `customer_id` | `uuid` | NOT NULL, FOREIGN KEY references `customers(id)` | Khách hàng. |
| `commodity_id` | `uuid` | NOT NULL, FOREIGN KEY references `commodities(id)` | Nhóm hàng hóa. |
| `asset_name` | `varchar(150)` | NOT NULL | Tên tài sản chi tiết. |
| `loan_amount` | `numeric(15, 2)` | NOT NULL, Default: `0` | Tổng tiền vay. |
| `interest_type_id` | `uuid` | NOT NULL, FOREIGN KEY references `interest_types(id)` | Hình thức tính lãi. |
| `is_upfront_interest` | `boolean` | NOT NULL, Default: `false` | Thu lãi trước hay không. |
| `loan_days` | `integer` | NOT NULL | Thời gian vay (số ngày). |
| `period_value` | `integer` | NOT NULL | Giá trị của 1 kỳ đóng lãi. |
| `interest_rate` | `numeric(10, 2)` | NOT NULL | Lãi suất tính toán. |
| `loan_date` | `date` | NOT NULL | Ngày giải ngân hợp đồng. |
| `collector_id` | `uuid` | NOT NULL, FOREIGN KEY references `employees(id)` | Nhân viên thu nợ. |
| `collaborator_id` | `uuid` | NULL, FOREIGN KEY references `collaborators(id)` | CTV giới thiệu. |
| `license_plate` | `varchar(50)` | NULL | Biển số xe. |
| `chassis_number` | `varchar(100)` | NULL | Số khung. |
| `engine_number` | `varchar(100)` | NULL | Số máy. |
| `debt_amount` | `numeric(15, 2)` | NOT NULL, Default: `0` | Số dư nợ lãi/gốc khách hàng đang nợ lại cửa hàng. |
| `status` | `varchar(20)` | NOT NULL, Default: `'active'` | Trạng thái (`active`, `overdue`, `liquidated`, `closed`, `cancelled`). |
| `notes` | `text` | NULL | Ghi chú. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

### 4. Các phân hệ chức năng trong Vòng đời Hợp đồng Cầm đồ (Lifecycle Sub-features)

#### 4.1. Đóng tiền lãi (Pay Interest)
Chức năng cho phép quản lý lịch đóng tiền lãi định kỳ của khách hàng, đóng tiền lãi theo thực tế, và in lịch đóng tiền.

##### A. Logic sinh lịch đóng lãi tự động (Expected Schedule Generation)
* Khi hợp đồng được tạo ở trạng thái `Hoạt động` (Active), hệ thống tự động tính toán và khởi tạo danh sách các kỳ đóng lãi dự kiến dựa trên các thông số hợp đồng (`loan_amount`, `loan_days`, `period_value` và `interest_type`).
* Mỗi kỳ đóng lãi dự kiến bao gồm: `Số kỳ` (1, 2, 3...), `Từ ngày`, `Đến ngày`, `Số ngày`, `Tiền lãi dự kiến`, `Tiền gốc dự kiến` (nếu hình thức lãi có kèm gốc), `Tổng số tiền dự kiến phải đóng`.
  * **Trường hợp Thu lãi trước:** Kỳ đóng đầu tiên sẽ được tự động đánh dấu là đã thanh toán (`is_paid = true`), số tiền thực tế giải ngân đã được trừ bớt số tiền này.

##### B. Nghiệp vụ Đóng tiền lãi (Paying Interest Transaction)
* **Form Tính toán:**
  * **Lãi từ ngày:** Tự động điền ngày bắt đầu kỳ đóng tiếp theo (ngày kết thúc kỳ đóng lãi trước đó).
  * **Đến ngày & Số ngày:** Khi thay đổi `Đến ngày`, hệ thống tự tính toán `Số ngày` và ngược lại.
  * **Tiền lãi (Dự kiến):** Hệ thống tính toán tự động dựa theo công thức của gói lãi hiện hành.
  * **Tiền khác:** Số tiền phát sinh ngoài (ví dụ: phí phạt trễ hạn, phí dịch vụ bổ sung) do người dùng nhập thủ công.
  * **Tổng tiền lãi (Dự kiến):** `Tiền lãi dự kiến` + `Tiền khác`.
  * **Tiền khách đưa (Thực tế thu):** Bắt buộc nhập. Mặc định tự động điền bằng `Tổng tiền lãi`. Số tiền thực tế thu quỹ sẽ lấy theo số tiền này.
* **Xác nhận đóng lãi (Đánh dấu kỳ):**
  * Nhân viên thực hiện check chọn kỳ thanh toán và nhấn nút "Đóng lãi".
  * Hệ thống cập nhật bản ghi lịch đóng lãi: gán `is_paid = true`, `actual_paid` = Số tiền khách trả thực tế, `paid_date` = Ngày hiện tại.
  * **Tác động dòng tiền:** Số tiền thực tế thu (`actual_paid`) sẽ được **cộng trực tiếp** vào Quỹ tiền mặt hiện tại của chi nhánh (`current_cash` trong `daily_cash` tại ngày đóng tiền), đồng thời ghi nhận 1 bản ghi tăng quỹ vào `cash_fund_history`.

##### C. Nghiệp vụ Hủy thu tiền lãi (Cancel Interest Payment)
* Cho phép nhân viên có quyền hủy bỏ giao dịch đóng tiền lãi đã thu (bằng cách bỏ check chọn kỳ đã đóng).
* **Đảo ngược dữ liệu:**
  * Cập nhật kỳ đóng lãi: gán `is_paid = false`, `actual_paid = 0`, `paid_date = null`.
  * **Tác động dòng tiền:** **Khấu trừ trực tiếp** số tiền đã thu (`actual_paid` cũ) ra khỏi Quỹ tiền mặt hiện tại (`current_cash` trong `daily_cash`), và xóa bản ghi lịch sử tương ứng trong `cash_fund_history`.

##### D. In lịch đóng tiền (Print Schedule)
* Cung cấp nút "In lịch đóng tiền" để xuất file PDF hoặc biểu mẫu in giấy gửi cho khách hàng, bao gồm thông tin chi tiết các kỳ đóng lãi (ngày đóng, số ngày, số tiền dự kiến, số tiền thực tế đã đóng và chữ ký nhân viên).

##### E. Quy tắc xử lý khi Cập nhật thông tin Hợp đồng (Update Sync Rules for `pawn_interest_payments`)
Khi người dùng thay đổi các thuộc tính tài chính của hợp đồng cầm đồ (như Số tiền vay, Lãi suất, Hình thức lãi, Ngày giải ngân, Kỳ lãi), hệ thống sẽ đồng bộ hóa bảng `pawn_interest_payments` theo quy tắc sau:
1. **Đối với các kỳ đã đóng (`is_paid = true`):**
   * Giữ nguyên hoàn toàn các bản ghi này để bảo toàn tính xác thực lịch sử của dòng tiền thực thu két đã được chốt và ghi log quỹ trước đó.
2. **Đối với các kỳ chưa đóng (`is_paid = false`):**
   * Hệ thống sẽ **xóa bỏ hoàn toàn** các bản ghi kỳ đóng lãi dự kiến chưa thanh toán này.
3. **Tái tạo các kỳ mới:**
   * Hệ thống sẽ tự động tính toán và tái sinh lại các kỳ đóng lãi mới từ mốc thời gian tiếp sau ngày kết thúc (`to_date`) của kỳ đã thanh toán gần nhất cho đến hết thời hạn vay mới của hợp đồng, dựa theo các thông số hợp đồng mới vừa được cập nhật.
   * Nếu hợp đồng chưa phát sinh bất kỳ một kỳ thanh toán lãi nào (`chưa có kỳ nào is_paid = true`), hệ thống sẽ xóa toàn bộ lịch đóng cũ và tái sinh lại 100% lịch đóng mới bắt đầu từ ngày giải ngân mới.

#### 4.2. Trả bớt gốc (Pay down Principal)
Cho phép khách hàng đóng bớt một phần tiền gốc đang vay để giảm dư nợ gốc thực tế và giảm số tiền lãi phải đóng cho các kỳ sau.

##### A. Nghiệp vụ Trả bớt gốc (Pay down Transaction)
* **Form Nhập liệu (Theo giao diện đính kèm):**
  * **Ngày trả bớt gốc (Transaction Date):** Bắt buộc chọn, mặc định là ngày hiện tại.
  * **Số tiền gốc trả trước (Pay down Amount):** Bắt buộc nhập, giá trị lớn hơn 0 và phải nhỏ hơn số dư nợ gốc hiện tại của hợp đồng.
  * **Ghi chú (Notes):** Nhập diễn giải lý do trả gốc.
* **Xác nhận Trả bớt gốc (Nhấn nút "Đồng ý"):**
  * Hệ thống khởi tạo một bản ghi giao dịch gốc vào bảng `pawn_principal_transactions` với kiểu `pay_down`.
  * **Cập nhật số dư nợ hợp đồng:** Khấu trừ trực tiếp số tiền gốc trả trước khỏi dư nợ hiện tại của hợp đồng (`loan_amount` trong bảng `pawn_contracts`).
  * **Tác động dòng tiền quỹ:** Cộng số tiền trả bớt gốc này vào Quỹ tiền mặt hiện tại (`current_cash` trong bảng `daily_cash` tại ngày trả gốc), đồng thời ghi nhận 1 bản ghi tăng quỹ vào nhật ký `cash_fund_history`.
  * **Tính toán lại lịch lãi tương lai:**
    * Hệ thống giữ nguyên lịch sử đóng lãi của các kỳ đã hoàn tất thanh toán (`is_paid = true`).
    * Đối với toàn bộ các kỳ chưa đóng lãi (`is_paid = false`), hệ thống **tính toán lại số tiền lãi phải đóng dự kiến** dựa trên số dư nợ gốc mới vừa được giảm bớt, đảm bảo quyền lợi cho khách hàng.

##### B. Nghiệp vụ Hủy giao dịch Trả bớt gốc (Delete Transaction)
* Cho phép xóa bản ghi giao dịch trả bớt gốc cũ trong danh sách lịch sử biến động tiền gốc để khôi phục trạng thái ban đầu của hợp đồng.
* **Đảo ngược dữ liệu:**
  * **Khôi phục dư nợ hợp đồng:** Cộng ngược lại số tiền gốc đã trả vào dư nợ hợp đồng (`loan_amount` tăng lên).
  * **Tác động dòng tiền quỹ:** Khấu trừ trực tiếp số tiền này khỏi Quỹ tiền mặt hiện tại (`current_cash` trong `daily_cash`), và xóa bản ghi nhật ký quỹ liên quan trong `cash_fund_history`.
  * **Tính toán lại lịch lãi tương lai:** Tính toán lại số tiền lãi dự kiến cho toàn bộ các kỳ đóng lãi chưa thanh toán (`is_paid = false`) theo mức dư nợ gốc cũ vừa được khôi phục.
  * Xóa bản ghi giao dịch tương ứng trong `pawn_principal_transactions`.

#### 4.3. Vay thêm (Borrow more)
Cho phép khách hàng vay thêm một lượng tiền mặt dựa trên việc nâng hạn mức tài sản cầm cố đang có, làm tăng dư nợ gốc hợp đồng và tăng số tiền lãi phải đóng ở các kỳ tương lai.

##### A. Nghiệp vụ Vay thêm (Borrow more Transaction)
* **Form Nhập liệu (Theo giao diện đính kèm):**
  * **Ngày vay thêm gốc (Transaction Date):** Bắt buộc chọn, mặc định là ngày hiện tại.
  * **Số tiền vay thêm (Borrow Amount):** Bắt buộc nhập, giá trị lớn hơn 0.
  * **Ghi chú (Notes):** Nhập diễn giải lý do vay thêm.
* **Xác nhận Vay thêm (Nhấn nút "Đồng ý"):**
  * Hệ thống khởi tạo một bản ghi giao dịch gốc vào bảng `pawn_principal_transactions` với kiểu `borrow_more`.
  * **Cập nhật số dư nợ hợp đồng:** Cộng thêm trực tiếp số tiền vay thêm vào dư nợ hiện tại của hợp đồng (`loan_amount` trong bảng `pawn_contracts` tăng lên).
  * **Tác động dòng tiền quỹ:** Khấu trừ trực tiếp số tiền vay thêm này khỏi Quỹ tiền mặt hiện tại (`current_cash` trong bảng `daily_cash` tại ngày giao dịch) do chi tiền giải ngân cho khách, đồng thời ghi nhận 1 bản ghi giảm quỹ vào nhật ký `cash_fund_history`.
  * **Tính toán lại lịch lãi tương lai:**
    * Hệ thống giữ nguyên lịch sử đóng lãi của các kỳ đã hoàn tất thanh toán (`is_paid = true`).
    * Đối với toàn bộ các kỳ chưa đóng lãi (`is_paid = false`), hệ thống **tính toán lại số tiền lãi phải đóng dự kiến** dựa trên số dư nợ gốc mới tăng lên, đảm bảo tính đủ tiền lãi phát sinh từ mốc vay thêm.

##### B. Nghiệp vụ Hủy giao dịch Vay thêm (Delete Transaction)
* Cho phép xóa bản ghi giao dịch vay thêm cũ trong danh sách lịch sử biến động tiền gốc để khôi phục trạng thái ban đầu của hợp đồng.
* **Đảo ngược dữ liệu:**
  * **Khôi phục dư nợ hợp đồng:** Khấu trừ số tiền đã vay thêm ra khỏi dư nợ hợp đồng (`loan_amount` giảm xuống mức cũ).
  * **Tác động dòng tiền quỹ:** Cộng hoàn trả trực tiếp số tiền này vào Quỹ tiền mặt hiện tại (`current_cash` trong `daily_cash`), và xóa bản ghi nhật ký quỹ liên quan trong `cash_fund_history`.
  * **Tính toán lại lịch lãi tương lai:** Tính toán giảm lại số tiền lãi dự kiến cho toàn bộ các kỳ đóng lãi chưa thanh toán (`is_paid = false`) theo mức dư nợ gốc cũ vừa được khôi phục.
  * Xóa bản ghi giao dịch tương ứng trong `pawn_principal_transactions`.

#### 4.4. Gia hạn (Extend Contract)
Kéo dài thời hạn vay của hợp đồng cầm đồ khi đến ngày đáo hạn mà khách hàng chưa thể tất toán/chuộc đồ.

##### A. Nghiệp vụ Gia hạn (Extension Transaction)
* **Form Nhập liệu (Theo giao diện đính kèm):**
  * **Gia hạn thêm (Extended Days):** Bắt buộc nhập số ngày gia hạn thêm (giá trị > 0). Mặc định gợi ý theo kỳ đóng lãi.
  * **Ghi chú (Notes):** Nhập nội dung diễn giải (Ví dụ: "Gia hạn thêm 10 ngày").
* **Xác nhận Gia hạn (Nhấn nút "Gia hạn"):**
  * Hệ thống xác định ngày đáo hạn hiện tại của hợp đồng: `Ngày đáo hạn cũ` = `Ngày giải ngân` + `Tổng số ngày vay` (gồm các lần gia hạn trước nếu có).
  * **Tính toán ngày đáo hạn mới:** `Ngày đáo hạn mới` = `Ngày đáo hạn cũ` + `Số ngày gia hạn thêm`.
  * **Khởi tạo bản ghi gia hạn:** Ghi nhận 1 bản ghi vào bảng `pawn_contract_extensions` lưu vết: `from_date` = `Ngày đáo hạn cũ`, `to_date` = `Ngày đáo hạn mới`, `extension_days` = `Số ngày gia hạn thêm`, `content` = "Gia hạn thêm x ngày".
  * **Cập nhật thông số hợp đồng:** Cộng dồn số ngày gia hạn thêm vào cột `loan_days` trong bảng `pawn_contracts` (Tổng số ngày vay tăng lên).
  * **Tạo lịch đóng lãi bổ sung:** 
    * Hệ thống tự động sinh thêm các kỳ đóng lãi dự kiến mới trong bảng `pawn_interest_payments` tương ứng với khoảng thời gian gia hạn thêm vừa tạo (bắt đầu từ ngày kết thúc của kỳ cuối cùng trước đó đến ngày đáo hạn mới), áp dụng dư nợ gốc hiện tại của hợp đồng.
  * **Tác động dòng tiền quỹ:** Nghiệp vụ gia hạn thuần túy **không trực tiếp phát sinh dòng tiền** thu/chi tại két, trừ khi phát sinh đóng tiền lãi cho các kỳ mới (được xử lý thông qua phân hệ Đóng tiền lãi).

##### B. Nghiệp vụ Hủy giao dịch Gia hạn (Delete Extension)
* Cho phép xóa bản ghi lịch sử gia hạn gần nhất để khôi phục thời hạn hợp đồng về mốc cũ.
* **Quy tắc ràng buộc:** Chỉ cho phép hủy bản ghi gia hạn nếu **các kỳ đóng lãi mới phát sinh từ đợt gia hạn này chưa được thanh toán** (`is_paid = false`). Nếu đã có kỳ đóng lãi nào trong đợt gia hạn này được tích chọn thanh toán, hệ thống yêu cầu nhân viên phải hủy thu tiền lãi trước khi xóa lịch sử gia hạn.
* **Đảo ngược dữ liệu:**
  * **Khôi phục thông số hợp đồng:** Trừ bớt số ngày gia hạn ra khỏi cột `loan_days` trong bảng `pawn_contracts` để trả ngày đáo hạn về mốc cũ.
  * **Xóa kỳ đóng lãi thừa:** Xóa toàn bộ các bản ghi kỳ đóng lãi dự kiến mới được sinh ra trong đợt gia hạn này trong bảng `pawn_interest_payments`.
  * Xóa bản ghi lịch sử gia hạn tương ứng trong bảng `pawn_contract_extensions`.

#### 4.5. Chuộc đồ (Redeem / Close Contract)
Tất toán toàn bộ hợp đồng cầm đồ, khách hàng thanh toán dư nợ gốc còn lại cùng toàn bộ lãi phí phát sinh để nhận lại tài sản thế chấp.

##### A. Nghiệp vụ Chuộc đồ (Redeem Transaction)
* **Form Nhập liệu & Thông tin hiển thị (Theo giao diện đính kèm):**
  * **Ngày Chuộc đồ (Redeem Date):** Bắt buộc chọn, mặc định là ngày hiện tại.
  * **Tiền cầm (Outstanding Loan Amount):** Chỉ hiển thị, hiển thị dư nợ gốc hiện tại của hợp đồng (`loan_amount` trong `pawn_contracts`).
  * **Nợ cũ (Outstanding Debt):** Chỉ hiển thị, hiển thị tổng số tiền lãi/phí còn nợ của các kỳ đóng lãi cũ trước đây chưa thanh toán xong.
  * **Tiền lãi (Accumulated Interest):** Chỉ hiển thị, hiển thị tiền lãi lũy kế tính từ ngày kết thúc của kỳ đóng lãi có trả tiền gần nhất đến Ngày Chuộc đồ.
  * **Tiền khác (Other Amount):** Bắt buộc nhập (mặc định = 0), cho phép nhập chi phí phát sinh bổ sung hoặc giảm trừ khi chuộc đồ.
  * **Tổng tiền chuộc (Total Redeem Amount):** Chỉ hiển thị, tự động tính toán theo công thức:
    $$\text{Tổng tiền chuộc} = \text{Tiền cầm} + \text{Nợ cũ} + \text{Tiền lãi} + \text{Tiền khác}$$
* **Xác nhận Chuộc đồ (Nhấn nút "Chuộc đồ"):**
  * Hệ thống cập nhật trạng thái hợp đồng thành `closed` (Đã chuộc đồ) trong bảng `pawn_contracts`.
  * **Cập nhật các kỳ đóng lãi liên quan:**
    * Đánh dấu toàn bộ các kỳ đóng lãi chưa đóng (`is_paid = false`) trước hoặc trùng ngày chuộc đồ thành đã đóng (`is_paid = true`), cập nhật `actual_paid` tương ứng và gán `paid_date` = `Ngày Chuộc đồ`.
    * Xóa bỏ hoàn toàn các kỳ đóng lãi dự kiến có ngày bắt đầu (`from_date`) sau Ngày Chuộc đồ trong bảng `pawn_interest_payments`.
  * **Tác động dòng tiền quỹ:** Cộng trực tiếp số tiền `Tổng tiền chuộc` thực tế nhận được vào Quỹ tiền mặt hiện tại (`current_cash` trong bảng `daily_cash` tại ngày chuộc), đồng thời ghi nhận 1 bản ghi tăng quỹ vào nhật ký `cash_fund_history` với kiểu giao dịch là `redeem`.
  * **Lưu thông tin chi tiết chuộc đồ:** Ghi nhận 1 bản ghi vào bảng `pawn_redemptions` lưu vết chi tiết giao dịch tất toán này.

##### B. Nghiệp vụ Hủy giao dịch Chuộc đồ (Delete Redeem)
* Cho phép xóa giao dịch chuộc đồ để khôi phục hợp đồng cầm đồ về trạng thái hoạt động bình thường.
* **Đảo ngược dữ liệu:**
  * **Khôi phục trạng thái hợp đồng:** Cập nhật cột `status` trong `pawn_contracts` từ `closed` quay lại trạng thái trước đó (ví dụ: `active` hoặc `overdue`).
  * **Tác động dòng tiền quỹ:** Khấu trừ trực tiếp số tiền `Tổng tiền chuộc` đã nhận ra khỏi Quỹ tiền mặt hiện tại (`current_cash` trong bảng `daily_cash`), và xóa bản ghi nhật ký quỹ liên quan trong `cash_fund_history`.
  * **Khôi phục lịch đóng lãi:**
    * Chuyển các kỳ đóng lãi đã bị tự động tích đóng trong đợt chuộc đồ quay lại trạng thái chưa đóng (`is_paid = false`, `actual_paid = 0`, `paid_date = null`).
    * Tái sinh/khôi phục lại các kỳ đóng lãi dự kiến tương lai đã bị xóa trong đợt chuộc đồ theo thông số ban đầu của hợp đồng.
  * Xóa bản ghi giao dịch chuộc đồ tương ứng trong bảng `pawn_redemptions`.

#### 4.6. Nợ (Debt Management)
Chức năng cho phép quản lý dư nợ lãi hoặc gốc phát sinh khi khách hàng đóng tiền thiếu (nợ lại) và trả các khoản nợ này sau đó.

##### A. Nghiệp vụ Ghi nợ (Record Outstanding Debt)
* **Form Nhập liệu (Khách hàng nợ lại - Trả tiền thừa):**
  * **Số tiền nợ lại (Debt Amount):** Bắt buộc nhập, giá trị lớn hơn 0.
* **Xác nhận Ghi nợ (Nhấn nút "Ghi nợ"):**
  * **Cập nhật số nợ hợp đồng:** Cộng dồn trực tiếp số tiền này vào số dư nợ của hợp đồng (`debt_amount` trong bảng `pawn_contracts`).
  * **Tạo lịch sử nợ:** Hệ thống thêm một bản ghi giao dịch vào bảng `pawn_debt_history` với kiểu `record_debt` (ghi nhận khách nợ lại).
  * **Tác động dòng tiền quỹ:** Hoạt động ghi nợ **không phát sinh dòng tiền** thực tế vào két của cửa hàng (Quỹ tiền mặt giữ nguyên).

##### B. Nghiệp vụ Trả nợ (Pay Debt)
* **Form Nhập liệu (Khách hàng trả nợ):**
  * **Số tiền trả nợ (Payment Amount):** Bắt buộc nhập, giá trị lớn hơn 0 và không vượt quá số dư nợ hiện tại của hợp đồng (`debt_amount`).
* **Xác nhận Trả nợ (Nhấn nút "Thanh toán"):**
  * **Cập nhật số nợ hợp đồng:** Khấu trừ trực tiếp số tiền thanh toán này khỏi số dư nợ hiện tại của hợp đồng (`debt_amount` giảm xuống).
  * **Tạo lịch sử nợ:** Hệ thống thêm một bản ghi giao dịch vào bảng `pawn_debt_history` với kiểu `pay_debt`.
  * **Tác động dòng tiền quỹ:** Cộng trực tiếp số tiền trả nợ này vào Quỹ tiền mặt hiện tại (`current_cash` trong bảng `daily_cash` tại ngày trả nợ), đồng thời ghi nhận 1 bản ghi tăng quỹ vào `cash_fund_history` với loại điều chỉnh `debt_payment`.

##### C. Nghiệp vụ Hủy giao dịch Nợ (Delete Debt History Entry)
* Cho phép nhân viên xóa bản ghi lịch sử nợ cũ để khôi phục trạng thái nợ ban đầu của hợp đồng.
* **Đảo ngược dữ liệu:**
  * **Trường hợp hủy giao dịch Ghi nợ (`record_debt`):**
    * Trừ bớt số tiền nợ đã ghi ra khỏi cột `debt_amount` trong `pawn_contracts` (Dư nợ giảm xuống).
    * Xóa bản ghi giao dịch trong bảng `pawn_debt_history`.
  * **Trường hợp hủy giao dịch Trả nợ (`pay_debt`):**
    * Cộng ngược lại số tiền trả nợ vào cột `debt_amount` trong `pawn_contracts` (Dư nợ tăng lên mốc cũ).
    * Khấu trừ số tiền trả nợ ra khỏi Quỹ tiền mặt hiện tại (`current_cash` trong bảng `daily_cash`), và xóa bản ghi nhật ký quỹ liên quan trong `cash_fund_history`.
    * Xóa bản ghi giao dịch trong bảng `pawn_debt_history`.

#### 4.7. Chứng từ (Document Management)
Quản lý hình ảnh hồ sơ khách hàng và tài liệu chứng từ pháp lý đính kèm hợp đồng cầm đồ.

##### A. Tích hợp Lưu trữ bằng Google Apps Script & Google Drive
Để tối ưu dung lượng lưu trữ trên hệ thống cơ sở dữ liệu chính (PostgreSQL), hình ảnh chứng từ sẽ **không được lưu trực tiếp** dưới dạng nhị phân (BLOB/bytea) hoặc chuỗi Base64 trong database chính. Thay vào đó, quy trình tải và lưu ảnh hoạt động như sau:
1. **Quy trình Tải lên (Upload Flow):**
   * **Giao diện Client (React SPA):** Người dùng thả tệp hoặc chọn ảnh từ máy tính trong 2 vùng upload:
     * **Upload ảnh khách hàng** (Chỉ cho phép định dạng ảnh, ví dụ: `.jpg`, `.jpeg`, `.png`, `.webp`).
     * **Upload ảnh chứng từ hợp đồng** (Chỉ cho phép định dạng ảnh).
   * **Gọi Google Apps Script API:** Frontend mã hóa ảnh thành luồng dữ liệu (hoặc sử dụng `FormData`/Base64) và gửi HTTP POST request trực tiếp đến **Web App URL** của dịch vụ Google Apps Script viết riêng.
   * **Xử lý tại Google Apps Script:** 
     * Script nhận dữ liệu ảnh, giải mã và sử dụng dịch vụ `DriveApp` của Google để tạo tệp hình ảnh trực tiếp trong thư mục Google Drive được chỉ định (được cấu trúc theo cửa hàng hoặc mã hợp đồng để dễ quản lý).
     * Script thiết lập quyền xem tệp (Public link hoặc link chia sẻ cho tổ chức) và trả về HTTP Response dạng JSON chứa: Trạng thái upload (thành công/thất bại), Đường dẫn truy cập ảnh trực tiếp (`image_url`), và Google Drive File ID (`file_id`).
   * **Ghi nhận tại Database chính:** After nhận phản hồi thành công từ Google Apps Script, Client gửi yêu cầu kèm URL trả về đến API của máy chủ chính để ghi nhận thông tin vào bảng `pawn_contract_documents`.

##### B. Nghiệp vụ Xóa Chứng từ (Delete Document)
* Khi người dùng thực hiện xóa ảnh chứng từ khỏi giao diện:
  * Hệ thống xóa bản ghi liên quan trong bảng `pawn_contract_documents`.
  * **Gọi API Apps Script để xóa tệp trên Drive:** (Tùy chọn cấu hình) Hệ thống có thể gửi một yêu cầu REST đến Apps Script API để chuyển tệp hình ảnh tương ứng trong Google Drive vào Thùng rác (`file.setTrashed(true)`) bằng File ID nhằm giải phóng bộ nhớ Drive.

#### 4.8. Lịch sử & Nhắc nợ (Audit Logs & Debt Reminders)
Quản lý lịch sử nhắc nợ khách hàng và nhật ký biến động tài chính chi tiết của hợp đồng.

##### A. Lịch sử nhắc nợ (Debt Reminders Log)
* Phân hệ này dùng để ghi nhận các hành động đôn đốc, nhắc nhở khách hàng trả lãi hoặc trả gốc (ví dụ: gọi điện thoại, gửi tin nhắn, gặp trực tiếp).
* **Nghiệp vụ thực hiện:**
  * Nhân viên nhập nội dung vào ô **Nội dung nhắc nợ** (Bắt buộc) và nhấn nút **Lưu lại**.
  * Hệ thống tạo một bản ghi mới trong bảng `pawn_debt_reminders` chứa nội dung nhắc nợ, thời gian lưu và người thực hiện thao tác.
  * **Hiển thị:** Danh sách lịch sử nhắc nợ hiển thị bảng với các cột: `STT`, `Thời gian` (ngày giờ nhập), `Người thao tác` (Tài khoản nhân viên nhập), `Nội dung`.

##### B. Lịch sử thao tác tài chính (Contract Operations Ledger)
* Phân hệ này là bảng đối chiếu tài chính chi tiết, hoạt động giống như một sổ cái phụ (ledger) tự động ghi nhận lại toàn bộ lịch sử biến động tiền mặt, nợ gốc, và lãi suất của hợp đồng trong suốt vòng đời của nó.
* **Quy tắc ghi log tự động:**
  * Bất cứ khi nào phát sinh giao dịch tài chính (Tạo mới hợp đồng, Đóng tiền lãi, Hủy đóng tiền lãi, Trả bớt gốc, Hủy trả bớt gốc, Vay thêm, Hủy vay thêm, Gia hạn, Hủy gia hạn, Chuộc đồ, Hủy chuộc đồ, Ghi nợ, Trả nợ, Hủy trả nợ), hệ thống đều **tự động chèn một bản ghi** vào bảng `pawn_transaction_ledger`.
  * **Cấu trúc số tiền:**
    * **Số tiền ghi nợ (Debit Amount):** Đại diện cho các dòng tiền đi ra khỏi két của cửa hàng hoặc tăng nghĩa vụ nợ gốc của khách hàng (ví dụ: Giải ngân tạo hợp đồng mới, Giải ngân vay thêm, Hoàn trả tiền mặt khi hủy thu lãi).
    * **Số tiền ghi có (Credit Amount):** Đại diện cho dòng tiền đi vào két cửa hàng hoặc làm giảm nghĩa vụ nợ của khách hàng (ví dụ: Thu tiền đóng lãi, Thu trả bớt gốc, Thu tiền chuộc đồ, Thu tiền trả nợ).
    * **Tiền khác (Other Amount):** Lưu trữ các khoản phí phạt, phí dịch vụ phát sinh ngoài đã được cộng gộp trong giao dịch đó.
  * **Tính toán chân trang bảng (Footer Summary Calculations):**
    * **Tổng tiền (Totals):** Cộng tổng tất cả các dòng của cột `Số tiền ghi nợ`, `Số tiền ghi có`, và `Tiền khác`.
    * **Chênh lệch (Difference):** Tính toán chênh lệch dòng tiền thực tế của hợp đồng theo công thức:
      $$\text{Chênh lệch} = \text{Tổng số tiền ghi có} - \text{Tổng số tiền ghi nợ}$$

#### 4.9. Hẹn giờ (Timer Reminders)
Quản lý các mốc thời gian hẹn gọi điện nhắc nợ, thu tiền hoặc làm việc với khách hàng trong tương lai.

##### A. Nghiệp vụ Tạo hẹn giờ (Create Timer)
* **Form Nhập liệu (Theo giao diện đính kèm):**
  * **Ngày hẹn (Appointment Date):** Bắt buộc chọn ngày hẹn trong tương lai, mặc định là ngày hiện tại.
  * **Ghi chú (Notes):** Nhập nội dung chi tiết cho cuộc hẹn/nhắc nhở.
* **Xác nhận Tạo hẹn giờ (Nhấn nút "Tạo hẹn giờ"):**
  * Hệ thống chèn một bản ghi hẹn giờ mới vào bảng `pawn_contract_reminders` với trạng thái `active`.
  * Tại một thời điểm, chỉ một lịch hẹn được coi là lịch hẹn hoạt động gần nhất để hiển thị thông báo nhắc nhở trên dashboard của giao dịch viên chi nhánh khi đến ngày hẹn.

##### B. Nghiệp vụ Dừng hẹn giờ (Stop Timer)
* Cho phép nhân viên chủ động dừng bộ hẹn giờ đang chạy nếu khách hàng đã phản hồi hoặc không cần nhắc nhở nữa.
* **Xác nhận Dừng (Nhấn nút "Dừng hẹn giờ"):**
  * Hệ thống cập nhật cột `status` của bản ghi hẹn giờ hiện tại trong bảng `pawn_contract_reminders` từ `active` thành `stopped`.

##### C. Hiển thị Lịch sử hẹn giờ (Timer History)
* Bảng lịch sử hiển thị các cột: `STT`, `Trạng thái` ("Hẹn giờ" nếu `active`, "Đã dừng" nếu `stopped`, "Đã xong" nếu `completed`), `Hẹn đến ngày`, `Nội dung hẹn giờ` (ghi chú nhập lúc hẹn), `Ngày tạo` (ngày giờ lập phiếu hẹn).

#### 4.10. Báo xấu (Blacklist / Bad Debt Reporting)
Đánh dấu các khách hàng có hành vi xấu (bùng nợ, lừa đảo, tài sản thế chấp giả/gian lận) để cảnh báo toàn hệ thống chuỗi chi nhánh nhằm ngăn chặn giao dịch trong tương lai.

##### A. Nghiệp vụ Báo xấu khách hàng (Confirm Blacklist Report)
* **Form Nhập liệu & Tự động điền (Theo giao diện đính kèm):**
  * **Tên khách hàng (Customer Name):** Bắt buộc hiển thị, tự động lấy họ tên khách hàng từ hợp đồng hiện tại (Không cho sửa đổi).
  * **Số điện thoại (Phone Number):** Bắt buộc hiển thị, tự động lấy SĐT từ hồ sơ khách hàng.
  * **Số CCCD/Hộ chiếu (ID Card):** Bắt buộc hiển thị, tự động lấy số CCCD từ hồ sơ khách hàng.
  * **Địa chỉ (Address):** Bắt buộc hiển thị, tự động lấy địa chỉ từ hồ sơ khách hàng.
  * **Nội dung báo (Reason):** Bắt buộc nhập chi tiết lý do báo xấu khách hàng (ví dụ: "Khách bùng nợ quá 60 ngày không liên lạc được, xe thế chấp không chính chủ").
* **Xác nhận Báo xấu (Nhấn nút "Xác nhận báo xấu"):**
  * **Cập nhật trạng thái khách hàng:** Hệ thống cập nhật thuộc tính `status` của bản ghi khách hàng trong bảng `customers` thành `'blacklist'`.
  * **Lưu nhật ký báo xấu:** Thêm 1 bản ghi mới vào bảng `customer_blacklist` lưu thông tin: ID khách hàng, ID nhân viên báo, ID cửa hàng báo, Lý do báo xấu và thời gian báo xấu.
  * **Hiệu ứng trên hệ thống:**
    * Mọi giao diện khi lập hợp đồng mới (cầm đồ hoặc tín chấp) nếu nhân viên chọn khách hàng này, hệ thống sẽ **ngay lập tức kiểm tra trạng thái và hiển thị cảnh báo đỏ nổi bật** (hoặc chặn không cho lập hợp đồng tùy theo thiết lập quyền quản trị) để bảo vệ dòng vốn của chuỗi cửa hàng.

#### 4.11. Quy tắc đồng bộ tài chính khi Sửa / Xóa Hợp đồng Cầm đồ (Financial Synchronization Rules on Pawn Contract Edit/Delete)

##### A. Khi Sửa Hợp đồng Cầm đồ
* **Ràng buộc sửa thông số tài chính:**
  * Nếu hợp đồng **đã phát sinh giao dịch phụ** (như Trả bớt gốc, Vay thêm, Gia hạn, Chuộc đồ, hoặc Ghi nợ/Trả nợ): Hệ thống **chặn hoàn toàn** việc sửa đổi các thông số tài chính cốt lõi (Số tiền vay `loan_amount`, ngày vay `loan_date`, hình thức lãi, thời hạn vay). Nhân viên phải thực hiện xóa/hủy tất cả giao dịch phụ này trước khi tiến hành sửa đổi hợp đồng gốc.
  * Nếu hợp đồng **chỉ mới phát sinh giao dịch đóng lãi**:
    * Các kỳ đóng lãi đã thanh toán (`is_paid = true`): Giữ nguyên số tiền thực tế đã thu và thông tin liên quan để bảo toàn tính pháp lý lịch sử của dòng tiền quỹ két.
    * Các kỳ đóng lãi chưa thanh toán (`is_paid = false`): Hệ thống xóa bỏ và sinh lại theo các thông số mới sau khi cập nhật hợp đồng.
* **Đồng bộ Quỹ tiền mặt chi nhánh khi sửa số tiền vay:**
  * Hệ thống tính chênh lệch dòng tiền giải ngân ròng thực tế:
    $$\Delta = \text{Số tiền giải ngân mới} - \text{Số tiền giải ngân cũ}$$
    *(Trong đó: Số tiền giải ngân = Số tiền vay gốc - Tiền lãi thu trước (nếu có))*
  * Nếu $\Delta > 0$ (Khách hàng được vay thêm tiền mặt): Khấu trừ trực tiếp số tiền $\Delta$ ra khỏi Quỹ tiền mặt hiện tại (`current_cash` trong `daily_cash`), ghi nhận 1 bản ghi giảm quỹ vào `cash_fund_history` với kiểu `contract_edit`.
  * Nếu $\Delta < 0$ (Cửa hàng thu bớt tiền cho vay): Cộng trực tiếp số tiền $|\Delta|$ vào Quỹ tiền mặt hiện tại (`current_cash` trong `daily_cash`), ghi nhận 1 bản ghi tăng quỹ vào `cash_fund_history` với kiểu `contract_edit`.
* **Đồng bộ Sổ cái phụ hợp đồng:**
  * Cập nhật bản ghi giải ngân ban đầu trong bảng `pawn_transaction_ledger`:
    * Thay đổi `debit_amount` bằng số tiền giải ngân thực tế mới.
    * Cập nhật mô tả nội dung và thời gian thao tác.

##### B. Khi Xóa Hợp đồng Cầm đồ
* **Quy tắc hoàn trả dòng tiền quỹ két:**
  * Để tránh làm sai lệch số dư quỹ tiền mặt thực tế tại chi nhánh khi xóa hoàn toàn một hợp đồng đã phát sinh giao dịch thu chi, hệ thống thực hiện tính toán dòng tiền ròng thực tế đã phát sinh:
    $$\text{Dòng tiền ròng đã phát sinh} = \text{Tổng số tiền thực tế đã thu vào} - \text{Tổng số tiền thực tế đã chi ra}$$
    * *Các khoản thu vào:* Tiền đóng lãi, tiền khách trả bớt gốc, tiền chuộc đồ, tiền trả nợ.
    * *Các khoản chi ra:* Tiền giải ngân ban đầu (tiền vay trừ lãi trước nếu có), tiền vay thêm, tiền chi hoàn trả.
  * Hệ thống thực hiện giao dịch đảo ngược quỹ:
    * Nếu `Dòng tiền ròng` > 0 (Cửa hàng đang thu ròng): Hệ thống **khấu trừ** số tiền này khỏi Quỹ tiền mặt hiện tại (`current_cash` trong `daily_cash`).
    * Nếu `Dòng tiền ròng` < 0 (Cửa hàng đang chi ròng): Hệ thống **cộng hoàn trả** số tiền mặt này vào Quỹ tiền mặt hiện tại (`current_cash` trong `daily_cash`).
    * Ghi nhận 1 bản ghi biến động quỹ vào `cash_fund_history` diễn giải: "Khấu trừ/Hoàn trả quỹ do xóa hợp đồng [Mã hợp đồng]".
* **Xóa dữ liệu liên đới (Cascade Delete):**
  * Tự động xóa sạch toàn bộ các bản ghi liên quan của hợp đồng cầm đồ trong các bảng phụ:
    * `pawn_interest_payments` (Lịch đóng lãi)
    * `pawn_principal_transactions` (Lịch sử biến động gốc)
    * `pawn_contract_extensions` (Gia hạn)
    * `pawn_redemptions` (Chuộc đồ)
    * `pawn_debt_history` (Lịch sử nợ)
    * `pawn_debt_reminders` (Nhắc nợ)
    * `pawn_transaction_ledger` (Sổ cái giao dịch)
    * `pawn_contract_documents` (Gọi Apps Script Web App API để xóa các tệp ảnh tương ứng trên Google Drive qua File ID).
  * Cuối cùng, xóa bản ghi hợp đồng trong bảng chính `pawn_contracts`.

---

### 5. Thiết kế Database các bảng phụ cho Hợp đồng Cầm đồ

#### Bảng A: Bảng `pawn_interest_payments` (Kỳ đóng lãi cầm đồ)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính của kỳ đóng lãi. |
| `contract_id` | `uuid` | NOT NULL, FOREIGN KEY references `pawn_contracts(id)` ON DELETE CASCADE | Liên kết đến hợp đồng cầm đồ. |
| `cycle_number` | `integer` | NOT NULL | Số thứ tự của kỳ đóng lãi (1, 2, 3...). |
| `from_date` | `date` | NOT NULL | Ngày bắt đầu tính lãi của kỳ. |
| `to_date` | `date` | NOT NULL | Ngày kết thúc tính lãi của kỳ. |
| `expected_days` | `integer` | NOT NULL | Số ngày tính lãi dự kiến trong kỳ. |
| `expected_interest` | `numeric(15, 2)` | NOT NULL, Default: `0` | Tiền lãi tính toán dự kiến của kỳ. |
| `expected_principal` | `numeric(15, 2)` | NOT NULL, Default: `0` | Tiền gốc đóng kèm dự kiến (nếu có). |
| `other_amount` | `numeric(15, 2)` | NOT NULL, Default: `0` | Tiền phí khác phát sinh thêm. |
| `actual_paid` | `numeric(15, 2)` | NOT NULL, Default: `0` | Số tiền khách thực tế trả (dùng để tăng quỹ két). |
| `paid_date` | `date` | NULL | Ngày khách đóng tiền thực tế. |
| `is_paid` | `boolean` | NOT NULL, Default: `false` | Đã thanh toán hay chưa (Checked). |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo bản ghi. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### Bảng B: Bảng `pawn_principal_transactions` (Lịch sử biến động nợ gốc)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính giao dịch gốc. |
| `contract_id` | `uuid` | NOT NULL, FOREIGN KEY references `pawn_contracts(id)` ON DELETE CASCADE | Liên kết đến hợp đồng cầm đồ. |
| `transaction_date` | `date` | NOT NULL | Ngày thực hiện giao dịch (ngày trả gốc / vay thêm). |
| `type` | `varchar(20)` | NOT NULL, CHECK (`type` IN ('pay_down', 'borrow_more')) | Phân loại loại hình giao dịch. |
| `amount` | `numeric(15, 2)` | NOT NULL | Số tiền biến động (Luôn dương). |
| `notes` | `text` | NULL | Ghi chú diễn giải. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian lập giao dịch. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### Bảng C: Bảng `pawn_contract_extensions` (Lịch sử gia hạn hợp đồng cầm đồ)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính của bản ghi gia hạn. |
| `contract_id` | `uuid` | NOT NULL, FOREIGN KEY references `pawn_contracts(id)` ON DELETE CASCADE | Liên kết đến hợp đồng cầm đồ. |
| `from_date` | `date` | NOT NULL | Ngày đáo hạn cũ trước khi gia hạn. |
| `to_date` | `date` | NOT NULL | Ngày đáo hạn mới sau khi gia hạn. |
| `extension_days` | `integer` | NOT NULL | Số ngày được gia hạn thêm. |
| `content` | `varchar(255)` | NOT NULL | Nội dung tự sinh (ví dụ: "Gia hạn thêm 10 ngày"). |
| `notes` | `text` | NULL | Ghi chú thủ công của nhân viên. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian lập gia hạn. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### Bảng D: Bảng `pawn_redemptions` (Lịch sử giao dịch chuộc đồ)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính giao dịch chuộc đồ. |
| `contract_id` | `uuid` | NOT NULL, UNIQUE, FOREIGN KEY references `pawn_contracts(id)` ON DELETE CASCADE | Liên kết duy nhất đến hợp đồng cầm đồ. |
| `redeem_date` | `date` | NOT NULL | Ngày thực hiện chuộc đồ. |
| `loan_amount` | `numeric(15, 2)` | NOT NULL | Số dư nợ gốc thực tế lúc chuộc đồ. |
| `outstanding_debt` | `numeric(15, 2)` | NOT NULL | Số tiền nợ cũ tích lũy chưa đóng. |
| `interest_amount` | `numeric(15, 2)` | NOT NULL | Tiền lãi tính dồn đến ngày chuộc. |
| `other_amount` | `numeric(15, 2)` | NOT NULL | Chi phí khác/Phí phạt/Phí giảm trừ. |
| `total_amount` | `numeric(15, 2)` | NOT NULL | Tổng tiền chuộc đồ thực tế. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo giao dịch. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### Bảng E: Bảng `pawn_debt_history` (Lịch sử nợ hợp đồng cầm đồ)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính của bản ghi nợ. |
| `contract_id` | `uuid` | NOT NULL, FOREIGN KEY references `pawn_contracts(id)` ON DELETE CASCADE | Liên kết đến hợp đồng cầm đồ. |
| `transaction_date` | `date` | NOT NULL | Ngày thực hiện giao dịch nợ. |
| `type` | `varchar(20)` | NOT NULL, CHECK (`type` IN ('record_debt', 'pay_debt')) | Loại giao dịch: `record_debt` (ghi nợ), `pay_debt` (trả nợ). |
| `amount` | `numeric(15, 2)` | NOT NULL | Số tiền giao dịch (luôn dương). |
| `notes` | `text` | NULL | Ghi chú thêm. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### Bảng F: Bảng `pawn_contract_documents` (Lưu trữ URL ảnh chứng từ hợp đồng)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính của chứng từ. |
| `contract_id` | `uuid` | NOT NULL, FOREIGN KEY references `pawn_contracts(id)` ON DELETE CASCADE | Liên kết đến hợp đồng cầm đồ. |
| `document_type` | `varchar(30)` | NOT NULL, CHECK (`document_type` IN ('customer_photo', 'contract_document')) | Phân loại loại ảnh: `customer_photo` (ảnh khách hàng), `contract_document` (ảnh chứng từ hợp đồng). |
| `image_url` | `text` | NOT NULL | URL liên kết ảnh lưu trên Google Drive do Apps Script API trả về. |
| `google_drive_file_id` | `varchar(100)` | NULL | File ID của tệp trên Google Drive (phục vụ cho việc xóa tệp sau này). |
| `file_name` | `varchar(255)` | NULL | Tên tệp tin gốc khi upload. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tải lên. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### Bảng G: Bảng `pawn_debt_reminders` (Nhật ký nhắc nợ hợp đồng)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `contract_id` | `uuid` | NOT NULL, FOREIGN KEY references `pawn_contracts(id)` ON DELETE CASCADE | Liên kết đến hợp đồng cầm đồ. |
| `employee_id` | `uuid` | NOT NULL, FOREIGN KEY references `employees(id)` | Nhân viên thực hiện nhắc nợ. |
| `content` | `text` | NOT NULL | Nội dung chi tiết cuộc nhắc nợ. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian lưu nhắc nợ. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### Bảng H: Bảng `pawn_transaction_ledger` (Sổ cái giao dịch tài chính hợp đồng)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính bản ghi sổ cái. |
| `contract_id` | `uuid` | NOT NULL, FOREIGN KEY references `pawn_contracts(id)` ON DELETE CASCADE | Liên kết đến hợp đồng cầm đồ. |
| `employee_id` | `uuid` | NOT NULL, FOREIGN KEY references `employees(id)` | Giao dịch viên thực hiện. |
| `debit_amount` | `numeric(15, 2)` | NOT NULL, Default: `0` | Số tiền ghi nợ (Dòng tiền đi ra/Tăng nợ). |
| `credit_amount` | `numeric(15, 2)` | NOT NULL, Default: `0` | Số tiền ghi có (Dòng tiền đi vào/Giảm nợ). |
| `other_amount` | `numeric(15, 2)` | NOT NULL, Default: `0` | Phí khác/Phần tiền phát sinh thêm. |
| `action_type` | `varchar(50)` | NOT NULL | Loại thao tác (ví dụ: `create_contract`, `pay_interest`, `cancel_interest`, `pay_principal`, `cancel_principal`...). |
| `content` | `text` | NOT NULL | Nội dung mô tả hành động (ví dụ: "Tạo mới hợp đồng", "Đóng tiền lãi"). |
| `notes` | `text` | NULL | Ghi chú thêm chi tiết (ví dụ: thông tin kỳ đóng lãi). |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian phát sinh giao dịch. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật. |

#### Bảng I: Bảng `pawn_contract_reminders` (Nhật ký hẹn giờ hợp đồng)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `contract_id` | `uuid` | NOT NULL, FOREIGN KEY references `pawn_contracts(id)` ON DELETE CASCADE | Liên kết đến hợp đồng cầm đồ. |
| `reminder_date` | `date` | NOT NULL | Ngày hẹn giờ nhắc nhở. |
| `status` | `varchar(20)` | NOT NULL, Default: `'active'`, CHECK (`status` IN ('active', 'stopped', 'completed')) | Trạng thái hẹn giờ (`active` - hẹn giờ, `stopped` - đã dừng, `completed` - đã xong). |
| `content` | `text` | NULL | Nội dung hẹn giờ / Ghi chú hẹn giờ. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo lịch hẹn. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### Bảng J: Bảng `customer_blacklist` (Nhật ký báo xấu khách hàng)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `customer_id` | `uuid` | NOT NULL, FOREIGN KEY references `customers(id)` ON DELETE CASCADE | Liên kết khách hàng bị báo xấu. |
| `reporter_id` | `uuid` | NOT NULL, FOREIGN KEY references `employees(id)` | Nhân viên thực hiện báo xấu. |
| `store_id` | `uuid` | NOT NULL, FOREIGN KEY references `stores(id)` | Chi nhánh phát hiện và báo xấu. |
| `reason` | `text` | NOT NULL | Nội dung/Lý do báo xấu khách hàng. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian báo xấu. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

---

## MODULE 10: QUẢN LÝ HỢP ĐỒNG TÍN CHẤP (UNSECURED LOAN CONTRACTS)

### 1. Ý nghĩa & Vai trò
* Hợp đồng tín chấp vay dựa trên uy tín hoặc giấy tờ tùy thân giữ lại làm tin (không thế chấp tài sản vật lý lưu kho).
* Quy tắc tự tăng mã hợp đồng dạng `TCxxxx` và tự mở rộng sau `TC9999` (ví dụ: `TC10000`). Quy tắc quản lý dòng tiền giải ngân, sửa/xóa đồng bộ tương tự như Hợp đồng cầm đồ.

### 2. Các trường thông tin chi tiết
* Khách hàng: Họ tên (bắt buộc), Mã hợp đồng (tự sinh, duy nhất), Số CCCD, Điện thoại, Địa chỉ.
* Khoản vay: Loại tài sản (CMND, Bằng lái xe... hoặc NULL nếu không giữ giấy tờ), Tổng tiền vay, Thu lãi trước, Hình thức lãi, Số ngày vay, Kỳ lãi (Period Value - đơn vị động theo gói lãi), Lãi phí, Ngày vay.
* Khác: Nhân viên thu (bắt buộc), Cộng tác viên, Ghi chú.

### 3. Thiết kế Database: Bảng `unsecured_contracts`
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `store_id` | `uuid` | NOT NULL, FOREIGN KEY references `stores(id)` | Chi nhánh thực hiện. |
| `contract_code` | `varchar(50)` | NOT NULL, UNIQUE | Mã hợp đồng. |
| `customer_id` | `uuid` | NOT NULL, FOREIGN KEY references `customers(id)` | Khách hàng. |
| `commodity_id` | `uuid` | NULL, FOREIGN KEY references `commodities(id)` | Giấy tờ tín chấp giữ lại. |
| `loan_amount` | `numeric(15, 2)` | NOT NULL, Default: `0` | Số dư nợ gốc thực tế còn lại (giảm đi khi khách trả bớt gốc). |
| `initial_loan_amount` | `numeric(15, 2)` | NOT NULL, Default: `0` | Tổng gốc gốc vay ban đầu/gốc vay lũy kế chưa trừ gốc trả trước (dùng làm cơ sở tính lãi). |
| `interest_type_id` | `uuid` | NOT NULL, FOREIGN KEY references `interest_types(id)` | Hình thức tính lãi. |
| `is_upfront_interest` | `boolean` | NOT NULL, Default: `false` | Có thu lãi trước hay không. |
| `loan_days` | `integer` | NOT NULL | Thời gian vay (số ngày). |
| `period_value` | `integer` | NOT NULL | Giá trị của 1 kỳ đóng lãi. |
| `interest_rate` | `numeric(10, 2)` | NOT NULL | Lãi suất tính toán. |
| `loan_date` | `date` | NOT NULL | Ngày giải ngân. |
| `collector_id` | `uuid` | NOT NULL, FOREIGN KEY references `employees(id)` | Nhân viên thu nợ. |
| `collaborator_id` | `uuid` | NULL, FOREIGN KEY references `collaborators(id)` | CTV giới thiệu. |
| `status` | `varchar(20)` | NOT NULL, Default: `'active'` | Trạng thái (`active`, `overdue`, `closed`, `cancelled`). |
| `notes` | `text` | NULL | Ghi chú. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật. |

### 4. Quy tắc Tính lãi khi Trả bớt gốc (Interest Calculation Rule on Principal Pay Down)
* **Nguyên tắc cốt lõi:** Khác biệt hoàn toàn với Hợp đồng cầm đồ, đối với Hợp đồng tín chấp, **dù khách hàng thực hiện trả bớt gốc thì tiền lãi phát sinh ở tất cả các kỳ chưa thanh toán tiếp theo vẫn được tính theo số tiền vay ban đầu (gốc ban đầu)** chứ không được tính giảm đi theo dư nợ thực tế còn lại.
* **Quy tắc cập nhật số dư gốc dùng làm cơ sở tính lãi:**
  * **Khi Khởi tạo Hợp đồng:** Cả `loan_amount` (Dư nợ gốc hiện tại) và `initial_loan_amount` (Gốc gốc tính lãi) đều được gán bằng số tiền vay ban đầu.
  * **Khi Khách trả bớt gốc (Pay down):** Hệ thống cập nhật giảm `loan_amount` để theo dõi dư nợ gốc thực tế còn lại phục vụ chuộc/tất toán hợp đồng, nhưng **giữ nguyên không thay đổi** giá trị của `initial_loan_amount`. Do đó, khi tính lãi cho các kỳ kế tiếp (`is_paid = false`), công thức vẫn sử dụng `initial_loan_amount` làm cơ sở.
  * **Khi Khách vay thêm (Borrow more):** Hệ thống cập nhật tăng **cả hai cột** `loan_amount` và `initial_loan_amount` thêm một lượng tương ứng với số tiền vay thêm. Điều này phản ánh nghĩa vụ gốc vay lũy kế tăng lên, làm tăng số tiền lãi cơ sở của các kỳ tiếp theo.

### 5. Quy tắc đồng bộ tài chính khi Sửa / Xóa Hợp đồng Tín chấp (Financial Synchronization Rules on Unsecured Loan Contract Edit/Delete)

##### A. Khi Sửa Hợp đồng Tín chấp
* **Ràng buộc sửa thông số tài chính:**
  * Nếu hợp đồng **đã phát sinh giao dịch phụ** (như Trả bớt gốc, Vay thêm, Gia hạn, Tất toán, hoặc Ghi nợ/Trả nợ): Hệ thống **chặn hoàn toàn** việc sửa đổi các thông số tài chính cốt lõi (Số tiền vay `loan_amount`, `initial_loan_amount`, ngày vay `loan_date`, hình thức lãi, thời hạn vay). Nhân viên phải thực hiện xóa/hủy tất cả giao dịch phụ này trước khi tiến hành sửa đổi hợp đồng gốc.
  * Nếu hợp đồng **chỉ mới phát sinh giao dịch đóng lãi**:
    * Các kỳ đóng lãi đã thanh toán (`is_paid = true`): Giữ nguyên số tiền thực tế đã thu và thông tin liên quan để bảo toàn tính pháp lý lịch sử của dòng tiền quỹ két.
    * Các kỳ đóng lãi chưa thanh toán (`is_paid = false`): Hệ thống xóa bỏ và sinh lại theo các thông số mới sau khi cập nhật hợp đồng.
* **Đồng bộ Quỹ tiền mặt chi nhánh khi sửa số tiền vay:**
  * Hệ thống tính chênh lệch dòng tiền giải ngân ròng thực tế:
    $$\Delta = \text{Số tiền giải ngân mới} - \text{Số tiền giải ngân cũ}$$
    *(Trong đó: Số tiền giải ngân = Số tiền vay gốc - Tiền lãi thu trước (nếu có))*
  * Nếu $\Delta > 0$ (Khách hàng được vay thêm tiền mặt): Khấu trừ trực tiếp số tiền $\Delta$ ra khỏi Quỹ tiền mặt hiện tại (`current_cash` trong `daily_cash`), ghi nhận 1 bản ghi giảm quỹ vào `cash_fund_history` với kiểu `contract_edit`.
  * Nếu $\Delta < 0$ (Cửa hàng thu bớt tiền cho vay): Cộng trực tiếp số tiền $|\Delta|$ vào Quỹ tiền mặt hiện tại (`current_cash` trong `daily_cash`), ghi nhận 1 bản ghi tăng quỹ vào `cash_fund_history` với kiểu `contract_edit`.
* **Đồng bộ Sổ cái phụ hợp đồng:**
  * Cập nhật bản ghi giải ngân ban đầu trong bảng `unsecured_transaction_ledger`:
    * Thay đổi `debit_amount` bằng số tiền giải ngân thực tế mới.
    * Cập nhật mô tả nội dung và thời gian thao tác.

##### B. Khi Xóa Hợp đồng Tín chấp
* **Quy tắc hoàn trả dòng tiền quỹ két:**
  * Để tránh làm sai lệch số dư quỹ tiền mặt thực tế tại chi nhánh khi xóa hoàn toàn một hợp đồng đã phát sinh giao dịch thu chi, hệ thống thực hiện tính toán dòng tiền ròng thực tế đã phát sinh:
    $$\text{Dòng tiền ròng đã phát sinh} = \text{Tổng số tiền thực tế đã thu vào} - \text{Tổng số tiền thực tế đã chi ra}$$
    * *Các khoản thu vào:* Tiền đóng lãi, tiền khách trả bớt gốc, tiền chuộc đồ/tất toán, tiền trả nợ.
    * *Các khoản chi ra:* Tiền giải ngân ban đầu (tiền vay trừ lãi trước nếu có), tiền vay thêm, tiền chi hoàn trả.
  * Hệ thống thực hiện giao dịch đảo ngược quỹ:
    * Nếu `Dòng tiền ròng` > 0 (Cửa hàng đang thu ròng): Hệ thống **khấu trừ** số tiền này khỏi Quỹ tiền mặt hiện tại (`current_cash` trong `daily_cash`).
    * Nếu `Dòng tiền ròng` < 0 (Cửa hàng đang chi ròng): Hệ thống **cộng hoàn trả** số tiền mặt này vào Quỹ tiền mặt hiện tại (`current_cash` trong `daily_cash`).
    * Ghi nhận 1 bản ghi biến động quỹ vào `cash_fund_history` diễn giải: "Khấu trừ/Hoàn trả quỹ do xóa hợp đồng tín chấp [Mã hợp đồng]".
* **Xóa dữ liệu liên đới (Cascade Delete):**
  * Tự động xóa sạch toàn bộ các bản ghi liên quan của hợp đồng tín chấp trong các bảng phụ:
    * `unsecured_interest_payments` (Lịch đóng lãi)
    * `unsecured_principal_transactions` (Lịch sử biến động gốc)
    * `unsecured_contract_extensions` (Gia hạn)
    * `unsecured_redemptions` (Tất toán)
    * `unsecured_debt_history` (Lịch sử nợ)
    * `unsecured_debt_reminders` (Nhắc nợ)
    * `unsecured_transaction_ledger` (Sổ cái giao dịch)
    * `unsecured_contract_documents` (Gọi Apps Script Web App API để xóa các tệp ảnh tương ứng trên Google Drive qua File ID).
  * Cuối cùng, xóa bản ghi hợp đồng trong bảng chính `unsecured_contracts`.

---

### 6. Thiết kế Database các bảng phụ cho Hợp đồng Tín chấp

#### Bảng A: Bảng `unsecured_interest_payments` (Kỳ đóng lãi hợp đồng tín chấp)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính của kỳ đóng lãi. |
| `contract_id` | `uuid` | NOT NULL, FOREIGN KEY references `unsecured_contracts(id)` ON DELETE CASCADE | Liên kết đến hợp đồng tín chấp. |
| `cycle_number` | `integer` | NOT NULL | Số thứ tự của kỳ đóng lãi (1, 2, 3...). |
| `from_date` | `date` | NOT NULL | Ngày bắt đầu tính lãi của kỳ. |
| `to_date` | `date` | NOT NULL | Ngày kết thúc tính lãi của kỳ. |
| `expected_days` | `integer` | NOT NULL | Số ngày tính lãi dự kiến trong kỳ. |
| `expected_interest` | `numeric(15, 2)` | NOT NULL, Default: `0` | Tiền lãi tính toán dự kiến của kỳ (Tính dựa trên `initial_loan_amount`). |
| `expected_principal` | `numeric(15, 2)` | NOT NULL, Default: `0` | Tiền gốc đóng kèm dự kiến (nếu có). |
| `other_amount` | `numeric(15, 2)` | NOT NULL, Default: `0` | Tiền phí khác phát sinh thêm. |
| `actual_paid` | `numeric(15, 2)` | NOT NULL, Default: `0` | Số tiền khách thực tế trả (dùng để tăng quỹ két). |
| `paid_date` | `date` | NULL | Ngày khách đóng tiền thực tế. |
| `is_paid` | `boolean` | NOT NULL, Default: `false` | Đã thanh toán hay chưa (Checked). |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo bản ghi. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### Bảng B: Bảng `unsecured_principal_transactions` (Lịch sử biến động nợ gốc tín chấp)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính giao dịch gốc. |
| `contract_id` | `uuid` | NOT NULL, FOREIGN KEY references `unsecured_contracts(id)` ON DELETE CASCADE | Liên kết đến hợp đồng tín chấp. |
| `transaction_date` | `date` | NOT NULL | Ngày thực hiện giao dịch (ngày trả gốc / vay thêm). |
| `type` | `varchar(20)` | NOT NULL, CHECK (`type` IN ('pay_down', 'borrow_more')) | Phân loại loại hình giao dịch. |
| `amount` | `numeric(15, 2)` | NOT NULL | Số tiền biến động (Luôn dương). |
| `notes` | `text` | NULL | Ghi chú diễn giải. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian lập giao dịch. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### Bảng C: Bảng `unsecured_contract_extensions` (Lịch sử gia hạn hợp đồng tín chấp)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính của bản ghi gia hạn. |
| `contract_id` | `uuid` | NOT NULL, FOREIGN KEY references `unsecured_contracts(id)` ON DELETE CASCADE | Liên kết đến hợp đồng tín chấp. |
| `from_date` | `date` | NOT NULL | Ngày đáo hạn cũ trước khi gia hạn. |
| `to_date` | `date` | NOT NULL | Ngày đáo hạn mới sau khi gia hạn. |
| `extension_days` | `integer` | NOT NULL | Số ngày được gia hạn thêm. |
| `content` | `varchar(255)` | NOT NULL | Nội dung tự sinh. |
| `notes` | `text` | NULL | Ghi chú thủ công của nhân viên. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian lập gia hạn. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### Bảng D: Bảng `unsecured_redemptions` (Lịch sử giao dịch tất toán tín chấp)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính giao dịch tất toán. |
| `contract_id` | `uuid` | NOT NULL, UNIQUE, FOREIGN KEY references `unsecured_contracts(id)` ON DELETE CASCADE | Liên kết duy nhất đến hợp đồng tín chấp. |
| `redeem_date` | `date` | NOT NULL | Ngày thực hiện tất toán. |
| `loan_amount` | `numeric(15, 2)` | NOT NULL | Số dư nợ gốc thực tế lúc tất toán. |
| `outstanding_debt` | `numeric(15, 2)` | NOT NULL | Số tiền nợ cũ tích lũy chưa đóng. |
| `interest_amount` | `numeric(15, 2)` | NOT NULL | Tiền lãi tính dồn đến ngày chuộc/tất toán. |
| `other_amount` | `numeric(15, 2)` | NOT NULL | Chi phí khác/Phí phạt/Phí giảm trừ. |
| `total_amount` | `numeric(15, 2)` | NOT NULL | Tổng tiền tất toán thực tế. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo giao dịch. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### Bảng E: Bảng `unsecured_debt_history` (Lịch sử nợ hợp đồng tín chấp)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính của bản ghi nợ. |
| `contract_id` | `uuid` | NOT NULL, FOREIGN KEY references `unsecured_contracts(id)` ON DELETE CASCADE | Liên kết đến hợp đồng tín chấp. |
| `transaction_date` | `date` | NOT NULL | Ngày thực hiện giao dịch nợ. |
| `type` | `varchar(20)` | NOT NULL, CHECK (`type` IN ('record_debt', 'pay_debt')) | Loại giao dịch: `record_debt` (ghi nợ), `pay_debt` (trả nợ). |
| `amount` | `numeric(15, 2)` | NOT NULL | Số tiền giao dịch (luôn dương). |
| `notes` | `text` | NULL | Ghi chú thêm. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### Bảng F: Bảng `unsecured_contract_documents` (Lưu trữ URL ảnh chứng từ hợp đồng tín chấp)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính của chứng từ. |
| `contract_id` | `uuid` | NOT NULL, FOREIGN KEY references `unsecured_contracts(id)` ON DELETE CASCADE | Liên kết đến hợp đồng tín chấp. |
| `document_type` | `varchar(30)` | NOT NULL, CHECK (`document_type` IN ('customer_photo', 'contract_document')) | Phân loại loại ảnh. |
| `image_url` | `text` | NOT NULL | URL liên kết ảnh lưu trên Google Drive do Apps Script API trả về. |
| `google_drive_file_id` | `varchar(100)` | NULL | File ID của tệp trên Google Drive (phục vụ cho việc xóa tệp sau này). |
| `file_name` | `varchar(255)` | NULL | Tên tệp tin gốc khi upload. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tải lên. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### Bảng G: Bảng `unsecured_debt_reminders` (Nhật ký nhắc nợ hợp đồng tín chấp)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `contract_id` | `uuid` | NOT NULL, FOREIGN KEY references `unsecured_contracts(id)` ON DELETE CASCADE | Liên kết đến hợp đồng tín chấp. |
| `employee_id` | `uuid` | NOT NULL, FOREIGN KEY references `employees(id)` | Nhân viên thực hiện nhắc nợ. |
| `content` | `text` | NOT NULL | Nội dung chi tiết cuộc nhắc nợ. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian lưu nhắc nợ. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### Bảng H: Bảng `unsecured_transaction_ledger` (Sổ cái giao dịch tài chính hợp đồng tín chấp)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính bản ghi sổ cái. |
| `contract_id` | `uuid` | NOT NULL, FOREIGN KEY references `unsecured_contracts(id)` ON DELETE CASCADE | Liên kết đến hợp đồng tín chấp. |
| `employee_id` | `uuid` | NOT NULL, FOREIGN KEY references `employees(id)` | Giao dịch viên thực hiện. |
| `debit_amount` | `numeric(15, 2)` | NOT NULL, Default: `0` | Số tiền ghi nợ (Dòng tiền đi ra/Tăng nợ). |
| `credit_amount` | `numeric(15, 2)` | NOT NULL, Default: `0` | Số tiền ghi có (Dòng tiền đi vào/Giảm nợ). |
| `other_amount` | `numeric(15, 2)` | NOT NULL, Default: `0` | Phí khác/Phần tiền phát sinh thêm. |
| `action_type` | `varchar(50)` | NOT NULL | Loại thao tác (ví dụ: `create_contract`, `pay_interest`, `cancel_interest`, `pay_principal`, `cancel_principal`...). |
| `content` | `text` | NOT NULL | Nội dung mô tả hành động. |
| `notes` | `text` | NULL | Ghi chú thêm chi tiết. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian phát sinh giao dịch. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật. |
### 7. Phân hệ Vòng đời Hợp đồng Tín chấp (Unsecured Loan Contract Lifecycle Sub-features)
* Hợp đồng tín chấp bao gồm 10 phân hệ nghiệp vụ (tương ứng với 10 tab chức năng trên giao diện SPA của chi nhánh) tương tự như Hợp đồng cầm đồ, bao gồm:
  1. **Đóng tiền lãi** (Pay Interest): Thu tiền lãi theo lịch đóng lãi tự động của tín chấp.
  2. **Trả bớt gốc** (Pay down Principal): Form nhập tiền trả gốc, giảm dư nợ `loan_amount` của hợp đồng tín chấp. *Lưu ý: Tiền lãi các kỳ tiếp theo vẫn tính theo gốc ban đầu `initial_loan_amount`.*
  3. **Vay thêm** (Borrow more): Form nhập tiền vay thêm, tăng dư nợ `loan_amount` và gốc tính lãi `initial_loan_amount` của hợp đồng tín chấp.
  4. **Gia hạn** (Extend Contract): Form nhập số ngày gia hạn thêm và tự sinh lịch đóng lãi bổ sung.
  5. **Đóng HĐ** (Close Contract):
     * *Điểm khác biệt duy nhất về mặt tên gọi so với Hợp đồng cầm đồ:* Phân hệ này được đặt tên là **Đóng HĐ** thay vì **Chuộc đồ** (do không thế chấp tài sản vật lý để chuộc lại).
     * *Nhiệm vụ & Logic vận hành:* Hoàn toàn tương tự như nghiệp vụ chuộc đồ của hợp đồng cầm đồ:
       * Form hiển thị: Dư nợ gốc thực tế còn lại (`loan_amount`), Tiền nợ cũ tích lũy chưa đóng (`debt_amount`), Tiền lãi lũy kế tính đến ngày đóng hợp đồng, và ô nhập Tiền khác (phí phạt/phí dịch vụ hoặc tiền giảm trừ).
       * Hệ thống tính toán:
         $$\text{Tổng tiền đóng HĐ} = \text{Dư nợ gốc} + \text{Nợ cũ} + \text{Tiền lãi lũy kế} + \text{Tiền khác}$$
       * Khi xác nhận Đóng HĐ: Cập nhật trạng thái hợp đồng thành `closed` (Đã đóng), đánh dấu đã thanh toán tất cả các kỳ lãi đã đến hạn/chưa thanh toán, xóa bỏ các kỳ lãi phát sinh trong tương lai (sau ngày đóng HĐ), tăng Quỹ tiền mặt hiện tại (`current_cash`) tại chi nhánh và ghi nhận nhật ký quỹ `close_contract`, đồng thời lưu trữ chi tiết giao dịch vào bảng `unsecured_redemptions`.
  6. **Nợ** (Debt Management): Quản lý nợ lãi/gốc phát sinh khi khách đóng thiếu và trả nợ sau đó trên hợp đồng tín chấp.
  7. **Chứng từ** (Document Management): Tải lên ảnh khách hàng, ảnh hồ sơ/giấy tờ tín chấp (CMND, bằng lái...) lên Google Drive qua Apps Script bridge và lưu liên kết URL.
  8. **Lịch sử** (Audit Logs & Sổ cái): Sổ cái phụ tự động ghi nhận các giao dịch tài chính phát sinh nợ/có của hợp đồng tín chấp vào bảng `unsecured_transaction_ledger`.
  9. **Hẹn giờ** (Timer Reminders): Tạo lịch hẹn giờ gọi nhắc nợ hoặc làm việc trên hợp đồng tín chấp.
  10. **Báo xấu** (Blacklist / Bad Debt Reporting): Báo xấu khách hàng vi phạm nghĩa vụ thanh toán tín chấp lên danh sách đen toàn hệ thống.

---

## MODULE 11: QUẢN LÝ HỢP ĐỒNG TRẢ GÓP (INSTALLMENT LOAN CONTRACTS)

### 1. Ý nghĩa & Vai trò
* Phục vụ nghiệp vụ cho vay trả góp định kỳ (góp ngày/góp tháng), khách hàng thực hiện trả cả gốc và lãi được phân chia đều qua từng kỳ đóng tiền.
* **Quy tắc dòng tiền:** Tự động trừ quỹ tiền mặt chi nhánh giải ngân khi lập hợp đồng mới (khấu trừ kỳ đóng tiền đầu tiên nếu có chọn thu tiền trước). Khi sửa đổi hoặc xóa hợp đồng, tự động tính dòng tiền ròng thực tế phát sinh để điều chỉnh/hoàn trả quỹ két nhằm tránh chênh lệch số liệu thực tế.

### 2. Các trường thông tin chi tiết
* **Khách hàng:** Tên khách hàng (bắt buộc), Mã hợp đồng (tự sinh, duy nhất), Số CCCD/Hộ chiếu, Số điện thoại, Địa chỉ.
* **Thông tin trả góp:**
  * **Trả Góp (Repayment Amount):** Bắt buộc nhập (VNĐ). Đây là tổng số tiền vay khách hàng phải thanh toán trong suốt kỳ hạn hợp đồng (bao gồm cả gốc và lãi).
  * **Tiền đưa khách (Disbursed Amount):** Bắt buộc nhập (VNĐ). Đây là tổng số tiền thực tế ban đầu mà khách hàng nhận được khi giải ngân.
  * **Hình thức (Period Type):** Lựa chọn đóng tiền định kỳ (`Theo ngày` hoặc `Theo tháng`).
  * **Thu tiền trước (Is Upfront Collected):** Checkbox. Nếu tích chọn, khách hàng sẽ phải đóng trước kỳ tiền đầu tiên ngay khi giải ngân.
  * **Thời gian vay (Duration):** Bắt buộc nhập (số ngày hoặc số tháng tùy theo hình thức vay).
  * **Số ngày/tháng đóng tiền (Cycle Days):** Bắt buộc nhập. Khoảng cách giữa các kỳ đóng tiền (ví dụ: nhập số 3 nghĩa là 3 ngày đóng tiền 1 lần).
  * **Ngày vay (Loan Date):** Bắt buộc chọn ngày giải ngân hợp đồng.
* **Thông tin khác:** Nhân viên thu (bắt buộc), Cộng tác viên, Ghi chú.

### 3. Thiết kế Database: Bảng `installment_contracts`
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `store_id` | `uuid` | NOT NULL, FOREIGN KEY references `stores(id)` | Chi nhánh thực hiện giao dịch. |
| `contract_code` | `varchar(50)` | NOT NULL, UNIQUE | Mã hợp đồng (ví dụ: `TG0001`, `TG10000`). |
| `customer_id` | `uuid` | NOT NULL, FOREIGN KEY references `customers(id)` | Khách hàng vay trả góp. |
| `repayment_amount` | `numeric(15, 2)` | NOT NULL, Default: `0` | Tổng số tiền khách phải thanh toán (tiền Trả Góp). |
| `disbursed_amount` | `numeric(15, 2)` | NOT NULL, Default: `0` | Số tiền giải ngân dự kiến ban đầu (Tiền đưa khách). |
| `period_type` | `varchar(20)` | NOT NULL, CHECK (`period_type` IN ('daily', 'monthly')) | Hình thức chu kỳ (`daily` - ngày, `monthly` - tháng). |
| `loan_duration` | `integer` | NOT NULL | Thời gian vay (đơn vị ngày hoặc tháng). |
| `cycle_days` | `integer` | NOT NULL, Default: `1` | Khoảng cách kỳ đóng tiền (số ngày/tháng). |
| `is_upfront_collected` | `boolean` | NOT NULL, Default: `false` | Có thu tiền trước hay không. |
| `loan_date` | `date` | NOT NULL | Ngày giải ngân hợp đồng. |
| `collector_id` | `uuid` | NOT NULL, FOREIGN KEY references `employees(id)` | Nhân viên thu nợ. |
| `collaborator_id` | `uuid` | NULL, FOREIGN KEY references `collaborators(id)` | Cộng tác viên giới thiệu. |
| `debt_amount` | `numeric(15, 2)` | NOT NULL, Default: `0` | Số dư nợ lãi/gốc khách hàng đang nợ lại (khi đóng thiếu). |
| `status` | `varchar(20)` | NOT NULL, Default: `'active'` | Trạng thái (`active`, `overdue`, `closed`, `cancelled`). |
| `notes` | `text` | NULL | Ghi chú. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

### 4. Quy tắc Tính toán & Chia kỳ Đóng tiền (Calculation & Payment Cycle Generation Rules)

#### A. Thuật toán phân bổ kỳ đóng tiền dự kiến
* Khi hợp đồng được tạo ở trạng thái `active`, hệ thống sẽ tự động tính toán số kỳ đóng tiền $N$ và tạo danh sách kỳ hạn đóng tiền trong bảng `installment_payments`:
  $$\text{Số kỳ đóng tiền } N = \text{ceil}\left(\frac{\text{loan_duration}}{\text{cycle_days}}\right)$$
* Mỗi kỳ đóng tiền bao gồm: `cycle_number` (1, 2, 3...), `from_date`, `to_date`, `expected_days`, `expected_amount`.
  * **Kỳ 1:** Bắt đầu (`from_date`) từ `loan_date`. Ngày kết thúc kỳ (`to_date`) bằng `loan_date + cycle_days`.
  * **Kỳ k (với $k > 1$):** Bắt đầu (`from_date`) từ ngày kết thúc của kỳ trước (`to_date` của kỳ $k-1$). Ngày kết thúc kỳ (`to_date`) bằng `from_date + cycle_days`.
  * **Kỳ cuối cùng (Kỳ N):** Ngày kết thúc kỳ (`to_date`) phải khớp chính xác với ngày đáo hạn hợp đồng: `loan_date + loan_duration`. Nếu kỳ cuối bị lẻ số ngày (do thời hạn vay không chia hết cho kỳ đóng tiền), kỳ đó chỉ tính số ngày thực tế còn lại.
* **Số tiền đóng mỗi kỳ (Expected Amount):**
  * Số tiền chuẩn mỗi kỳ (làm tròn số):
    $$\text{expected_amount}_k = \text{round}\left(\frac{\text{repayment_amount}}{N}\right) \quad \text{với } k = 1 \dots N-1$$
  * Kỳ cuối cùng (Kỳ N) sẽ nhận toàn bộ số tiền chênh lệch làm tròn để đảm bảo tổng số tiền đóng bằng đúng `repayment_amount`:
    $$\text{expected_amount}_N = \text{repayment_amount} - \sum_{k=1}^{N-1} \text{expected_amount}_k$$

#### B. Quy tắc Thu tiền trước (Upfront Collection)
* Nếu người dùng tích chọn "Thu tiền trước" (`is_upfront_collected = true`):
  * Hệ thống tự động đánh dấu kỳ thứ 1 là đã thanh toán (`is_paid = true`), số tiền thực tế trả `actual_paid` gán bằng `expected_amount` của kỳ 1, và ngày đóng tiền `paid_date` là `loan_date`.
  * **Tác động dòng tiền giải ngân thực tế (Net Disbursement):** Số tiền chi ra khỏi Quỹ tiền mặt của cửa hàng tại ngày giải ngân sẽ giảm đi một lượng bằng đúng tiền kỳ 1:
    $$\text{Dòng tiền giải ngân thực tế} = \text{disbursed_amount} - \text{expected_amount}_1$$
* Nếu không tích chọn "Thu tiền trước":
  * Kỳ thứ 1 ban đầu ở trạng thái chưa đóng (`is_paid = false`).
  * Dòng tiền giải ngân thực tế là `disbursed_amount`.

### 5. Quy tắc đồng bộ tài chính khi Sửa / Xóa Hợp đồng Trả góp

#### A. Khi Sửa Hợp đồng Trả góp
* **Ràng buộc sửa thông số cốt lõi:**
  * Nếu hợp đồng **đã phát sinh giao dịch đóng tiền thực tế** (bất kỳ kỳ nào có `is_paid = true`, ngoại trừ kỳ 1 đã đóng tự động do tích chọn "Thu tiền trước" tại thời điểm giải ngân ban đầu) hoặc có giao dịch phụ (tất toán sớm, nợ lại): Hệ thống **chặn hoàn toàn** việc sửa đổi các thông số cốt lõi (Số tiền vay, Tiền đưa khách, ngày vay, hình thức, thời gian vay, số ngày đóng tiền). Nhân viên phải thực hiện xóa tất cả các giao dịch này trước khi chỉnh sửa.
  * Nếu hợp đồng chưa phát sinh giao dịch đóng tiền thực tế nào khác: Hệ thống cho phép cập nhật, tự động xóa lịch đóng tiền cũ và sinh lại lịch đóng tiền mới từ đầu.
* **Đồng bộ Quỹ tiền mặt chi nhánh khi sửa đổi:**
  * Hệ thống tính chênh lệch giải ngân ròng thực tế:
    $$\Delta = \text{Dòng tiền giải ngân thực tế mới} - \text{Dòng tiền giải ngân thực tế cũ}$$
  * Nếu $\Delta > 0$: Khấu trừ trực tiếp $\Delta$ ra khỏi Quỹ tiền mặt hiện tại (`current_cash` trong `daily_cash`), ghi nhận 1 bản ghi giảm quỹ vào `cash_fund_history` với kiểu `contract_edit`.
  * Nếu $\Delta < 0$: Cộng ngược lại $|\Delta|$ vào Quỹ tiền mặt hiện tại, ghi nhận 1 bản ghi tăng quỹ vào `cash_fund_history` với kiểu `contract_edit`.
* **Đồng bộ Sổ cái phụ:** Cập nhật số tiền giải ngân ban đầu trong bảng `installment_transaction_ledger` theo giá trị giải ngân thực tế mới.

#### B. Khi Xóa Hợp đồng Trả góp
* **Quy tắc hoàn trả dòng tiền quỹ két:**
  * Để bảo toàn quỹ tiền mặt chi nhánh không bị sai lệch, hệ thống tính toán dòng tiền ròng thực tế đã phát sinh của hợp đồng trả góp cần xóa:
    $$\text{Dòng tiền ròng đã phát sinh} = \text{Tổng số tiền thực tế đã thu vào} - \text{Tổng số tiền thực tế đã chi ra}$$
    * *Các khoản thu vào:* Tiền đóng kỳ định kỳ, tiền khách trả nợ đóng thiếu, tiền tất toán đóng HĐ.
    * *Các khoản chi ra:* Tiền giải ngân ban đầu thực tế (Tiền đưa khách trừ kỳ đóng trước nếu có).
  * Hệ thống thực hiện giao dịch đảo ngược quỹ:
    * Nếu `Dòng tiền ròng` > 0 (Cửa hàng đang thu ròng): Khấu trừ số tiền này khỏi Quỹ tiền mặt hiện tại.
    * Nếu `Dòng tiền ròng` < 0 (Cửa hàng đang chi ròng): Cộng hoàn trả số tiền mặt này vào Quỹ tiền mặt hiện tại.
    * Ghi log điều chỉnh quỹ vào `cash_fund_history`: "Khấu trừ/Hoàn trả quỹ do xóa hợp đồng trả góp [Mã hợp đồng]".
* **Xóa dữ liệu liên đới (Cascade Delete):**
  * Tự động xóa sạch toàn bộ các bản ghi liên quan của hợp đồng trả góp trong các bảng phụ: `installment_payments`, `installment_redemptions`, `installment_debt_history`, `installment_contract_documents`, `installment_debt_reminders`, `installment_transaction_ledger`, `installment_contract_reminders`.
  * Cuối cùng, xóa bản ghi hợp đồng trong bảng chính `installment_contracts`.

### 6. Thiết kế Database các bảng phụ cho Hợp đồng Trả góp

#### Bảng A: Bảng `installment_payments` (Kỳ đóng tiền trả góp)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính của kỳ đóng tiền. |
| `contract_id` | `uuid` | NOT NULL, FOREIGN KEY references `installment_contracts(id)` ON DELETE CASCADE | Liên kết đến hợp đồng trả góp. |
| `cycle_number` | `integer` | NOT NULL | Số thứ tự của kỳ đóng tiền (1, 2, 3...). |
| `from_date` | `date` | NOT NULL | Ngày bắt đầu tính kỳ. |
| `to_date` | `date` | NOT NULL | Ngày kết thúc kỳ (ngày phải đóng tiền). |
| `expected_days` | `integer` | NOT NULL | Số ngày tính kỳ. |
| `expected_amount` | `numeric(15, 2)` | NOT NULL, Default: `0` | Số tiền dự kiến phải đóng trong kỳ (đã gồm gốc và lãi phân bổ). |
| `other_amount` | `numeric(15, 2)` | NOT NULL, Default: `0` | Tiền phí phạt/phát sinh thêm ngoài kỳ tiền. |
| `actual_paid` | `numeric(15, 2)` | NOT NULL, Default: `0` | Số tiền thực thu quỹ của kỳ đóng tiền này. |
| `paid_date` | `date` | NULL | Ngày khách đóng tiền thực tế. |
| `is_paid` | `boolean` | NOT NULL, Default: `false` | Đã thanh toán xong kỳ đóng này hay chưa. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo kỳ. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### Bảng B: Bảng `installment_redemptions` (Lịch sử tất toán sớm trả góp)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `contract_id` | `uuid` | NOT NULL, UNIQUE, FOREIGN KEY references `installment_contracts(id)` ON DELETE CASCADE | Liên kết duy nhất đến hợp đồng trả góp. |
| `redeem_date` | `date` | NOT NULL | Ngày thực hiện tất toán đóng HĐ. |
| `outstanding_amount` | `numeric(15, 2)` | NOT NULL | Số tiền còn lại của các kỳ chưa thanh toán định kỳ. |
| `outstanding_debt` | `numeric(15, 2)` | NOT NULL | Số dư nợ cũ còn thiếu của các kỳ trước chưa trả. |
| `other_amount` | `numeric(15, 2)` | NOT NULL | Chi phí phát sinh bổ sung hoặc giảm trừ khi tất toán sớm. |
| `total_amount` | `numeric(15, 2)` | NOT NULL | Tổng tiền thực tế nhận được để tất toán. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### Bảng C: Bảng `installment_debt_history` (Lịch sử nợ hợp đồng trả góp)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `contract_id` | `uuid` | NOT NULL, FOREIGN KEY references `installment_contracts(id)` ON DELETE CASCADE | Liên kết đến hợp đồng trả góp. |
| `transaction_date` | `date` | NOT NULL | Ngày giao dịch nợ. |
| `type` | `varchar(20)` | NOT NULL, CHECK (`type` IN ('record_debt', 'pay_debt')) | Phân loại: `record_debt` (ghi nợ), `pay_debt` (trả nợ). |
| `amount` | `numeric(15, 2)` | NOT NULL | Số tiền (luôn dương). |
| `notes` | `text` | NULL | Ghi chú. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### Bảng D: Bảng `installment_contract_documents` (Lưu trữ URL ảnh chứng từ hợp đồng trả góp)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính chứng từ. |
| `contract_id` | `uuid` | NOT NULL, FOREIGN KEY references `installment_contracts(id)` ON DELETE CASCADE | Liên kết đến hợp đồng. |
| `document_type` | `varchar(30)` | NOT NULL, CHECK (`document_type` IN ('customer_photo', 'contract_document')) | Phân loại ảnh. |
| `image_url` | `text` | NOT NULL | URL ảnh lưu trên Google Drive do Apps Script API trả về. |
| `google_drive_file_id` | `varchar(100)` | NULL | File ID trên Google Drive. |
| `file_name` | `varchar(255)` | NULL | Tên tệp gốc. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### Bảng E: Bảng `installment_debt_reminders` (Nhật ký nhắc nợ trả góp)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `contract_id` | `uuid` | NOT NULL, FOREIGN KEY references `installment_contracts(id)` ON DELETE CASCADE | Liên kết đến hợp đồng. |
| `employee_id` | `uuid` | NOT NULL, FOREIGN KEY references `employees(id)` | Nhân viên thực hiện. |
| `content` | `text` | NOT NULL | Nội dung đôn đốc nhắc nhở. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian lưu. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### Bảng F: Bảng `installment_transaction_ledger` (Sổ cái giao dịch tài chính hợp đồng trả góp)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính sổ cái. |
| `contract_id` | `uuid` | NOT NULL, FOREIGN KEY references `installment_contracts(id)` ON DELETE CASCADE | Liên kết đến hợp đồng trả góp. |
| `employee_id` | `uuid` | NOT NULL, FOREIGN KEY references `employees(id)` | Giao dịch viên thực hiện. |
| `debit_amount` | `numeric(15, 2)` | NOT NULL, Default: `0` | Số tiền ghi nợ (Giải ngân thực tế đầu hợp đồng, tiền thối lại...). |
| `credit_amount` | `numeric(15, 2)` | NOT NULL, Default: `0` | Số tiền ghi có (Tiền khách đóng định kỳ, tất toán đóng HĐ, trả nợ...). |
| `other_amount` | `numeric(15, 2)` | NOT NULL, Default: `0` | Phí phạt hoặc các tiền phát sinh ngoài. |
| `action_type` | `varchar(50)` | NOT NULL | Loại giao dịch (ví dụ: `create_contract`, `pay_installment`, `cancel_installment`...). |
| `content` | `text` | NOT NULL | Mô tả giao dịch. |
| `notes` | `text` | NULL | Ghi chú. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian phát sinh. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật. |

#### Bảng G: Bảng `installment_contract_reminders` (Nhật ký hẹn giờ hợp đồng trả góp)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `contract_id` | `uuid` | NOT NULL, FOREIGN KEY references `installment_contracts(id)` ON DELETE CASCADE | Liên kết đến hợp đồng. |
| `reminder_date` | `date` | NOT NULL | Ngày hẹn giờ. |
| `status` | `varchar(20)` | NOT NULL, Default: `'active'`, CHECK (`status` IN ('active', 'stopped', 'completed')) | Trạng thái hẹn giờ. |
| `content` | `text` | NULL | Nội dung hẹn giờ. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo lịch hẹn. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

### 7. Phân hệ Vòng đời Hợp đồng Trả góp (Installment Contract Lifecycle Sub-features)

Hợp đồng trả góp bao gồm 7 phân hệ nghiệp vụ chính tích hợp trên giao diện SPA chi nhánh:

#### 7.1. Đóng tiền (Pay Installment)
* Cho phép thu tiền định kỳ của từng kỳ đóng tiền.
* **Nghiệp vụ Đóng tiền:** 
  * Nhân viên chọn kỳ đóng tiền trong danh sách và nhấn nút "Đóng tiền".
  * Cập nhật kỳ đó: `is_paid = true`, `actual_paid` = Số tiền khách trả, `paid_date` = Ngày hiện tại.
  * **Tác động dòng tiền quỹ:** Cộng trực tiếp số tiền khách thực tế trả (`actual_paid`) vào Quỹ tiền mặt hiện tại của chi nhánh (`current_cash` trong bảng `daily_cash`), ghi nhận 1 bản ghi vào `cash_fund_history` và ghi log vào sổ cái `installment_transaction_ledger` với `credit_amount` = `actual_paid`.
* **Nghiệp vụ Hủy đóng tiền:** 
  * Đảo ngược kỳ đóng tiền: `is_paid = false`, `actual_paid = 0`, `paid_date = null`.
  * Khấu trừ trực tiếp số tiền đã đóng ra khỏi Quỹ tiền mặt hiện tại, xóa log tương ứng trong `cash_fund_history` và sổ cái `installment_transaction_ledger`.

#### 7.2. Đóng HĐ / Tất toán trước hạn (Close Contract)
* Nghiệp vụ tất toán sớm khi khách hàng muốn đóng toàn bộ hợp đồng trước hạn.
* **Form Tính toán:**
  * **Dư nợ gốc còn lại (Outstanding Amount):** Tổng số tiền của toàn bộ các kỳ đóng tiền định kỳ chưa thanh toán (`is_paid = false`).
  * **Nợ cũ (Outstanding Debt):** Tổng số tiền nợ lại tích lũy do các kỳ đóng tiền trước đây đóng thiếu (`debt_amount`).
  * **Tiền khác (Other Amount):** Tiền phạt tất toán sớm hoặc tiền giảm trừ do người dùng nhập thủ công.
  * **Tổng tiền đóng HĐ (Total Amount):** Tự động tính toán:
    $$\text{Tổng tiền đóng HĐ} = \text{Dư nợ gốc còn lại} + \text{Nợ cũ} + \text{Tiền khác}$$
* **Xác nhận Đóng HĐ:**
  * Cập nhật trạng thái hợp đồng thành `closed` (Đã đóng).
  * Đánh dấu tất cả các kỳ đóng tiền chưa đóng (`is_paid = false`) thành đã đóng (`is_paid = true`), cập nhật `actual_paid` tương ứng và gán `paid_date` = Ngày hiện tại.
  * Cộng tổng số tiền thu được vào Quỹ tiền mặt chi nhánh, ghi nhận 1 bản ghi tăng quỹ vào `cash_fund_history` (kiểu `close_contract`) và ghi nhận giao dịch vào bảng `installment_redemptions`.
* **Hủy giao dịch Đóng HĐ:**
  * Khôi phục trạng thái hợp đồng thành `active` (hoặc `overdue`).
  * Khấu trừ số tiền tất toán ra khỏi Quỹ tiền mặt hiện tại, xóa bản ghi trong `cash_fund_history` và `installment_redemptions`.
  * Khôi phục các kỳ đóng tiền bị đóng tự động về trạng thái chưa thanh toán (`is_paid = false`, `actual_paid = 0`, `paid_date = null`).

#### 7.3. Nợ (Debt Management)
* Quản lý dư nợ phát sinh khi khách hàng đóng thiếu tiền một kỳ hạn đóng tiền hoặc nợ phát sinh khác.
* **Ghi nợ:** Khi khách nợ lại một khoản tiền thiếu, cộng dồn vào `debt_amount` trong hợp đồng, ghi nhận 1 giao dịch `record_debt` vào bảng `installment_debt_history`. Giao dịch này không làm phát sinh dòng tiền quỹ két.
* **Trả nợ:** Khách trả nợ, trừ bớt khỏi `debt_amount`, ghi nhận giao dịch `pay_debt` vào `installment_debt_history`. Cộng trực tiếp tiền trả nợ vào Quỹ tiền mặt hiện tại, ghi log vào `cash_fund_history` với kiểu điều chỉnh `debt_payment`.
* **Hủy giao dịch nợ:** Đảo ngược số tiền nợ/trả nợ tương ứng trên `debt_amount` của hợp đồng và trừ/cộng ngược lại quỹ tiền mặt nếu là giao dịch trả nợ. Xóa bản ghi trong `installment_debt_history` và nhật ký quỹ liên quan.

#### 7.4. Chứng từ (Document Management)
* Tải lên ảnh khách hàng (`customer_photo`) hoặc ảnh chứng từ hợp đồng (`contract_document`).
* Tích hợp lưu trữ hình ảnh trên Google Drive thông qua API của Google Apps Script Web App. Lưu trữ liên kết URL và File ID vào bảng `installment_contract_documents`.
* Xóa chứng từ: Xóa bản ghi trong database chính và gọi API sang Apps Script chuyển tệp tin trên Drive vào Thùng rác.

#### 7.5. Lịch sử & Sổ cái (Audit Logs & Ledger)
* Bảng đối chiếu tài chính tự động (Ledger) ghi nhận lại mọi biến động tài chính nợ/có phát sinh trong suốt vòng đời hợp đồng trả góp thông qua bảng `installment_transaction_ledger`.
* **Số tiền ghi nợ (Debit Amount):** Các khoản tiền đi ra khỏi két (Giải ngân hợp đồng gốc).
* **Số tiền ghi có (Credit Amount):** Các khoản tiền thu vào két (Đóng tiền định kỳ, tất toán đóng HĐ, trả nợ).
* **Tiền khác (Other Amount):** Tiền phí phạt hoặc phát sinh ngoài.
* **Chân trang bảng:** Tính toán tổng cộng cột, chênh lệch dòng tiền ròng ($\text{Tổng Có} - \text{Tổng Nợ}$).

#### 7.6. Hẹn giờ (Timer Reminders)
* Đặt lịch hẹn nhắc nợ định kỳ hoặc làm việc với khách trong tương lai. Ghi nhận lịch hẹn vào bảng `installment_contract_reminders` với trạng thái `active`. Có nút dừng hẹn giờ chuyển trạng thái sang `stopped`.

#### 7.7. Báo xấu (Blacklist / Bad Debt Reporting)
* Khi khách hàng vi phạm nghiêm trọng nghĩa vụ trả góp, nhân viên thực hiện báo xấu khách hàng.
* Cập nhật cột `status` trong bảng `customers` thành `'blacklist'`.
* Ghi nhật ký vào bảng `customer_blacklist` bao gồm lý do báo xấu chi tiết và nhân viên báo. Cảnh báo hiển thị nổi bật trên toàn hệ thống khi chọn khách hàng này trong tương lai.

---

## MODULE 12: QUẢN LÝ THU CHI - PHIẾU THU & PHIẾU CHI (INCOME/EXPENDITURE - RECEIPT & PAYMENT VOUCHERS)

### 1. Ý nghĩa & Vai trò
* Phục vụ hoạt động quản lý các khoản thu nhập và chi phí vận hành phát sinh thực tế tại các chi nhánh nằm ngoài nghiệp vụ cho vay (như chi lương, chi tiền nhà, thu thanh lý tài sản cũ, thu tiền đền bù...).
* **Danh mục loại phiếu thu/chi (Categories):** Định nghĩa mã và tên loại phiếu đơn giản để làm danh sách lựa chọn (dropdown) tương ứng khi tạo phiếu thu hoặc phiếu chi tiền.
* **Quy tắc dòng tiền:** 
  * **Phiếu chi (Payment Voucher):** Khi lập, tự động trừ quỹ két chi nhánh. Khi sửa/xóa/hủy, hoàn trả cộng lại quỹ két.
  * **Phiếu thu (Receipt Voucher):** Khi lập, tự động cộng quỹ két chi nhánh. Khi sửa/xóa/hủy, hoàn trả trừ lại quỹ két.

### 2. Các trường thông tin chi tiết

#### 2.1. Danh mục loại phiếu thu / chi (Voucher Categories)
* **Mã loại phiếu (Category Code):** Mã định danh duy nhất (ví dụ: `chi_luong`, `thu_thanh_ly`).
* **Tên loại phiếu (Category Name):** Tên hiển thị khi chọn (ví dụ: Chi lương nhân viên, Thu thanh lý xe).

#### 2.2. Lập Phiếu thu / Phiếu chi (Receipt / Payment Voucher Form)
* **Mã phiếu (Voucher Code):** Hệ thống tự sinh định dạng `PTxxxx` cho phiếu thu và `PCxxxx` cho phiếu chi. Tự động tăng và không trùng lặp.
* **Người nhận (Recipient Name):** Bắt buộc nhập (Họ tên người giao dịch nộp tiền hoặc nhận tiền. Lưu ý: Cả form thu và chi đều hiển thị nhãn là "Người nhận *").
* **Số tiền (Amount):** Bắt buộc nhập (VNĐ, giá trị > 0).
* **Loại phiếu (Category):** Chọn từ danh sách Danh mục loại phiếu thu (cho phiếu thu) hoặc Loại phiếu chi (cho phiếu chi).
* **Lý do (Reason / Notes):** Bắt buộc nhập lý do thu hoặc chi chi tiết (ô nhập lý do thu / chi).
* **Ngày lập (Voucher Date):** Tự động gán là ngày hiện tại.
* **Nhân viên lập (Employee ID):** Hệ thống tự động ghi nhận tài khoản nhân viên đang thao tác.

### 3. Thiết kế Database

#### A. Bảng `expense_categories` (Danh mục loại phiếu chi)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `code` | `varchar(50)` | NOT NULL, UNIQUE | Mã loại phiếu chi (ví dụ: `chi_luong`, `chi_khac`). |
| `name` | `varchar(100)` | NOT NULL | Tên hiển thị loại phiếu chi. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### B. Bảng `income_categories` (Danh mục loại phiếu thu)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `code` | `varchar(50)` | NOT NULL, UNIQUE | Mã loại phiếu thu (ví dụ: `thu_thanh_ly`, `thu_khac`). |
| `name` | `varchar(100)` | NOT NULL | Tên hiển thị loại phiếu thu. |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### C. Bảng `payment_vouchers` (Quản lý Phiếu chi)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `store_id` | `uuid` | NOT NULL, FOREIGN KEY references `stores(id)` | Chi nhánh thực hiện chi tiền. |
| `voucher_code` | `varchar(50)` | NOT NULL, UNIQUE | Mã phiếu chi tự sinh (ví dụ: `PC0001`). |
| `category_id` | `uuid` | NOT NULL, FOREIGN KEY references `expense_categories(id)` | Liên kết tới loại phiếu chi được chọn. |
| `amount` | `numeric(15, 2)` | NOT NULL, CHECK (`amount` > 0) | Số tiền chi thực tế (VNĐ). |
| `recipient_name` | `varchar(150)` | NOT NULL | Họ tên người nhận tiền. |
| `notes` | `text` | NOT NULL | Lý do chi (ghi nhận thông tin chi tiết). |
| `voucher_date` | `date` | NOT NULL | Ngày chi tiền. |
| `employee_id` | `uuid` | NOT NULL, FOREIGN KEY references `employees(id)` | Nhân viên lập phiếu chi. |
| `status` | `varchar(20)` | NOT NULL, Default: `'active'` | Trạng thái phiếu chi (`active` - hoạt động, `cancelled` - đã hủy). |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo bản ghi. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

#### D. Bảng `receipt_vouchers` (Quản lý Phiếu thu)
| Tên cột (Column Name) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, Default: `gen_random_uuid()` | Khóa chính. |
| `store_id` | `uuid` | NOT NULL, FOREIGN KEY references `stores(id)` | Chi nhánh thực hiện thu tiền. |
| `voucher_code` | `varchar(50)` | NOT NULL, UNIQUE | Mã phiếu thu tự sinh (ví dụ: `PT0001`). |
| `category_id` | `uuid` | NOT NULL, FOREIGN KEY references `income_categories(id)` | Liên kết tới loại phiếu thu được chọn. |
| `amount` | `numeric(15, 2)` | NOT NULL, CHECK (`amount` > 0) | Số tiền thu thực tế (VNĐ). |
| `recipient_name` | `varchar(150)` | NOT NULL | Họ tên người nộp tiền (trên UI hiển thị nhãn là "Người nhận"). |
| `notes` | `text` | NOT NULL | Lý do thu (ghi nhận thông tin chi tiết). |
| `voucher_date` | `date` | NOT NULL | Ngày thu tiền. |
| `employee_id` | `uuid` | NOT NULL, FOREIGN KEY references `employees(id)` | Nhân viên lập phiếu thu. |
| `status` | `varchar(20)` | NOT NULL, Default: `'active'` | Trạng thái phiếu thu (`active` - hoạt động, `cancelled` - đã hủy). |
| `created_at` | `timestamptz` | Default: `now()` | Thời gian tạo bản ghi. |
| `updated_at` | `timestamptz` | Default: `now()` | Thời gian cập nhật gần nhất. |

### 4. Quy tắc dòng tiền két và Đồng bộ tài chính khi Tạo/Sửa/Xóa Phiếu thu/chi

#### A. Khi tạo mới Phiếu
* **Đối với Phiếu chi:**
  * **Tác động dòng tiền:** Khấu trừ trực tiếp số tiền chi (`amount`) khỏi Quỹ tiền mặt hiện tại của chi nhánh (`current_cash` giảm).
  * **Ghi nhật ký quỹ:** Thêm bản ghi âm (`-amount`) vào `cash_fund_history` với kiểu `payment_voucher`.
* **Đối với Phiếu thu:**
  * **Tác động dòng tiền:** Cộng trực tiếp số tiền thu (`amount`) vào Quỹ tiền mặt hiện tại của chi nhánh (`current_cash` tăng).
  * **Ghi nhật ký quỹ:** Thêm bản ghi dương (`+amount`) vào `cash_fund_history` với kiểu `receipt_voucher`.

#### B. Khi Sửa đổi số tiền Phiếu
* Tính toán chênh lệch số tiền: $\Delta = \text{Số tiền mới} - \text{Số tiền cũ}$.
* **Đối với Phiếu chi:**
  * Nếu $\Delta > 0$ (chi thêm): Trừ quỹ két $\Delta$ (`current_cash` giảm), ghi log giảm quỹ.
  * Nếu $\Delta < 0$ (chi bớt): Cộng trả quỹ két $|\Delta|$ (`current_cash` tăng), ghi log tăng quỹ.
* **Đối với Phiếu thu:**
  * Nếu $\Delta > 0$ (thu thêm): Cộng thêm vào quỹ két $\Delta$ (`current_cash` tăng), ghi log tăng quỹ.
  * Nếu $\Delta < 0$ (thu bớt): Trừ bớt khỏi quỹ két $|\Delta|$ (`current_cash` giảm), ghi log giảm quỹ.
* Log điều chỉnh quỹ ghi nhận vào `cash_fund_history` với kiểu `voucher_edit`.

#### C. Khi Hủy hoặc Xóa Phiếu
* **Hủy phiếu (Cancel Voucher):** Chuyển trạng thái sang `cancelled`.
  * **Phiếu chi:** Cộng trả lại số tiền chi (`amount`) vào Quỹ tiền mặt (`current_cash` tăng), ghi log tăng quỹ.
  * **Phiếu thu:** Khấu trừ ngược lại số tiền thu (`amount`) khỏi Quỹ tiền mặt (`current_cash` giảm), ghi log giảm quỹ.
* **Xóa phiếu (Delete Voucher):** (Chỉ Admin mới có quyền).
  * Nếu phiếu đang hoạt động (`active`) chưa bị hủy trước đó: Thực hiện điều chỉnh quỹ két chi nhánh (cộng trả quỹ đối với phiếu chi, khấu trừ quỹ đối với phiếu thu).
  * Xóa bản ghi trong `payment_vouchers` hoặc `receipt_vouchers`.

### 5. Phân hệ các chức năng nghiệp vụ quản lý Thu Chi

#### 5.1. Quản lý danh mục loại phiếu thu/chi (Categories)
* Hiển thị danh sách Mã và Tên của các Loại phiếu thu/ Loại phiếu chi trong dropdown.
* Hỗ trợ thêm nhanh loại phiếu mới bằng cách nhập Mã và Tên.

#### 5.2. Lập Phiếu thu / Phiếu chi mới (Create Receipt / Payment Voucher)
* Giao diện form hiển thị tối giản (khớp UI thiết kế):
  * Ô nhập **Người nhận** (tên người giao dịch)
  * Ô nhập **Số tiền**
  * Ô chọn **Loại phiếu** (dropdown chọn từ Danh mục loại phiếu thu hoặc chi tương ứng)
  * Ô nhập **Lý do** (textarea lý do thu / chi)
* Khi bấm nút xác nhận, tự động sinh mã tương ứng (`PTxxxx` hoặc `PCxxxx`), thực hiện cập nhật quỹ két chi nhánh và ghi nhận nhật ký quỹ két.

#### 5.3. Danh sách tìm kiếm & Lọc phiếu Thu Chi
* Hỗ trợ lọc danh sách phiếu thu/chi theo chi nhánh, khoảng ngày lập, loại danh mục thu/chi, nhân viên lập và trạng thái.
* Tổng kết chân trang: Tính tổng số tiền thu ròng trong kỳ chọn lọc ($\text{Tổng Thu} - \text{Tổng Chi}$).

#### 5.4. Hủy phiếu (Cancel Voucher)
* Khi bấm hủy phiếu chi hoặc phiếu thu đang hoạt động, yêu cầu nhập lý do hủy, chuyển status sang `cancelled` và tự động thực thi đảo dòng tiền quỹ két để cân đối sổ sách két thực tế.

