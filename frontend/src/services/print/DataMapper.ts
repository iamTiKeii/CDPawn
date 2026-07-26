// Helper to format currency values
export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  })
    .format(val)
    .replace("₫", "")
    .trim();
};

import { formatInterestRateText } from "../../utils/interestFormatter";

// Helper to convert numeric amount to Vietnamese words
export const convertNumberToVietnameseWords = (amount: number): string => {
  if (amount === 0) return "Không đồng";
  const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const placeValues = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

  const readThreeDigits = (num: number, showZeroHundred: boolean): string => {
    const hundred = Math.floor(num / 100);
    const ten = Math.floor((num % 100) / 10);
    const unit = num % 10;
    let res = "";

    if (hundred > 0 || showZeroHundred) {
      res += units[hundred] + " trăm ";
    }

    if (ten > 0) {
      if (ten === 1) res += "mười ";
      else res += units[ten] + " mươi ";
    } else if (hundred > 0 && unit > 0) {
      res += "lẻ ";
    }

    if (unit > 0) {
      if (ten > 1 && unit === 1) res += "mốt";
      else if (ten > 0 && unit === 5) res += "lăm";
      else if (ten === 0 && unit === 5) res += "năm";
      else res += units[unit];
    }
    return res.trim();
  };

  let numStr = String(Math.floor(amount));
  while (numStr.length % 3 !== 0) {
    numStr = "0" + numStr;
  }

  const groups: string[] = [];
  for (let i = 0; i < numStr.length; i += 3) {
    groups.push(numStr.substring(i, i + 3));
  }

  let result = "";
  let started = false;

  for (let i = 0; i < groups.length; i++) {
    const val = Number(groups[i]);
    const placeIdx = groups.length - 1 - i;

    if (val > 0) {
      const groupText = readThreeDigits(val, started);
      result += groupText + " " + placeValues[placeIdx] + " ";
      started = true;
    }
  }

  result = result.trim();
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }
  return result + " đồng";
};

// Generates the repayment schedule table for installment loans
export const generateRepaymentScheduleTable = (payments: any[]): string => {
  if (!payments || payments.length === 0) return "";

  const rows = payments
    .map((p: any) => {
      const formattedDate = p.to_date
        ? new Date(p.to_date).toLocaleDateString("vi-VN")
        : "";
      const formattedAmount = formatCurrency(p.expected_amount || 0);
      const statusText = p.is_paid ? "Đã đóng" : "Chưa đóng";
      const statusStyle = p.is_paid ? "color: #10b981; font-weight: bold;" : "color: #ef4444;";

      return `
        <tr>
          <td style="border: 1px solid #000; padding: 6px; text-align: center;">Kỳ ${p.cycle_number}</td>
          <td style="border: 1px solid #000; padding: 6px; text-align: center;">${formattedDate}</td>
          <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold;">${formattedAmount} VNĐ</td>
          <td style="border: 1px solid #000; padding: 6px; text-align: center; ${statusStyle}">${statusText}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px;">
      <thead>
        <tr style="background-color: #f2f2f2;">
          <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">Kỳ số</th>
          <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">Hạn đóng</th>
          <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">Số tiền kỳ</th>
          <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">Trạng thái</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
};

// Common Customer extraction helper
const getCustomerDetails = (contract: any) => {
  const cust = contract.customer || {};
  const name = cust.full_name || cust.name || contract.customer_name || contract.investor_name || contract.person_name || "";
  const phone = cust.phone || contract.customer_phone || contract.investor_phone || "";
  const address = cust.address || contract.customer_address || contract.investor_address || contract.person_address || "";
  const identityNumber = cust.identity_card_number || cust.identity_number || cust.id_card || cust.cmnd || cust.cccd || contract.investor_id_card || contract.customer_id_card || "";
  
  const rawIssueDate = cust.identity_card_date || cust.identity_date || cust.issue_date || contract.customer_id_card_date || "";
  const identityIssueDate = rawIssueDate ? new Date(rawIssueDate).toLocaleDateString("vi-VN") : "";
  
  const identityIssuePlace = cust.identity_card_place || cust.identity_place || cust.issue_place || contract.customer_id_card_place || "";
  const bankAccount = cust.bank_account_number || cust.bank_account || "";
  const bankName = cust.bank_name || "";

  return {
    name,
    phone,
    address,
    identityNumber,
    identityIssueDate,
    identityIssuePlace,
    bankAccount,
    bankName,
  };
};

// Common Commodity Asset extraction helper
const getAssetDetails = (contract: any) => {
  const parts = contract.commodity?.name?.split("|") || [];
  const assetType = parts[0] || contract.commodity?.name || "Tài sản";
  const attrs = parts[1] ? parts[1].split(",") : [];

  const attr1Label = attrs[0] || (contract.license_plate ? "Biển số/ĐK" : "");
  const attr2Label = attrs[1] || (contract.chassis_number ? "Số khung" : "");
  const attr3Label = attrs[2] || (contract.engine_number ? "Số máy" : "");

  const assetDetailParts: string[] = [];
  if (contract.asset_name) {
    assetDetailParts.push(`Tên tài sản: ${contract.asset_name}`);
  }
  if (contract.license_plate) {
    assetDetailParts.push(attr1Label ? `${attr1Label}: ${contract.license_plate}` : contract.license_plate);
  }
  if (contract.chassis_number) {
    assetDetailParts.push(attr2Label ? `${attr2Label}: ${contract.chassis_number}` : contract.chassis_number);
  }
  if (contract.engine_number) {
    assetDetailParts.push(attr3Label ? `${attr3Label}: ${contract.engine_number}` : contract.engine_number);
  }

  const assetDetail = assetDetailParts.join(", ") || contract.asset_name || assetType || "—";

  return {
    assetType,
    assetDetail,
    assetCode: contract.commodity?.code || "",
    assetName: contract.asset_name || assetType,
    licensePlate: contract.license_plate || "",
    chassisNumber: contract.chassis_number || "",
    engineNumber: contract.engine_number || "",
  };
};

// Map Pawn Contract to standardized flat dictionary
export const buildPawnContractPrintData = (
  contract: any,
  store: any,
  isNegotiated: boolean = false
): Record<string, string> => {
  let rep = "Thực";
  try {
    if (store?.notes) {
      const notesObj = JSON.parse(store.notes);
      rep = notesObj.representative || "Thực";
    }
  } catch {
    rep = store?.notes || "Thực";
  }

  const cust = getCustomerDetails(contract);
  const asset = getAssetDetails(contract);

  const loanStartDate = contract.loan_date
    ? new Date(contract.loan_date).toLocaleDateString("vi-VN")
    : "";

  const loanEndDate = contract.loan_date && contract.loan_days
    ? new Date(
        new Date(contract.loan_date).getTime() +
          contract.loan_days * 24 * 60 * 60 * 1000
      ).toLocaleDateString("vi-VN")
    : "";

  let interestRateVal = "";
  if (isNegotiated) {
    interestRateVal = "Thỏa thuận";
  } else {
    if (contract.interest_rate !== undefined && contract.interest_rate !== null) {
      interestRateVal = formatInterestRateText(Number(contract.interest_rate), contract.interest_type?.code, contract.period_value);
    } else {
      interestRateVal = "Thỏa thuận";
    }
  }

  const loanAmt = Number(contract.loan_amount || 0);
  const loanAmountStr = formatCurrency(loanAmt);
  const loanAmountText = convertNumberToVietnameseWords(loanAmt);

  return {
    ContractCode: contract.contract_code || "",
    MaHopDong: contract.contract_code || "",
    CreatedDate: loanStartDate || "",
    NgayVay: loanStartDate || "",
    ContractDate: loanStartDate || "",

    StoreName: store?.name || "CDPawn",
    TenCuaHang: store?.name || "CDPawn",
    StoreAddress: store?.address || "",
    DiaChiCuaHang: store?.address || "",
    StorePhone: store?.phone || "",
    DienThoaiCuaHang: store?.phone || "",
    Representative: rep,

    CustomerName: cust.name,
    TenKhachHang: cust.name,
    CustomerPhone: cust.phone,
    SoDienThoai: cust.phone,
    CustomerAddress: cust.address,
    DiaChiKhachHang: cust.address,
    DiaChi: cust.address,

    IdentityNumber: cust.identityNumber,
    CustomerIdentity: cust.identityNumber,
    SoCMND: cust.identityNumber,
    SoCCCD: cust.identityNumber,
    CCCD: cust.identityNumber,
    CMND: cust.identityNumber,

    IdentityIssueDate: cust.identityIssueDate,
    NgayCap: cust.identityIssueDate,
    NgayCapCMND: cust.identityIssueDate,

    IdentityIssuePlace: cust.identityIssuePlace,
    NoiCap: cust.identityIssuePlace,
    NoiCapCMND: cust.identityIssuePlace,

    CustomerBankAccount: cust.bankAccount,
    CustomerBankName: cust.bankName,

    LoanAmount: loanAmountStr,
    LoanAmountFormat: loanAmountStr,
    SoTienVay: loanAmountStr,
    LoanAmountText: loanAmountText,
    LoanAmountInWords: loanAmountText,
    SoTienBangChu: loanAmountText,

    LoanDays: String(contract.loan_days || 30),
    LoanStartDate: loanStartDate,
    LoanEndDate: loanEndDate,
    NgayHetHan: loanEndDate,
    InterestRate: interestRateVal,
    InterestRateFormatted: interestRateVal,
    InterestTypeFormatted: contract.interest_type?.name || "Lãi suất ngày",

    AssetCode: asset.assetCode,
    MaTaiSan: asset.assetCode || asset.assetName,
    MaHangHoa: asset.assetCode,
    AssetType: asset.assetType,
    LoaiTaiSan: asset.assetType,
    AssetName: asset.assetName,
    TenTaiSan: asset.assetName,
    AssetDetail: asset.assetDetail,
    AssetDescription: asset.assetDetail,
    MoTaTaiSan: asset.assetDetail,
    ThuocTinhTaiSan: asset.assetDetail,

    LicensePlate: asset.licensePlate,
    BienSoXe: asset.licensePlate,
    BienSo: asset.licensePlate,
    ChassisNumber: asset.chassisNumber,
    SoKhung: asset.chassisNumber,
    EngineNumber: asset.engineNumber,
    SoMay: asset.engineNumber,
  };
};

// Map Unsecured Contract to standardized flat dictionary
export const buildLoanContractPrintData = (
  contract: any,
  store: any
): Record<string, string> => {
  let rep = "Thực";
  try {
    if (store?.notes) {
      const notesObj = JSON.parse(store.notes);
      rep = notesObj.representative || "Thực";
    }
  } catch {
    rep = store?.notes || "Thực";
  }

  const cust = getCustomerDetails(contract);
  const asset = getAssetDetails(contract);

  const loanStartDate = contract.loan_date
    ? new Date(contract.loan_date).toLocaleDateString("vi-VN")
    : "";

  const loanEndDate = contract.loan_date && contract.loan_days
    ? new Date(
        new Date(contract.loan_date).getTime() +
          contract.loan_days * 24 * 60 * 60 * 1000
      ).toLocaleDateString("vi-VN")
    : "";

  const interestRateVal =
    contract.interest_rate !== undefined && contract.interest_rate !== null
      ? formatInterestRateText(Number(contract.interest_rate), contract.interest_type?.code, contract.period_value)
      : "Thỏa thuận";
  const loanAmt = Number(contract.loan_amount || 0);
  const loanAmountStr = formatCurrency(loanAmt);
  const loanAmountText = convertNumberToVietnameseWords(loanAmt);

  const totalInterestVal = Number(contract.totalInterest || 0);
  const totalRepaymentVal = Number(contract.totalRepayment || 0);

  return {
    ContractCode: contract.contract_code || "",
    MaHopDong: contract.contract_code || "",
    CreatedDate: loanStartDate || "",
    NgayVay: loanStartDate || "",
    ContractDate: loanStartDate || "",

    StoreName: store?.name || "CDPawn",
    TenCuaHang: store?.name || "CDPawn",
    StoreAddress: store?.address || "",
    DiaChiCuaHang: store?.address || "",
    StorePhone: store?.phone || "",
    DienThoaiCuaHang: store?.phone || "",
    Representative: rep,

    CustomerName: cust.name,
    TenKhachHang: cust.name,
    CustomerPhone: cust.phone,
    SoDienThoai: cust.phone,
    CustomerAddress: cust.address,
    DiaChiKhachHang: cust.address,
    DiaChi: cust.address,

    IdentityNumber: cust.identityNumber,
    CustomerIdentity: cust.identityNumber,
    SoCMND: cust.identityNumber,
    SoCCCD: cust.identityNumber,
    CCCD: cust.identityNumber,
    CMND: cust.identityNumber,

    IdentityIssueDate: cust.identityIssueDate,
    NgayCap: cust.identityIssueDate,
    NgayCapCMND: cust.identityIssueDate,

    IdentityIssuePlace: cust.identityIssuePlace,
    NoiCap: cust.identityIssuePlace,
    NoiCapCMND: cust.identityIssuePlace,

    CustomerBankAccount: cust.bankAccount,
    CustomerBankName: cust.bankName,

    LoanAmount: loanAmountStr,
    LoanAmountFormat: loanAmountStr,
    SoTienVay: loanAmountStr,
    LoanAmountText: loanAmountText,
    LoanAmountInWords: loanAmountText,
    SoTienBangChu: loanAmountText,

    LoanDays: String(contract.loan_days || 30),
    LoanStartDate: loanStartDate,
    LoanEndDate: loanEndDate,
    NgayHetHan: loanEndDate,

    InterestRate: interestRateVal,
    InterestRateFormatted: interestRateVal,
    InterestTypeFormatted: contract.interest_type?.name || "Tín chấp tiêu dùng",

    AssetCode: asset.assetCode,
    MaTaiSan: asset.assetCode || asset.assetName,
    MaHangHoa: asset.assetCode,
    AssetType: asset.assetType || "Cho vay tín chấp",
    LoaiTaiSan: asset.assetType || "Cho vay tín chấp",
    AssetName: asset.assetName,
    TenTaiSan: asset.assetName,
    AssetDetail: asset.assetDetail,
    AssetDescription: asset.assetDetail,
    MoTaTaiSan: asset.assetDetail,
    ThuocTinhTaiSan: asset.assetDetail,

    TotalInterest: formatCurrency(totalInterestVal),
    TotalRepayment: formatCurrency(totalRepaymentVal),
    TotalRepaymentText: convertNumberToVietnameseWords(totalRepaymentVal),
  };
};

// Map Installment Contract to standardized flat dictionary
export const buildInstallmentPrintData = (
  contract: any,
  store: any
): Record<string, string> => {
  let rep = "Thực";
  try {
    if (store?.notes) {
      const notesObj = JSON.parse(store.notes);
      rep = notesObj.representative || "Thực";
    }
  } catch {
    rep = store?.notes || "Thực";
  }

  const cust = getCustomerDetails(contract);
  const asset = getAssetDetails(contract);

  const loanStartDate = contract.loan_date
    ? new Date(contract.loan_date).toLocaleDateString("vi-VN")
    : "";

  const loanEndDate = contract.loan_date && contract.loan_days
    ? new Date(
        new Date(contract.loan_date).getTime() +
          contract.loan_days * 24 * 60 * 60 * 1000
      ).toLocaleDateString("vi-VN")
    : "";

  const interestRateVal =
    contract.interest_rate !== undefined && contract.interest_rate !== null
      ? `${contract.interest_rate}%`
      : "Thỏa thuận";

  const loanAmt = Number(contract.loan_amount || contract.disbursed_amount || 0);
  const loanAmountStr = formatCurrency(loanAmt);
  const loanAmountText = convertNumberToVietnameseWords(loanAmt);

  const totalRepaymentAmt = Number(contract.total_amount || contract.repayment_amount || 0);
  const totalRepaymentStr = formatCurrency(totalRepaymentAmt);

  const amountPerPeriodAmt = Number(contract.amount_per_period || (contract.loan_duration ? totalRepaymentAmt / contract.loan_duration : 0));
  const amountPerPeriodStr = formatCurrency(amountPerPeriodAmt);

  const cycleDays = contract.cycle_days || contract.period_value || 1;
  const loanDuration = contract.loan_duration || contract.total_periods || 30;

  const paymentScheduleTable = generateRepaymentScheduleTable(
    contract.payments || []
  );

  return {
    ContractCode: contract.contract_code || "",
    MaHopDong: contract.contract_code || "",
    CreatedDate: loanStartDate || "",
    NgayVay: loanStartDate || "",
    ContractDate: loanStartDate || "",

    StoreName: store?.name || "CDPawn",
    TenCuaHang: store?.name || "CDPawn",
    StoreAddress: store?.address || "",
    DiaChiCuaHang: store?.address || "",
    StorePhone: store?.phone || "",
    DienThoaiCuaHang: store?.phone || "",
    Representative: rep,

    CustomerName: cust.name,
    TenKhachHang: cust.name,
    CustomerPhone: cust.phone,
    SoDienThoai: cust.phone,
    CustomerAddress: cust.address,
    DiaChiKhachHang: cust.address,
    DiaChi: cust.address,

    IdentityNumber: cust.identityNumber,
    CustomerIdentity: cust.identityNumber,
    SoCMND: cust.identityNumber,
    SoCCCD: cust.identityNumber,
    CCCD: cust.identityNumber,
    CMND: cust.identityNumber,

    IdentityIssueDate: cust.identityIssueDate,
    NgayCap: cust.identityIssueDate,
    NgayCapCMND: cust.identityIssueDate,

    IdentityIssuePlace: cust.identityIssuePlace,
    NoiCap: cust.identityIssuePlace,
    NoiCapCMND: cust.identityIssuePlace,

    CustomerBankAccount: cust.bankAccount,
    CustomerBankName: cust.bankName,

    LoanAmount: loanAmountStr,
    LoanAmountFormat: loanAmountStr,
    SoTienVay: loanAmountStr,
    LoanAmountText: loanAmountText,
    LoanAmountInWords: loanAmountText,
    SoTienBangChu: loanAmountText,

    TotalAmountPayableFormat: totalRepaymentStr,
    AmountPerPeriodFormat: amountPerPeriodStr,
    LoanDays: String(contract.loan_days || loanDuration),
    LoanStartDate: loanStartDate,
    LoanEndDate: loanEndDate,
    NgayHetHan: loanEndDate,

    InterestRate: interestRateVal,

    AssetCode: asset.assetCode,
    MaTaiSan: asset.assetCode || asset.assetName,
    MaHangHoa: asset.assetCode,
    AssetType: asset.assetType || "Cho vay trả góp",
    LoaiTaiSan: asset.assetType || "Cho vay trả góp",
    AssetName: asset.assetName,
    TenTaiSan: asset.assetName,
    AssetDetail: asset.assetDetail,
    AssetDescription: asset.assetDetail,
    MoTaTaiSan: asset.assetDetail,
    ThuocTinhTaiSan: asset.assetDetail,

    RepaymentAmount: totalRepaymentStr,
    PeriodType: contract.period_type || "ngày",
    LoanDuration: String(loanDuration),
    TotalPeriods: String(loanDuration),
    CycleDays: String(cycleDays),
    PeriodValue: String(cycleDays),
    PaymentScheduleTable: paymentScheduleTable,
  };
};

// Map Capital Contract to standardized flat dictionary
export const buildCapitalContractPrintData = (
  contract: any,
  store: any
): Record<string, string> => {
  const capitalAmt = Number(contract.capital_amount || contract.amount || 0);
  const capitalAmtStr = formatCurrency(capitalAmt);
  const capitalAmtText = convertNumberToVietnameseWords(capitalAmt);

  const startDate = contract.start_date || contract.created_at
    ? new Date(contract.start_date || contract.created_at).toLocaleDateString("vi-VN")
    : "";

  const endDate = contract.end_date
    ? new Date(contract.end_date).toLocaleDateString("vi-VN")
    : "";

  const profitRateStr = contract.profit_rate !== undefined && contract.profit_rate !== null
    ? `${contract.profit_rate}%`
    : "Thỏa thuận";

  const cust = getCustomerDetails(contract);

  return {
    ContractCode: contract.contract_code || contract.code || "",
    MaHopDong: contract.contract_code || contract.code || "",
    CreatedDate: startDate,
    NgayLap: startDate,

    InvestorName: cust.name,
    TenNhaDauTu: cust.name,
    CustomerName: cust.name,
    TenKhachHang: cust.name,

    InvestorIdentity: cust.identityNumber,
    CustomerIdentity: cust.identityNumber,
    IdentityNumber: cust.identityNumber,
    SoCMND: cust.identityNumber,
    SoCCCD: cust.identityNumber,
    CCCD: cust.identityNumber,
    CMND: cust.identityNumber,

    IdentityIssueDate: cust.identityIssueDate,
    NgayCap: cust.identityIssueDate,
    NgayCapCMND: cust.identityIssueDate,

    IdentityIssuePlace: cust.identityIssuePlace,
    NoiCap: cust.identityIssuePlace,
    NoiCapCMND: cust.identityIssuePlace,

    InvestorPhone: cust.phone,
    CustomerPhone: cust.phone,
    SoDienThoai: cust.phone,

    InvestorAddress: cust.address,
    CustomerAddress: cust.address,
    DiaChiNhaDauTu: cust.address,
    DiaChiKhachHang: cust.address,
    DiaChi: cust.address,

    CapitalAmountFormat: capitalAmtStr,
    CapitalAmount: capitalAmtStr,
    SoTienGop: capitalAmtStr,
    CapitalAmountInWords: capitalAmtText,
    SoTienBangChu: capitalAmtText,

    ProfitRateFormatted: profitRateStr,
    ProfitRate: profitRateStr,
    CapitalDays: String(contract.capital_days || contract.duration_days || 30),
    CapitalStartDate: startDate,
    NgayBatDau: startDate,
    CapitalEndDate: endDate,
    NgayKetThuc: endDate,

    StoreName: store?.name || "CDPawn",
    TenCuaHang: store?.name || "CDPawn",
    StoreAddress: store?.address || "",
    DiaChiCuaHang: store?.address || "",
    StorePhone: store?.phone || "",
    DienThoaiCuaHang: store?.phone || "",
  };
};

// Map Voucher (Receipt / Payment) to standardized flat dictionary
export const buildVoucherPrintData = (
  voucher: any,
  store: any
): Record<string, string> => {
  const amt = Number(voucher.amount || 0);
  const amtStr = formatCurrency(amt);
  const amtText = convertNumberToVietnameseWords(amt);

  const createdDateObj = voucher.created_at ? new Date(voucher.created_at) : new Date();
  const createdDateStr = createdDateObj.toLocaleDateString("vi-VN");

  const cust = getCustomerDetails(voucher);
  const payerName = voucher.person_name || cust.name || "—";
  const payerAddress = voucher.person_address || cust.address || "—";
  const createdByName = voucher.employee?.full_name || voucher.created_by_name || "Quản trị viên";
  const reason = voucher.reason || voucher.description || "—";

  return {
    VoucherCode: voucher.voucher_code || voucher.code || voucher.id || "",
    MaPhieu: voucher.voucher_code || voucher.code || voucher.id || "",
    CreatedDate: createdDateStr,
    NgayLap: createdDateStr,
    VoucherDay: String(createdDateObj.getDate()),
    VoucherMonth: String(createdDateObj.getMonth() + 1),
    VoucherYear: String(createdDateObj.getFullYear()),

    PayerName: payerName,
    NguoiNopNhan: payerName,
    TenKhachHang: payerName,
    CustomerName: payerName,

    PayerAddress: payerAddress,
    DiaChiNguoiNop: payerAddress,
    CustomerAddress: payerAddress,
    DiaChiKhachHang: payerAddress,

    IdentityNumber: cust.identityNumber,
    CustomerIdentity: cust.identityNumber,
    SoCMND: cust.identityNumber,

    Reason: reason,
    LyDo: reason,

    AmountFormat: amtStr,
    Amount: amtStr,
    SoTien: amtStr,
    AmountInWords: amtText,
    SoTienBangChu: amtText,

    CreatedByName: createdByName,
    NguoiLapPhieu: createdByName,
    AttachmentCount: String(voucher.attachment_count || 1),
    ChungTuKemTheo: String(voucher.attachment_count || 1),

    StoreName: store?.name || "CDPawn",
    TenCuaHang: store?.name || "CDPawn",
    StoreAddress: store?.address || "",
    DiaChiCuaHang: store?.address || "",
    StorePhone: store?.phone || "",
    DienThoaiCuaHang: store?.phone || "",
  };
};

// Legacy aliases for backward compatibility
export const buildReceiptVoucherPrintData = buildVoucherPrintData;
export const buildPaymentVoucherPrintData = buildVoucherPrintData;
