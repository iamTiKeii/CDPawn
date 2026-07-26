# Danh sách Mẫu in Hợp đồng (Template Catalog) - HungTin

Tài liệu này liệt kê tất cả các mã mẫu in được tích hợp sẵn trong hệ thống và nguyên tắc đặt tên chuẩn.

## Nguyên tắc Đặt tên Mã Mẫu in (Naming Convention)

Mã mẫu in bao gồm 3 phần phân tách bằng dấu gạch dưới: `[MODULE]_[LOẠI]_[PHIÊN_BẢN]`

* **`[MODULE]`**: Phân hệ của hợp đồng:
  * `CD`: Cầm đồ (Pawn Contract)
  * `TC`: Tín chấp (Unsecured/Credit Contract)
  * `TG`: Trả góp (Installment Contract)
* **`[LOẠI]`**: Thể loại/Biến thể mẫu in:
  * `01`: Mẫu chuẩn / Lãi suất tính phí theo ngày.
  * `02`: Mẫu thỏa thuận (không hiển thị lãi suất cụ thể trên hợp đồng).
* **`[PHIÊN_BẢN]`**: Đánh số phiên bản gồm 3 chữ số bắt đầu từ `001`.

---

## Danh sách mẫu in hiện tại

| Mã Mẫu in | Tên hiển thị | Tệp HTML vật lý | Phân hệ sử dụng | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **`CD_01_001`** | Hợp đồng cầm cố tài sản tiêu chuẩn | `CD_01_001.html` | Cầm đồ (`pawn`) | Hiển thị thông tin tài sản cầm cố, số tiền, ngày bắt đầu/kết thúc, lãi suất % và cam kết cầm đồ. |
| **`TC_01_001`** | Hợp đồng cho vay tín chấp tiêu dùng | `TC_01_001.html` | Tín chấp (`unsecured`) | Không có tài sản đảm bảo, cam kết bảo mật nhân thân và các điều khoản thu hồi nợ tín chấp. |
| **`TG_01_001`** | Hợp đồng cho vay trả góp theo kỳ | `TG_01_001.html` | Trả góp (`installment`) | Hiển thị số kỳ đóng góp, số tiền góp mỗi kỳ và bảng lịch trình thu tiền góp chi tiết. |

---

*Để xem các từ khóa biến dữ liệu dùng để thiết kế HTML, vui lòng xem [DataKeys.md](file:///Users/suns/Downloads/OutSource/HungTin/docs/print/DataKeys.md).*
