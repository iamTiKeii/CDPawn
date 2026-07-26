

# MỤC LỤC TÀI LIỆU QUẢN LÝ MẪU IN (PRINT TEMPLATES INDEX)

Hệ thống HungTin hỗ trợ in ấn hợp đồng, chứng từ thu chi trực tiếp từ phần mềm để phục vụ quản lý cửa hàng và khách hàng. Tài liệu này tổng hợp cấu trúc tài liệu hóa hệ thống mẫu in (Print Templates).

---

## 1. Danh sách tài liệu thành phần

- **[01. Quy ước mã hóa mẫu in (PRINT_CODE_RULE.md)](file:///Users/suns/Downloads/OutSource/HungTin/docs/print-template/PRINT_CODE_RULE.md)**: Định nghĩa cấu trúc mã `[MODULE]_[LOẠI]_[MẪU]` và quy tắc đặt tên tệp mẫu in tiêu chuẩn.
- **[02. Từ điển Data Keys (DATA_KEYS.md)](file:///Users/suns/Downloads/OutSource/HungTin/docs/print-template/DATA_KEYS.md)**: Định nghĩa kiểu dữ liệu, ý nghĩa của tất cả các biến (Data Keys) dùng trong mẫu in.
- **[03. Phân hệ Cầm đồ (PAWN.md)](file:///Users/suns/Downloads/OutSource/HungTin/docs/print-template/PAWN.md)**: Chi tiết mẫu in hợp đồng cầm đồ theo hình thức Lãi suất và Lãi thỏa thuận.
- **[04. Phân hệ Tín chấp (LOAN.md)](file:///Users/suns/Downloads/OutSource/HungTin/docs/print-template/LOAN.md)**: Chi tiết mẫu in hợp đồng cho vay tín chấp (kiêm tự nguyện dân sự).
- **[05. Phân hệ Trả góp (INSTALLMENT.md)](file:///Users/suns/Downloads/OutSource/HungTin/docs/print-template/INSTALLMENT.md)**: Định nghĩa lịch trình trả góp định kỳ và biên bản thu phí.
- **[06. Phân hệ Góp vốn (CAPITAL.md)](file:///Users/suns/Downloads/OutSource/HungTin/docs/print-template/CAPITAL.md)**: Đặc tả biên bản thỏa thuận hợp tác đầu tư/góp vốn.
- **[07. Phiếu thu tiền mặt (RECEIPT.md)](file:///Users/suns/Downloads/OutSource/HungTin/docs/print-template/RECEIPT.md)**: Đặc tả mẫu in chứng từ thu quỹ tiền mặt.
- **[08. Phiếu chi tiền mặt (PAYMENT.md)](file:///Users/suns/Downloads/OutSource/HungTin/docs/print-template/PAYMENT.md)**: Đặc tả mẫu in chứng từ xuất quỹ chi tiền.
- **[09. Sao kê khách hàng (CUSTOMER.md)](file:///Users/suns/Downloads/OutSource/HungTin/docs/print-template/CUSTOMER.md)**: Đặc tả biên bản đối soát sao kê lịch sử công nợ của khách hàng.

---

## 2. Bảng Tổng Hợp Hệ Thống Mẫu In Hiện Tại

| Mã mẫu                | Tên mẫu                                 | Module            | Loại                 | File Template                                     | Data Key chính                                                   | Trạng thái      |
| :---------------------- | :---------------------------------------- | :---------------- | :-------------------- | :------------------------------------------------ | :---------------------------------------------------------------- | :---------------- |
| **`CD_01_001`** | Hợp đồng cầm đồ (Mẫu lãi suất)   | Cầm đồ         | Lãi suất cố định | `hop-dong-cam-do-lai-suat.html`                 | `StoreName`, `CustomerName`, `LoanAmount`, `InterestRate` | Đang sử dụng   |
| **`CD_02_001`** | Hợp đồng cầm đồ (Mẫu thỏa thuận) | Cầm đồ         | Lãi thỏa thuận     | `hop-dong-cam-do-lai-thoa-thuan.html`           | `StoreName`, `CustomerName`, `LoanAmount`                   | Đang sử dụng   |
| **`TC_01_001`** | Hợp đồng tín chấp tiêu dùng        | Tín chấp        | Vay tín chấp        | *Không có (Đang hardcode trong code)*        | `StoreName`, `CustomerName`, `LoanAmount`                   | Đang sử dụng   |
| **`TG_01_001`** | Hợp đồng cho vay trả góp kỳ         | Trả góp         | Trả gốc+lãi đều  | *Chưa cấu hình (Dùng chung mẫu Cầm đồ)* | `RepaymentAmount`, `LoanDuration`                             | Chưa thiết lập |
| **`GV_01_001`** | Hợp đồng góp vốn đầu tư           | Góp vốn         | Góp vốn chi nhánh  | *Chưa cấu hình*                              | `InvestorName`, `CapitalAmount`                               | Chưa thiết lập |
| **`PT_01_001`** | Phiếu thu tiền mặt tiêu chuẩn        | Quản lý thu chi | Thu quỹ              | *Không có (Đang hardcode trong code)*        | `VoucherCode`, `RecipientName`, `Amount`                    | Đang sử dụng   |
| **`PC_01_001`** | Phiếu chi tiền mặt tiêu chuẩn        | Quản lý thu chi | Chi quỹ              | *Không có (Đang hardcode trong code)*        | `VoucherCode`, `RecipientName`, `Amount`                    | Đang sử dụng   |
| **`KH_01_001`** | Biên bản đối chiếu sao kê công nợ | Khách hàng      | Đối chiếu nợ      | *Chưa cấu hình*                              | `CustomerName`, `CurrentBalance`                              | Chưa thiết lập |

---

## 3. Kết Quả Phân Tích Hiện Trạng & Phát Hiện Vấn Đề

Qua quá trình rà soát toàn bộ mã nguồn của hệ thống, chúng tôi phát hiện một số điểm hạn chế sau:

1. **Mẫu in bị trùng lắp lớn**:
   - Mẫu cầm đồ lãi suất (`CD_01_001`) và lãi thỏa thuận (`CD_02_001`) giống nhau tới 95%, chỉ khác biệt duy nhất ở một từ ngữ hiển thị ở điều khoản số 1 về lãi suất. Việc duy trì hai tệp HTML riêng biệt tăng nguy cơ sai lệch khi cập nhật nội dung cam kết chung.
2. **Tệp mẫu không còn sử dụng**:
   - Hai tệp Markdown tương ứng (`hop-dong-cam-do-lai-suat.md` và `hop-dong-cam-do-lai-thoa-thuan.md`) được đặt trong thư mục `frontend/templates/` nhưng thực tế không có bất kỳ logic xử lý nào đọc hoặc biên dịch chúng để in ấn. Chúng là dư thừa trong codebase.
3. **Mẫu in bị thiết kế hardcoded (Trực tiếp trong code React)**:
   - Bản in Hợp đồng tín chấp (`TC_01_001`) cùng Phiếu thu (`PT_01_001`) và Phiếu chi (`PC_01_001`) đang được lập trình cứng (hardcoded) bên trong code giao diện (`Contracts.tsx` và `Vouchers.tsx`). Điều này khiến việc căn chỉnh lề in, thay đổi địa chỉ hay cập nhật nội dung cam kết pháp lý gặp khó khăn (bắt buộc phải thay đổi mã nguồn và deploy lại).
4. **Thiếu cấu hình & Mẫu in nghiệp vụ**:
   - Hợp đồng trả góp (`TG_01_001`) chưa được cấu hình độc lập mà đang hiển thị sai lệch bằng cách dùng chung giao diện mẫu in của phân hệ Cầm đồ (hiển thị thông tin rỗng về biển kiểm soát, số khung, số máy của tài sản).
   - Phân hệ Góp vốn (`GV_01_001`) và Đối soát công nợ khách hàng (`KH_01_001`) hoàn toàn chưa hỗ trợ in ấn chứng từ chính thống.
5. **Thiếu trường dữ liệu (Data Key)**:
   - Thiếu cấu hình hiển thị các trường thông tin tài khoản ngân hàng nhận tiền của chi nhánh (`system_bank_name`, `system_bank_account_number`, `system_bank_account_holder`) vừa được nâng cấp trên các mẫu hợp đồng, cản trở việc khách hàng quét mã/chuyển khoản tự động.

---

## 4. Đề Xuất Chuẩn Hóa Hệ Thống Print Template

Để hệ thống mẫu in hoạt động chuyên nghiệp, dễ bảo trì và mở rộng, chúng tôi đề xuất lộ trình chuẩn hóa sau:

1. **Chuẩn hóa đặt tên tệp mẫu**:
   - Đổi tên toàn bộ các tệp trong `frontend/templates/` tuân thủ quy ước mã hóa:
     - `hop-dong-cam-do-lai-suat.html` $\rightarrow$ `CD_01_001.html`
     - `hop-dong-cam-do-lai-thoa-thuan.html` $\rightarrow$ `CD_02_001.html`
2. **Gộp mẫu cầm đồ trùng lắp**:
   - Gộp `CD_01_001.html` và `CD_02_001.html` thành một tệp mẫu cầm đồ duy nhất. Thay thế từ ngữ lãi suất bằng một biến động `{{InterestRateText}}`. Nếu là lãi thỏa thuận, backend/frontend tự động truyền giá trị `"Thỏa thuận"`.
3. **Dọn dẹp mã nguồn**:
   - Xóa bỏ các tệp `.md` không sử dụng trong thư mục `templates/` để tinh gọn codebase.
4. **Chuyển đổi các mẫu hardcoded sang Template HTML độc lập**:
   - Tách phần giao diện in của Tín chấp (`TC_01_001`), Phiếu thu (`PT_01_001`), Phiếu chi (`PC_01_001`) ra các file HTML tương ứng trong `frontend/templates/`.
5. **Phát triển bổ sung và cấu hình đúng cho Trả góp**:
   - Tạo mẫu `TG_01_001.html` có hỗ trợ hiển thị bảng lịch trả gốc + lãi theo ngày/tháng để chấm dứt tình trạng hiển thị sai lệch thông tin tài sản cầm đồ trên hợp đồng trả góp.
