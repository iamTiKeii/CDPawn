# Hệ thống Dịch vụ In ấn (Print Service) - HungTin

Tài liệu này cung cấp hướng dẫn tổng quan về cấu trúc, thiết kế và cách vận hành hệ thống in ấn hợp đồng, chứng từ trong dự án HungTin.

## Cấu trúc Kiến trúc (Architecture)

Hệ thống được thiết kế theo mô hình 3 lớp phân tách rõ ràng để dễ bảo trì, mở rộng và tùy biến mẫu in:

```
+---------------------------------------+
|             React UI                  |
|    (Contracts.tsx, Detail Pages)      |
+---------------------------------------+
                    |
                    v (getCompiledHtml)
+---------------------------------------+
|             PrintService              |  <--- Điểm facade kết nối chính
+---------------------------------------+
        |                       |
        v (buildPrintData)      v (renderTemplate)
+---------------+       +-----------------------+
|  DataMapper   |       |  PrintTemplateManager |
+---------------+       +-----------------------+
        |                           |
        v (Map fields)              v (Regex & ?raw load)
+---------------+       +-----------------------+
| Prisma Models |       |   HTML Templates      |
+---------------+       +-----------------------+
```

## Các thành phần chính

1. **`DataMapper.ts`**:
   * Trách nhiệm: Chuẩn hóa dữ liệu từ các model Prisma thô (ví dụ: `loan_amount`, `customer`, `commodity`) sang các từ khóa phẳng chuẩn (ví dụ: `CustomerName`, `LoanAmount`, `AssetDetail`).
   * Xử lý định dạng tiền tệ (`formatCurrency`) và chuyển đổi tiền số sang chữ tiếng Việt (`convertNumberToVietnameseWords`).

2. **`PrintTemplateManager.ts`**:
   * Trách nhiệm: Đăng ký các tệp HTML bằng plugin `?raw` của Vite và thực hiện thay thế placeholders bằng Regex.
   * Quản lý các cấu hình mẫu in mặc định cho từng phân hệ (Cầm đồ, Tín chấp, Trả góp).

3. **`PrintService.ts`**:
   * Trách nhiệm: Lấy cấu hình mẫu in hiện tại từ `localStorage` hoặc cấu hình hệ thống, gọi Mapper lấy dữ liệu, biên dịch qua Template Manager và trả lại chuỗi HTML hoàn chỉnh sẵn sàng cho việc in ấn.

## Hướng dẫn Vận hành

### 1. Thêm mẫu in mới
1. Đặt tệp HTML vào thư mục `frontend/templates/` (ví dụ: `CD_02_001.html`).
2. Khai báo import tệp này trong `PrintTemplateManager.ts`:
   ```typescript
   import cdTemplateNew from "../../../templates/CD_02_001.html?raw";
   ```
3. Đăng ký mẫu in mới vào danh sách `templates`:
   ```typescript
   {
     code: "CD_02_001",
     name: "Hợp đồng cầm cố mẫu 2",
     module: "pawn",
     htmlContent: cdTemplateNew,
   }
   ```

### 2. Thay đổi mẫu mặc định của phân hệ
Trong `PrintTemplateManager.ts`, chỉnh sửa hàm `getDefaultTemplateCode(module)` để trả về mã code của mẫu mới (ví dụ: `"CD_02_001"` thay vì `"CD_01_001"`).

---

*Để tìm hiểu danh sách mẫu in hiện tại, vui lòng xem [TemplateList.md](file:///Users/suns/Downloads/OutSource/HungTin/docs/print/TemplateList.md).*
*Để xem danh sách các từ khóa dữ liệu hiển thị trong HTML, vui lòng xem [DataKeys.md](file:///Users/suns/Downloads/OutSource/HungTin/docs/print/DataKeys.md).*
*Để hiểu chi tiết luồng xử lý in ấn, vui lòng xem [PrintFlow.md](file:///Users/suns/Downloads/OutSource/HungTin/docs/print/PrintFlow.md).*
