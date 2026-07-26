# QUY ƯỚC MÃ MẪU IN (PRINT TEMPLATE CODE RULE)

Tài liệu này định nghĩa quy ước đặt tên (mã hóa) thống nhất cho toàn bộ các mẫu in trong hệ thống HungTin, phục vụ công tác quản lý, cấu hình và phát triển mở rộng.

## 1. Cấu trúc Mã Mẫu In

Mỗi mẫu in được gán một mã duy nhất có định dạng:

`[MODULE]_[LOẠI_NGHIỆP_VỤ]_[MẪU_PHIÊN_BẢN]`

Ví dụ: `CD_01_001`

---

## 2. Chi tiết các thành phần

### 2.1. Phân loại Module (`[MODULE]`)
Viết tắt gồm 2 ký tự in hoa đại diện cho phân hệ nghiệp vụ chính:
- **`CD`**: Phân hệ Cầm đồ (Pawn)
- **`TC`**: Phân hệ Tín chấp (Unsecured Loan)
- **`TG`**: Phân hệ Trả góp (Installment Loan)
- **`GV`**: Phân hệ Góp vốn (Capital Investment)
- **`KH`**: Phân hệ Khách hàng (Customer Management)
- **`PT`**: Phiếu thu (Receipt Voucher)
- **`PC`**: Phiếu chi (Payment Voucher)
- **`HD`**: Hóa đơn / Chứng từ (Invoice / Ledger Voucher)
- **`BB`**: Biên bản (Minutes / Handover Reports)
- **`PN`**: Phiếu nhập kho (Goods Receipt)
- **`PX`**: Phiếu xuất kho (Goods Issue)

### 2.2. Phân loại Nghiệp vụ (`[LOẠI_NGHIỆP_VỤ]`)
Gồm 2 chữ số (từ `01` đến `99`) để phân loại chi tiết hình thức/nghiệp vụ cụ thể trong Module:
- Trong Module Cầm đồ (`CD`):
  - **`01`**: Tính lãi theo Lãi suất cố định/định kỳ (Interest Rate)
  - **`02`**: Tính lãi theo thỏa thuận dân sự tự nguyện (Negotiated Rate)
- Trong Module Tín chấp (`TC`):
  - **`01`**: Cho vay tín chấp tiêu dùng
- Trong Module Trả góp (`TG`):
  - **`01`**: Trả góp theo chu kỳ ngày
  - **`02`**: Trả góp theo chu kỳ tháng
- Trong Phiếu thu/chi (`PT` / `PC`):
  - **`01`**: Thu/Chi tiền mặt giao dịch hợp đồng
  - **`02`**: Thu/Chi tiền mặt hoạt động nội bộ

### 2.3. Mã số mẫu / Phiên bản (`[MẪU_PHIÊN_BẢN]`)
Gồm 3 chữ số (từ `001` đến `999`) dùng để phân biệt các mẫu thiết kế khác nhau hoặc phiên bản sửa đổi:
- **`001`**: Mẫu in tiêu chuẩn khổ giấy A4 dọc.
- **`002`**: Mẫu in khổ A5 ngang hoặc dùng cho máy in nhiệt K80.
- **`003`**: Các biến thể mẫu in tùy chỉnh riêng theo từng tỉnh thành/chi nhánh.

---

## 3. Quy tắc đặt tên tệp mẫu (Template File Naming)

Khi lưu trữ trong mã nguồn (`frontend/templates/`), tên tệp cần tuân thủ cấu trúc mã mẫu in kèm phần mở rộng tệp:
- Tệp định dạng HTML: `[MÃ_MẪU].html` (Ví dụ: `CD_01_001.html`)
- Tệp định dạng Markdown: `[MÃ_MẪU].md` (Ví dụ: `CD_01_001.md`)

*Lưu ý: Đối với các tệp hiện tại trong thư mục `frontend/templates` chưa tuân thủ quy tắc này (ví dụ: `hop-dong-cam-do-lai-suat.html`), tài liệu này đề xuất phương án chuẩn hóa đổi tên để đồng bộ cấu trúc hệ thống.*
