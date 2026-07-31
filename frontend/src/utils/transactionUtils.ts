/**
 * Convert internal transaction codes / type strings to clear Vietnamese labels.
 */
export function formatTransactionType(type: string | undefined | null): string {
  if (!type) return "Giao dịch";

  const cleanType = String(type).trim().toLowerCase();

  switch (cleanType) {
    // Basic module/contract types
    case "pawn":
      return "Hợp đồng Cầm đồ";
    case "unsecured":
    case "loan":
      return "Hợp đồng Tín chấp";
    case "installment":
      return "Hợp đồng Trả góp";
    case "capital":
    case "capital_contract":
      return "Hợp đồng Góp vốn";

    // Disbursements
    case "disbursement":
    case "disburse":
      return "Giải ngân hợp đồng";
    case "pawn_disbursement":
      return "Giải ngân Cầm đồ";
    case "unsecured_disbursement":
      return "Giải ngân Tín chấp";
    case "installment_disbursement":
      return "Giải ngân Trả góp";
    case "capital_investment":
    case "capital_disbursement":
      return "Nhận tiền góp vốn";

    // Interest Payments
    case "interest":
    case "interest_payment":
    case "pay_interest":
    case "pawn_interest":
    case "unsecured_interest":
      return "Thu tiền lãi";

    // Principal Adjustments
    case "pay_down":
    case "pay_down_principal":
    case "pawn_pay_down":
    case "unsecured_pay_down":
      return "Trả bớt gốc";

    case "add_principal":
    case "borrow_more":
    case "pawn_add_principal":
    case "unsecured_borrow_more":
      return "Vay thêm gốc";

    case "withdraw_principal":
    case "reduce_capital":
    case "capital_withdraw_principal":
      return "Rút bớt vốn gốc";

    case "capital_add_principal":
      return "Góp thêm vốn gốc";

    case "withdraw_all":
    case "settle_capital":
    case "capital_withdraw_all":
      return "Tất toán rút vốn";

    case "extend":
    case "extension":
    case "pawn_extend":
    case "unsecured_extend":
      return "Gia hạn hợp đồng";

    // Redemptions / Closing
    case "redemption":
    case "close":
    case "close_contract":
    case "completed":
    case "pawn_redemption":
    case "pawn_close":
    case "unsecured_redemption":
    case "unsecured_close":
    case "installment_close":
      return "Tất toán hợp đồng";

    case "liquidated":
    case "liquidation":
    case "pawn_liquidation":
      return "Thanh lý tài sản";

    case "record_debt":
    case "debt_add":
      return "Ghi nợ mới";

    case "debt_payment":
    case "pay_debt":
      return "Khách đóng nợ";

    case "installment_payment":
    case "pay_installment":
      return "Thu tiền góp";

    // Cash fund / Vouchers
    case "beginning_cash_set":
    case "beginning_cash":
      return "Thiết lập quỹ đầu ngày";

    case "adjust":
    case "cash_adjust":
      return "Điều chỉnh quỹ két";

    case "variance_surplus":
      return "Kiểm két (Thừa tiền)";

    case "variance_deficit":
      return "Kiểm két (Thiếu tiền)";

    case "expense":
    case "voucher_expense":
      return "Phiếu chi hoạt động";

    case "income":
    case "voucher_income":
      return "Phiếu thu hoạt động";

    case "receipt":
      return "Phiếu thu";

    case "payment":
      return "Phiếu chi";

    default:
      return type;
  }
}
