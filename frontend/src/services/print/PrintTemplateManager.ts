import cd01Template from "../../../templates/cd_01_001.html?raw";
import cd02Template from "../../../templates/cd_02_001.html?raw";
import tc01Template from "../../../templates/tc_01_001.html?raw";
import tc02Template from "../../../templates/tc_02_001.html?raw";
import tg01Template from "../../../templates/tg_01_001.html?raw";
import tg02Template from "../../../templates/tg_02_001.html?raw";
import gv01Template from "../../../templates/gv_01_001.html?raw";
import gv02Template from "../../../templates/gv_02_001.html?raw";
import inv01001Template from "../../../templates/inv_01_001.html?raw";
import inv01002Template from "../../../templates/inv_01_002.html?raw";
import inv02001Template from "../../../templates/inv_02_001.html?raw";
import inv02002Template from "../../../templates/inv_02_002.html?raw";

export type PrintModuleType = "pawn" | "unsecured" | "installment" | "capital" | "receipt" | "payment";

export interface PrintTemplate {
  code: string;
  name: string;
  module: PrintModuleType;
  htmlContent: string;
}

const templates: PrintTemplate[] = [
  // 1. Cầm đồ
  { code: "CD_01_001", name: "Hợp đồng cầm cố tài sản - Mẫu 01 (Tiêu chuẩn A4)", module: "pawn", htmlContent: cd01Template },
  { code: "CD_02_001", name: "Giấy cầm cố tài sản - Mẫu 02 (Tối giản A4)", module: "pawn", htmlContent: cd02Template },

  // 2. Tín chấp
  { code: "TC_01_001", name: "Hợp đồng cho vay tín chấp - Mẫu 01 (Chi tiết A4)", module: "unsecured", htmlContent: tc01Template },
  { code: "TC_02_001", name: "Hợp đồng cho vay tín chấp - Mẫu 02 (Tối giản A4)", module: "unsecured", htmlContent: tc02Template },

  // 3. Trả góp
  { code: "TG_01_001", name: "Hợp đồng cho vay trả góp - Mẫu 01 (Kèm lịch đóng tiền A4)", module: "installment", htmlContent: tg01Template },
  { code: "TG_02_001", name: "Hợp đồng cho vay trả góp - Mẫu 02 (Tóm tắt A4)", module: "installment", htmlContent: tg02Template },

  // 4. Góp vốn / Nguồn vốn
  { code: "GV_01_001", name: "Hợp đồng hợp tác góp vốn đầu tư - Mẫu 01 (A4)", module: "capital", htmlContent: gv01Template },
  { code: "GV_02_001", name: "Giấy xác nhận nhận góp vốn đầu tư - Mẫu 02 (A4)", module: "capital", htmlContent: gv02Template },

  // 5. Phiếu thu
  { code: "INV_01_001", name: "Phiếu thu tiền - Mẫu 01 (Khổ A4/A5)", module: "receipt", htmlContent: inv01001Template },
  { code: "INV_01_002", name: "Phiếu thu tiền - Mẫu 02 (Khổ in nhiệt K80 80mm)", module: "receipt", htmlContent: inv01002Template },

  // 6. Phiếu chi
  { code: "INV_02_001", name: "Phiếu chi tiền - Mẫu 01 (Khổ A4/A5)", module: "payment", htmlContent: inv02001Template },
  { code: "INV_02_002", name: "Phiếu chi tiền - Mẫu 02 (Khổ in nhiệt K80 80mm)", module: "payment", htmlContent: inv02002Template },
];

export const getTemplates = (): PrintTemplate[] => {
  return templates;
};

export const getTemplatesByModule = (module: PrintModuleType): PrintTemplate[] => {
  return templates.filter((item) => item.module === module);
};

export const getTemplateByCode = (code: string): string => {
  // Normalize: strip .html suffix and convert to uppercase for matching
  const normalizedCode = code.trim().replace(/\.html$/i, "").toUpperCase();
  const t = templates.find((item) => item.code.toUpperCase() === normalizedCode);
  return t ? t.htmlContent : cd01Template;
};

export const getDefaultTemplateCode = (module: PrintModuleType): string => {
  switch (module) {
    case "pawn":
      return "CD_01_001";
    case "unsecured":
      return "TC_01_001";
    case "installment":
      return "TG_01_001";
    case "capital":
      return "GV_01_001";
    case "receipt":
      return "INV_01_001";
    case "payment":
      return "INV_02_001";
    default:
      return "CD_01_001";
  }
};

// Render template by replacing placeholders using regex matching {{PlaceholderName}}
export const renderTemplate = (code: string, data: Record<string, string>): string => {
  let html = getTemplateByCode(code);

  // Replace placeholders
  Object.entries(data).forEach(([key, val]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    html = html.replace(regex, val || "");
  });

  // Special case: If installment contract and template does not have schedule table placeholder, append it before signatures
  if (code.startsWith("TG_") && data.PaymentScheduleTable && !html.includes("{{PaymentScheduleTable}}")) {
    const appendHtml = `
      <div class="section-title" style="margin-top: 20px;">BẢNG LỊCH TRÌNH ĐÓNG TIỀN TRẢ GÓP CHI TIẾT</div>
      ${data.PaymentScheduleTable}
    `;
    html = html.replace(
      '<div class="signatures">',
      `${appendHtml}\n    <div class="signatures">`
    );
  }

  return html;
};

// Documented Placeholders for UI Display
export const MODULE_PLACEHOLDERS: Record<PrintModuleType, Array<{ key: string; label: string }>> = {
  pawn: [
    { key: "StoreName", label: "Tên cửa hàng" },
    { key: "StoreAddress", label: "Địa chỉ cửa hàng" },
    { key: "StorePhone", label: "Điện thoại cửa hàng" },
    { key: "ContractCode", label: "Mã hợp đồng" },
    { key: "CreatedDate", label: "Ngày tạo hợp đồng" },
    { key: "CustomerName", label: "Tên khách hàng" },
    { key: "CustomerIdentity", label: "Số CCCD/CMND" },
    { key: "CustomerPhone", label: "SĐT khách hàng" },
    { key: "CustomerAddress", label: "Địa chỉ khách hàng" },
    { key: "AssetType", label: "Loại tài sản" },
    { key: "AssetName", label: "Tên tài sản" },
    { key: "AssetDescription", label: "Chi tiết tài sản (Khung/Máy/Biển số)" },
    { key: "LoanAmountFormat", label: "Số tiền cầm (Số)" },
    { key: "LoanAmountInWords", label: "Số tiền cầm (Bằng chữ)" },
    { key: "InterestRateFormatted", label: "Lãi suất" },
    { key: "InterestTypeFormatted", label: "Gói lãi suất" },
    { key: "LoanDays", label: "Số ngày vay" },
    { key: "LoanStartDate", label: "Ngày bắt đầu vay" },
    { key: "LoanEndDate", label: "Ngày đáo hạn" },
  ],
  unsecured: [
    { key: "StoreName", label: "Tên cửa hàng" },
    { key: "StoreAddress", label: "Địa chỉ cửa hàng" },
    { key: "StorePhone", label: "Điện thoại cửa hàng" },
    { key: "ContractCode", label: "Mã hợp đồng" },
    { key: "CreatedDate", label: "Ngày tạo hợp đồng" },
    { key: "CustomerName", label: "Tên khách hàng" },
    { key: "CustomerIdentity", label: "Số CCCD/CMND" },
    { key: "CustomerPhone", label: "SĐT khách hàng" },
    { key: "CustomerAddress", label: "Địa chỉ khách hàng" },
    { key: "LoanAmountFormat", label: "Số tiền vay (Số)" },
    { key: "LoanAmountInWords", label: "Số tiền vay (Bằng chữ)" },
    { key: "InterestRateFormatted", label: "Lãi suất" },
    { key: "LoanDays", label: "Số ngày vay" },
    { key: "LoanStartDate", label: "Ngày bắt đầu vay" },
    { key: "LoanEndDate", label: "Ngày đáo hạn" },
  ],
  installment: [
    { key: "StoreName", label: "Tên cửa hàng" },
    { key: "StoreAddress", label: "Địa chỉ cửa hàng" },
    { key: "StorePhone", label: "Điện thoại cửa hàng" },
    { key: "ContractCode", label: "Mã hợp đồng" },
    { key: "CreatedDate", label: "Ngày tạo hợp đồng" },
    { key: "CustomerName", label: "Tên khách hàng" },
    { key: "CustomerIdentity", label: "Số CCCD/CMND" },
    { key: "CustomerPhone", label: "SĐT khách hàng" },
    { key: "LoanAmountFormat", label: "Tiền vay gốc" },
    { key: "TotalAmountPayableFormat", label: "Tổng tiền phải đóng (Gốc + Lãi)" },
    { key: "AmountPerPeriodFormat", label: "Số tiền đóng mỗi kỳ" },
    { key: "TotalPeriods", label: "Tổng số kỳ đóng" },
    { key: "PeriodValue", label: "Số ngày mỗi kỳ" },
    { key: "PaymentScheduleTable", label: "Bảng lịch đóng tiền chi tiết" },
  ],
  capital: [
    { key: "StoreName", label: "Tên cửa hàng nhận vốn" },
    { key: "StoreAddress", label: "Địa chỉ cửa hàng" },
    { key: "StorePhone", label: "Điện thoại cửa hàng" },
    { key: "ContractCode", label: "Mã hợp đồng góp vốn" },
    { key: "CreatedDate", label: "Ngày lập hợp đồng" },
    { key: "InvestorName", label: "Tên nhà đầu tư" },
    { key: "InvestorIdentity", label: "Số CMND/CCCD nhà đầu tư" },
    { key: "InvestorPhone", label: "SĐT nhà đầu tư" },
    { key: "InvestorAddress", label: "Địa chỉ nhà đầu tư" },
    { key: "CapitalAmountFormat", label: "Số tiền góp vốn (Số)" },
    { key: "CapitalAmountInWords", label: "Số tiền góp vốn (Bằng chữ)" },
    { key: "ProfitRateFormatted", label: "Lợi tức / Tỷ lệ chia sẻ" },
    { key: "CapitalDays", label: "Thời hạn đầu tư (ngày)" },
    { key: "CapitalStartDate", label: "Ngày bắt đầu góp" },
    { key: "CapitalEndDate", label: "Ngày rút gốc" },
  ],
  receipt: [
    { key: "StoreName", label: "Tên cửa hàng" },
    { key: "StoreAddress", label: "Địa chỉ cửa hàng" },
    { key: "StorePhone", label: "Điện thoại cửa hàng" },
    { key: "VoucherCode", label: "Mã phiếu thu" },
    { key: "CreatedDate", label: "Ngày tạo phiếu" },
    { key: "PayerName", label: "Tên người nộp tiền" },
    { key: "PayerAddress", label: "Địa chỉ người nộp" },
    { key: "Reason", label: "Lý do thu" },
    { key: "AmountFormat", label: "Số tiền thu (Số)" },
    { key: "AmountInWords", label: "Số tiền thu (Bằng chữ)" },
    { key: "CreatedByName", label: "Tên người lập phiếu" },
    { key: "AttachmentCount", label: "Số chứng từ kèm theo" },
  ],
  payment: [
    { key: "StoreName", label: "Tên cửa hàng" },
    { key: "StoreAddress", label: "Địa chỉ cửa hàng" },
    { key: "StorePhone", label: "Điện thoại cửa hàng" },
    { key: "VoucherCode", label: "Mã phiếu chi" },
    { key: "CreatedDate", label: "Ngày tạo phiếu" },
    { key: "PayerName", label: "Tên người nhận tiền" },
    { key: "PayerAddress", label: "Địa chỉ người nhận" },
    { key: "Reason", label: "Lý do chi" },
    { key: "AmountFormat", label: "Số tiền chi (Số)" },
    { key: "AmountInWords", label: "Số tiền chi (Bằng chữ)" },
    { key: "CreatedByName", label: "Tên người lập phiếu" },
    { key: "AttachmentCount", label: "Số chứng từ kèm theo" },
  ],
};
