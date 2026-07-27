# CDPawn — Hệ Thống Quản Lý Tài Chính, Cầm Đồ & Tín Dụng Tiêu Dùng

> Phần mềm quản lý toàn diện dành cho các cơ sở kinh doanh dịch vụ **cầm đồ**, **cho vay tín chấp**, **trả góp** và **nhận góp vốn đầu tư**.
> Được xây dựng trên nền tảng **React + TypeScript + Node.js + PostgreSQL**, triển khai qua **Vercel (Frontend)** và **Railway (Backend)**.

---

## 📌 Các Phân Hệ Chính

| Phân hệ                           | Mô tả                                                                                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 🏦**Cầm đồ (Pawn)**        | Hợp đồng thế chấp tài sản (xe máy, điện thoại, giấy tờ). Tính lãi theo ngày/tuần/tháng với gói`k/triệu` hoặc `k/ngày` |
| 💸**Tín chấp (Unsecured)**  | Cho vay không thế chấp, tính lãi linh hoạt theo ngày/tuần/tháng                                                                         |
| 📅**Trả góp (Installment)** | Cho vay thu tiền góp định kỳ (bát họ), tự động sinh lịch đóng tiền                                                                 |
| 💼**Nguồn vốn (Capital)**   | Nhận góp vốn đầu tư từ cổ đông, trả lãi định kỳ                                                                                   |
| 🗂️**Thu / Chi (Vouchers)**  | Phiếu thu/chi hoạt động vận hành ngoài hợp đồng vay                                                                                    |
| 💰**Quỹ két (Cash Fund)**   | Đếm tiền mặt theo mệnh giá, chốt quỹ cuối ngày, theo dõi chênh lệch thừa/thiếu                                                    |
| 📊**Báo cáo (Reports)**     | Dòng tiền, lãi chi tiết, tổng hợp lợi nhuận, bàn giao ca, tổng hợp chi nhánh                                                         |
| ⚠️**Cảnh báo (Warnings)** | Theo dõi hợp đồng quá hạn, sắp đến hạn                                                                                                 |
| 🖨️**In hợp đồng**        | In trực tiếp từ template HTML với đầy đủ thông tin hợp đồng và lịch đóng tiền                                                   |

---

## ⚙️ Yêu Cầu Hệ Thống

| Công cụ            | Phiên bản tối thiểu |
| -------------------- | ----------------------- |
| **Node.js**    | 18.x trở lên          |
| **npm**        | 9.x trở lên           |
| **PostgreSQL** | 14.x trở lên          |
| **Git**        | Bất kỳ                |

---

## 🚀 Cài Đặt & Chạy Local

### 1. Clone dự án

```bash
git clone https://github.com/iamTiKeii/Pawna.git
cd Pawna
```

### 2. Cài đặt Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Cấu hình Biến Môi Trường

#### Backend — tạo file `backend/.env`:

```env
PORT=5001
DATABASE_URL="postgresql://username:password@localhost:5432/cdpawn_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-at-least-32-chars"
```

#### Frontend — file `frontend/.env.development` (đã có sẵn):

```env
# Kết nối local backend
# VITE_API_URL=http://localhost:5001

# Kết nối Railway production backend
VITE_API_URL=https://pawna-prod.up.railway.app
```

### 4. Chạy Development Server

Mở **2 terminal riêng biệt**:

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# → http://localhost:5001

# Terminal 2 — Frontend
cd frontend
npm run dev
# → http://localhost:5173
```

---

## 💾 Quản Lý Cơ Sở Dữ Liệu

> Tất cả lệnh DB đều chạy từ thư mục **`backend/`**

### 🆕 Triển Khai Lần Đầu (Fresh Deploy)

Xoá sạch toàn bộ cấu trúc cũ, tạo lại từ đầu, seed dữ liệu danh mục và tạo tài khoản admin:

```bash
cd backend
npm run db:fresh-deploy
```

🔑 **Thông tin đăng nhập mặc định:**

|                    |              |
| ------------------ | ------------ |
| **Username** | `admin`    |
| **Password** | `admin123` |

> ⚠️ Đổi mật khẩu ngay sau lần đăng nhập đầu tiên!

---

### 🔄 Bàn Giao Khách Hàng Mới (Factory Reset)

Xoá sạch **dữ liệu giao dịch** (hợp đồng, khách hàng, chứng từ...) nhưng **giữ nguyên** cấu hình hệ thống (cửa hàng, nhân viên, quyền hạn, danh mục lãi suất):

```bash
cd backend
npm run db:clean
```

---

## 🌐 Triển Khai Production

Dự án được thiết kế để deploy tách biệt:

| Thành phần       | Nền tảng | Ghi chú                                |
| ------------------ | ---------- | --------------------------------------- |
| **Frontend** | Vercel     | Tự động deploy khi push lên`main` |
| **Backend**  | Railway    | Node.js + PostgreSQL managed            |

### Frontend — Vercel

File `frontend/vercel.json` đã cấu hình sẵn proxy `/api/*` → Railway:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://pawna-prod.up.railway.app/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Để thay đổi backend URL, cập nhật biến môi trường `VITE_API_URL` trong **Vercel Dashboard → Settings → Environment Variables**.

### Backend — Railway / VPS tự quản

```bash
# Build backend
cd backend && npm run build

# Chạy với PM2
npm install -g pm2
pm2 start dist/server.js --name "cdpawn-backend"
pm2 save && pm2 startup
```

#### Cấu hình Nginx (VPS):

```nginx
server {
    listen 80;
    server_name app.cdpawn.vn;

    # Frontend static files
    location / {
        root /var/www/cdpawn/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API → Backend
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 🏗️ Kiến Trúc Dự Án

```
Pawna/
├── backend/                  # Node.js + Express + Prisma
│   └── src/
│       ├── routes/           # API routes (pawn, unsecured, installment, capital, reports...)
│       ├── services/         # Business logic (interest calculation...)
│       ├── middleware/       # Auth, error handler, RBAC
│       └── utils/            # Helpers
│
└── frontend/                 # React + TypeScript + Vite
    ├── src/
    │   ├── pages/            # Trang chính (Contracts, Customers, Reports...)
    │   │   └── reports/      # 9 trang báo cáo chuyên sâu
    │   ├── components/       # UI components dùng chung
    │   │   └── shared/       # DateRangePicker, MoneyInput, LoadingOverlay...
    │   ├── services/print/   # Hệ thống in hợp đồng (DataMapper, PrintService, TemplateManager)
    │   ├── context/          # AuthContext, ConfirmContext
    │   ├── hooks/            # Custom hooks
    │   └── utils/            # interestFormatter, numberToWords...
    └── templates/            # HTML templates cho in hợp đồng (CD, TC, TG, GV, INV...)
```

---

## 🔑 Phân Quyền Hệ Thống (RBAC)

| Role              | Mô tả                                                       |
| ----------------- | ------------------------------------------------------------- |
| **Admin**   | Toàn quyền — quản lý cửa hàng, nhân viên, hệ thống |
| **Manager** | Quản lý hợp đồng, báo cáo, chốt ca                    |
| **Staff**   | Tạo/xem hợp đồng, thu lãi theo phạm vi được cấp     |

Quyền hạn được cấp chi tiết theo từng **chức năng** và **chi nhánh** cho từng nhân viên.

---

## 🖨️ Template In Hợp Đồng

| Mã template   | Loại      | Mô tả                                        |
| -------------- | ---------- | ---------------------------------------------- |
| `cd_01_001`  | Cầm đồ  | Hợp đồng cầm cố tài sản A4 tiêu chuẩn |
| `cd_02_001`  | Cầm đồ  | Giấy cầm cố tối giản                      |
| `tc_01_001`  | Tín chấp | Hợp đồng tín chấp chi tiết A4            |
| `tc_02_001`  | Tín chấp | Hợp đồng tín chấp tóm tắt               |
| `tg_01_001`  | Trả góp  | Hợp đồng trả góp + lịch đóng tiền     |
| `tg_02_001`  | Trả góp  | Biên nhận trả góp rút gọn                |
| `gv_01_001`  | Góp vốn  | Hợp đồng góp vốn đầu tư A4             |
| `gv_02_001`  | Góp vốn  | Chứng nhận nhận góp vốn                   |
| `inv_01_001` | Phiếu thu | Phiếu thu A4/A5                               |
| `inv_01_002` | Phiếu thu | Phiếu thu nhiệt K80                          |
| `inv_02_001` | Phiếu chi | Phiếu chi A4/A5                               |
| `inv_02_002` | Phiếu chi | Phiếu chi nhiệt K80                          |

---

## 📋 Tech Stack

| Layer              | Công nghệ                                      |
| ------------------ | ------------------------------------------------ |
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, DaisyUI |
| **Backend**  | Node.js, Express, TypeScript, Prisma ORM         |
| **Database** | PostgreSQL 14+                                   |
| **Auth**     | JWT + bcrypt, RBAC                               |
| **Deploy**   | Vercel (FE) + Railway (BE)                       |
| **Icons**    | Lucide React                                     |

---

## ⚖️ Điều Khoản Sử Dụng

Phần mềm CDPawn là công cụ tính toán và lưu trữ dữ liệu. Người dùng có trách nhiệm:

- Đảm bảo lãi suất tuân thủ **Điều 468 Bộ luật Dân sự 2015** (không vượt 20%/năm)
- Tự chịu trách nhiệm pháp lý về các giao dịch thực hiện qua hệ thống
- Bảo mật thông tin tài khoản và dữ liệu khách hàng
