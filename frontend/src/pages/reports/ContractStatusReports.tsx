import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import {
  Search,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  X,
  AlertOctagon,
  Download,
  Printer,
  ChevronDown,
  FileSpreadsheet,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "../../lib/toast";
import { formatInterestRateText } from "../../utils/interestFormatter";
import { DateRangePicker } from "../../components/shared/DateRangePicker";

export const ContractStatusReports: React.FC<{ overrideCategory?: string }> = ({ overrideCategory }) => {
  const { activeStore } = useAuth();
  const { category: paramCategory } = useParams<{ category: string }>();
  const category = overrideCategory || paramCategory;

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState<"pawn" | "unsecured" | "installment">("pawn");
  const [data, setData] = useState<{ pawn: any[]; unsecured: any[]; installment: any[] }>({
    pawn: [],
    unsecured: [],
    installment: [],
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Liquidation state variables
  const [isLiquidateOpen, setIsLiquidateOpen] = useState(false);
  const [liquidateContract, setLiquidateContract] = useState<any>(null);
  const [liquidationPrice, setLiquidationPrice] = useState("");
  const [liquidationBuyer, setLiquidationBuyer] = useState("");
  const [liquidationNotes, setLiquidationNotes] = useState("");

  const handleLiquidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liquidateContract) return;
    try {
      setLoading(true);
      await axios.post(`/api/contracts/pawn/${liquidateContract.id}/liquidate`, {
        liquidation_price: Number(liquidationPrice),
        buyer: liquidationBuyer,
        notes: liquidationNotes,
      });
      toast.success("Thanh lý tài sản hợp đồng thành công!");
      setIsLiquidateOpen(false);
      setLiquidateContract(null);
      setLiquidationPrice("");
      setLiquidationBuyer("");
      setLiquidationNotes("");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Lỗi khi thực hiện thanh lý.");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    if (!activeStore || !category) return;
    try {
      setLoading(true);
      setError("");
      let url = `/api/reports/contracts?category=${category}&search=${search}`;
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await axios.get(url);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Lỗi khi tải danh sách hợp đồng báo cáo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Default tab adjustments based on category
    if (category === "waiting-liquidation" || category === "liquidated") {
      setActiveTab("pawn");
    }
  }, [activeStore, category, search, startDate, endDate]);

  const getTitle = () => {
    switch (category) {
      case "active-loans":
        return "Báo Cáo Hợp Đồng Đang Vay";
      case "waiting-liquidation":
        return "Báo Cáo Hàng Chờ Thanh Lý (Cầm Đồ)";
      case "redeemed":
        return "Báo Cáo Hợp Đồng Tất Toán (Chuộc Đồ / Đóng Xong)";
      case "liquidated":
        return "Báo Cáo Hợp Đồng Đã Thanh Lý Tài Sản";
      case "cancelled":
        return "Báo Cáo Hợp Đồng Đã Hủy / Xóa";
      default:
        return "Báo Cáo Hợp Đồng";
    }
  };

  const getSubtext = () => {
    switch (category) {
      case "active-loans":
        return "Danh sách tất cả hợp đồng tín dụng đang trong kỳ hạn vay hoặc quá nợ chưa chốt sổ.";
      case "waiting-liquidation":
        return "Danh sách hợp đồng cầm đồ đã quá hạn nợ đóng lãi vượt quá số ngày quy định của sản phẩm.";
      case "redeemed":
        return "Danh sách hợp đồng đã hoàn tất đóng đủ nợ gốc, nợ lãi và đóng hợp đồng thành công.";
      case "liquidated":
        return "Danh sách hợp đồng cầm đồ đã thực hiện thanh lý tài sản thế chấp để bù trừ công nợ.";
      case "cancelled":
        return "Danh sách hợp đồng đã bị xóa/hủy khỏi danh sách chính thức để lưu nhật ký.";
      default:
        return "Báo cáo thống kê hợp đồng.";
    }
  };

  const formatCurrency = (val: any) => {
    return Number(val || 0).toLocaleString("vi-VN") + " đ";
  };

  const formatNumberOnly = (val: any) => {
    return Number(val || 0).toLocaleString("vi-VN");
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Đang vay";
      case "overdue": return "Quá hạn";
      case "debt": return "Nợ lãi";
      case "closed": return "Tất toán";
      case "liquidated": return "Đã thanh lý";
      case "cancelled": return "Đã hủy";
      default: return status;
    }
  };

  // Check which tabs are shown
  const showInstallment = category !== "waiting-liquidation" && category !== "liquidated";
  const showUnsecured = category !== "waiting-liquidation" && category !== "liquidated";

  const currentList = activeTab === "pawn"
    ? data.pawn
    : activeTab === "unsecured"
    ? data.unsecured
    : data.installment;

  const tabName = activeTab === "pawn" ? "Cầm Đồ" : activeTab === "unsecured" ? "Tín Chấp" : "Trả Góp";

  const handleExportHTML = () => {
    let tableRowsHTML = "";

    if (currentList.length === 0) {
      tableRowsHTML = `<tr><td colSpan="8" class="text-center" style="padding: 15px; color:#6b7280;">Không tìm thấy dữ liệu hợp đồng nào.</td></tr>`;
    } else if (activeTab === "pawn") {
      tableRowsHTML = currentList.map((item, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center font-bold">${item.code}</td>
          <td class="font-bold">${item.customer?.full_name || "—"}</td>
          <td>${item.commodity_name || "—"}</td>
          <td class="text-center">${new Date(item.start_date).toLocaleDateString("vi-VN")}</td>
          <td class="text-right font-bold">${formatNumberOnly(item.loan_amount)}</td>
          <td class="text-center">${formatInterestRateText(item.interest_rate, item.interest_type)}</td>
          <td class="text-center">${getStatusText(item.status)}</td>
        </tr>
      `).join("");
    } else if (activeTab === "unsecured") {
      tableRowsHTML = currentList.map((item, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center font-bold">${item.code}</td>
          <td class="font-bold">${item.customer?.full_name || "—"}</td>
          <td class="text-center">${new Date(item.start_date).toLocaleDateString("vi-VN")}</td>
          <td class="text-right font-bold">${formatNumberOnly(item.loan_amount)}</td>
          <td class="text-center">${item.loan_term} ngày</td>
          <td class="text-center">${formatInterestRateText(item.interest_rate, item.interest_type)}</td>
          <td class="text-center">${getStatusText(item.status)}</td>
        </tr>
      `).join("");
    } else {
      tableRowsHTML = currentList.map((item, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center font-bold">${item.code}</td>
          <td class="font-bold">${item.customer?.full_name || "—"}</td>
          <td class="text-center">${new Date(item.start_date).toLocaleDateString("vi-VN")}</td>
          <td class="text-right font-bold">${formatNumberOnly(item.total_amount)}</td>
          <td class="text-right">${formatNumberOnly(item.installment_amount)}</td>
          <td class="text-center">${item.paid_periods}/${item.total_periods} kỳ</td>
          <td class="text-center">${getStatusText(item.status)}</td>
        </tr>
      `).join("");
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>${getTitle()} (${tabName}) - Bản In</title>
    <style>
        :root { --font-main: 'Times New Roman', Times, serif; }
        body { font-family: var(--font-main); background-color: #525659; margin: 0; padding: 20px; font-size: 12pt; color: #000; }
        .page-a4 { width: 210mm; min-height: 297mm; padding: 20mm 15mm; margin: 0 auto; background: #fff; box-shadow: 0 0 10px rgba(0,0,0,0.5); box-sizing: border-box; }
        .company-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .company-info h3 { margin: 0 0 5px 0; font-size: 14pt; text-transform: uppercase; }
        .company-info p { margin: 0 0 3px 0; font-size: 11pt; }
        .report-title { text-align: center; margin: 30px 0; }
        .report-title h1 { margin: 0; font-size: 18pt; text-transform: uppercase; }
        .report-title p { margin: 5px 0 0 0; font-style: italic; }
        .section-title { font-weight: bold; font-size: 14pt; margin: 20px 0 10px 0; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11pt; }
        th, td { border: 1px solid #000; padding: 6px; vertical-align: middle; }
        th { text-align: center; font-weight: bold; background-color: #f2f2f2; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .signature-section { display: flex; justify-content: space-between; margin-top: 40px; page-break-inside: avoid; }
        .signature-box { text-align: center; width: 30%; }
        .signature-box .role { font-weight: bold; margin-bottom: 5px; }
        .signature-box .note { font-style: italic; font-size: 11pt; margin-bottom: 80px; }
        @media print { body { background: none; margin: 0; padding: 0; } .page-a4 { box-shadow: none; margin: 0; padding: 0; width: auto; min-height: auto; } th, td { border: 1pt solid #000 !important; } th { background-color: #e6e6e6 !important; -webkit-print-color-adjust: exact; } }
    </style>
</head>
<body>
    <div class="page-a4">
        <div class="company-header">
            <div class="company-info">
                <h3>CÔNG TY TNHH ĐẦU TƯ TÀI CHÍNH CDPAWN</h3>
                <p><strong>Chi nhánh:</strong> ${activeStore?.name || "Tất cả chi nhánh"}</p>
                <p><strong>Ngày xuất:</strong> ${new Date().toLocaleDateString("vi-VN")}</p>
            </div>
        </div>

        <div class="report-title">
            <h1>${getTitle().toUpperCase()} - Phân Loại: ${tabName.toUpperCase()}</h1>
            ${startDate && endDate ? `<p>Kỳ báo cáo: Từ ngày ${formatDateDisplay(startDate)} đến ngày ${formatDateDisplay(endDate)}</p>` : ""}
        </div>

        <div class="section-title">DANH SÁCH HỢP ĐỒNG SẢN PHẨM</div>
        <table>
            <thead>
                <tr>
                    <th width="5%">STT</th>
                    <th width="12%">Mã HĐ</th>
                    <th width="20%">Khách Hàng</th>
                    ${activeTab === "pawn" ? `<th width="20%">Tài Sản</th>` : activeTab === "installment" ? `<th width="12%">Ngày Vay</th>` : `<th width="12%">Ngày Vay</th>`}
                    ${activeTab === "pawn" ? `<th width="12%">Ngày Vay</th><th width="15%">Tiền Vay (VNĐ)</th><th width="12%">Lãi Suất</th>` : activeTab === "unsecured" ? `<th width="15%">Tiền Vay (VNĐ)</th><th width="10%">Kỳ Hạn</th><th width="12%">Lãi Suất</th>` : `<th width="15%">Tổng Góp (VNĐ)</th><th width="12%">Kỳ Góp (VNĐ)</th><th width="10%">Đã Đóng</th>`}
                    <th width="10%">Trạng Thái</th>
                </tr>
            </thead>
            <tbody>
                ${tableRowsHTML}
            </tbody>
        </table>

        <div class="signature-section">
            <div class="signature-box"><div class="role">NGƯỜI LẬP BIỂU</div><div class="note">(Ký, ghi rõ họ tên)</div></div>
            <div class="signature-box"><div class="role">KẾ TOÁN TRƯỜNG</div><div class="note">(Ký, ghi rõ họ tên)</div></div>
            <div class="signature-box"><div class="role">GIÁM ĐỐC</div><div class="note">(Ký, đóng dấu, họ tên)</div></div>
        </div>
    </div>
<script>window.onload = function() { setTimeout(function() { window.focus(); window.print(); }, 300); };</script>
</body>
</html>`;

    const printWin = window.open("", "_blank");
    if (printWin) {
      printWin.document.open();
      printWin.document.write(htmlContent);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => { try { printWin.print(); } catch (e) {} }, 400);
    }
  };

  const handleExportExcel = () => {
    let excelRowsHTML = "";

    if (currentList.length === 0) {
      excelRowsHTML = `<tr><td colspan="8" class="text-center" style="padding:10px;">Không có dữ liệu hợp đồng.</td></tr>`;
    } else if (activeTab === "pawn") {
      excelRowsHTML = currentList.map((item, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center font-bold" style="mso-number-format:'\\@';">${item.code}</td>
          <td class="font-bold">${item.customer?.full_name || "—"}</td>
          <td>${item.commodity_name || "—"}</td>
          <td class="text-center" style="mso-number-format:'\\@';">${new Date(item.start_date).toLocaleDateString("vi-VN")}</td>
          <td class="text-right font-bold" style="mso-number-format:'#,##0';">${Number(item.loan_amount)}</td>
          <td class="text-center">${formatInterestRateText(item.interest_rate, item.interest_type)}</td>
          <td class="text-center">${getStatusText(item.status)}</td>
        </tr>
      `).join("");
    } else if (activeTab === "unsecured") {
      excelRowsHTML = currentList.map((item, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center font-bold" style="mso-number-format:'\\@';">${item.code}</td>
          <td class="font-bold">${item.customer?.full_name || "—"}</td>
          <td class="text-center" style="mso-number-format:'\\@';">${new Date(item.start_date).toLocaleDateString("vi-VN")}</td>
          <td class="text-right font-bold" style="mso-number-format:'#,##0';">${Number(item.loan_amount)}</td>
          <td class="text-center">${item.loan_term} ngày</td>
          <td class="text-center">${formatInterestRateText(item.interest_rate, item.interest_type)}</td>
          <td class="text-center">${getStatusText(item.status)}</td>
        </tr>
      `).join("");
    } else {
      excelRowsHTML = currentList.map((item, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center font-bold" style="mso-number-format:'\\@';">${item.code}</td>
          <td class="font-bold">${item.customer?.full_name || "—"}</td>
          <td class="text-center" style="mso-number-format:'\\@';">${new Date(item.start_date).toLocaleDateString("vi-VN")}</td>
          <td class="text-right font-bold" style="mso-number-format:'#,##0';">${Number(item.total_amount)}</td>
          <td class="text-right" style="mso-number-format:'#,##0';">${Number(item.installment_amount)}</td>
          <td class="text-center">${item.paid_periods}/${item.total_periods} kỳ</td>
          <td class="text-center">${getStatusText(item.status)}</td>
        </tr>
      `).join("");
    }

    let headerCols = activeTab === "pawn"
      ? `<th>STT</th><th>Mã HĐ</th><th>Khách Hàng</th><th>Tài Sản</th><th>Ngày Vay</th><th>Tiền Vay (VNĐ)</th><th>Lãi Suất</th><th>Trạng Thái</th>`
      : activeTab === "unsecured"
      ? `<th>STT</th><th>Mã HĐ</th><th>Khách Hàng</th><th>Ngày Vay</th><th>Tiền Vay (VNĐ)</th><th>Kỳ Hạn</th><th>Lãi Suất</th><th>Trạng Thái</th>`
      : `<th>STT</th><th>Mã HĐ</th><th>Khách Hàng</th><th>Ngày Vay</th><th>Tổng Góp (VNĐ)</th><th>Kỳ Góp (VNĐ)</th><th>Đã Đóng</th><th>Trạng Thái</th>`;

    let excelHTML = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>${getTitle()}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 13px; }
        .excel-table { border-collapse: collapse; width: 100%; }
        .excel-table td, .excel-table th { padding: 6px 8px; border: 1px solid #000; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .report-title { font-size: 18px; font-weight: bold; }
        .grid-header th { background-color: #d9d9d9; font-weight: bold; }
    </style>
</head>
<body>
    <table class="excel-table">
        <tr><td colspan="8" class="font-bold">CÔNG TY TNHH ĐẦU TƯ TÀI CHÍNH CDPAWN</td></tr>
        <tr><td colspan="8">Chi nhánh: ${activeStore?.name || "Tất cả chi nhánh"}</td></tr>
        <tr><td colspan="8">Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}</td></tr>
        <tr><td colspan="8"></td></tr>
        <tr><td colspan="8" class="text-center report-title">${getTitle().toUpperCase()} - ${tabName.toUpperCase()}</td></tr>
        ${startDate && endDate ? `<tr><td colspan="8" class="text-center font-italic">Từ ngày ${formatDateDisplay(startDate)} đến ngày ${formatDateDisplay(endDate)}</td></tr>` : ""}
        <tr><td colspan="8"></td></tr>
        <tr class="grid-header">
            ${headerCols}
        </tr>
        ${excelRowsHTML}
        <tr><td colspan="8" style="height: 30px;"></td></tr>
        <tr><td colspan="3" class="text-center font-bold">NGƯỜI LẬP BIỂU</td><td colspan="3" class="text-center font-bold">KẾ TOÁN TRƯỜNG</td><td colspan="2" class="text-center font-bold">GIÁM ĐỐC</td></tr>
    </table>
</body>
</html>`;

    const blob = new Blob([excelHTML], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BaoCao_${category}_${activeTab}_${startDate || "full"}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 p-2 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            {getTitle()}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{getSubtext()}</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error bg-red-500/10 border-red-500/20 text-red-200 shadow-lg rounded-2xl flex gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-slate-50 p-1 border border-slate-900 rounded-2xl w-fit flex gap-1">
        <button
          onClick={() => setActiveTab("pawn")}
          className={`tab tab-lg rounded-xl font-bold px-8 text-xs transition-all duration-200 ${
            activeTab === "pawn"
              ? "bg-amber-500 text-slate-950 shadow-lg"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Cầm Đồ
        </button>

        {showUnsecured && (
          <button
            onClick={() => setActiveTab("unsecured")}
            className={`tab tab-lg rounded-xl font-bold px-8 text-xs transition-all duration-200 ${
              activeTab === "unsecured"
                ? "bg-amber-500 text-slate-950 shadow-lg"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Tín Chấp
          </button>
        )}

        {showInstallment && (
          <button
            onClick={() => setActiveTab("installment")}
            className={`tab tab-lg rounded-xl font-bold px-8 text-xs transition-all duration-200 ${
              activeTab === "installment"
                ? "bg-amber-500 text-slate-950 shadow-lg"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Trả Góp
          </button>
        )}
      </div>

      {/* Filters & Export Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm mã hợp đồng hoặc tên khách hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered w-full rounded-2xl bg-slate-50 border-slate-200/80 pl-12 text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(s, e) => {
              setStartDate(s);
              setEndDate(e);
            }}
          />

          <button
            onClick={fetchData}
            className="btn btn-ghost btn-sm rounded-xl text-slate-500 hover:bg-slate-50 flex items-center gap-1.5"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-500" : ""}`} />
            Làm Mới
          </button>

          {/* Dropdown Xuất Báo Cáo */}
          <div className="dropdown dropdown-end border-l border-slate-200 pl-3">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-sm bg-blue-900 hover:bg-blue-950 text-white rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Báo Cáo</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow-xl bg-white border border-slate-200 rounded-2xl w-48 z-[50] mt-1 space-y-1"
            >
              <li>
                <button
                  type="button"
                  onClick={handleExportHTML}
                  className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100/80 rounded-xl py-2"
                >
                  <Printer className="w-4 h-4 text-blue-900 shrink-0" />
                  <span>In / Xuất PDF</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100/80 rounded-xl py-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Xuất Excel</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* List content */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 backdrop-blur-lg">
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-amber-500"></span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === "pawn" && (
              <table className="table w-full text-slate-600">
                <thead>
                  <tr className="border-b border-slate-200/80/60 text-slate-500">
                    <th>STT</th>
                    <th>Mã HĐ</th>
                    <th>Khách Hàng</th>
                    <th>Tên Hàng / Tài Sản</th>
                    <th>Ngày Vay</th>
                    <th>Tiền Cầm / Vay</th>
                    <th>Lãi Suất</th>
                    <th>Trạng Thái</th>
                    <th className="text-right">Chức Năng</th>
                  </tr>
                </thead>
                <tbody>
                  {currentList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-slate-500">
                        Không có dữ liệu hợp đồng cầm đồ nào.
                      </td>
                    </tr>
                  ) : (
                    currentList.map((item, idx) => (
                      <tr key={item.id} className="border-b border-slate-200/40 hover:bg-slate-50/50 text-xs">
                        <td>{idx + 1}</td>
                        <td className="font-bold text-amber-600">{item.code}</td>
                        <td className="font-semibold text-slate-800">{item.customer?.full_name || "—"}</td>
                        <td>{item.commodity_name || "—"}</td>
                        <td>{new Date(item.start_date).toLocaleDateString("vi-VN")}</td>
                        <td className="font-bold">{formatCurrency(item.loan_amount)}</td>
                        <td>{formatInterestRateText(item.interest_rate, item.interest_type)}</td>
                        <td>
                          <span
                            className={`badge badge-sm uppercase ${
                              item.status === "active"
                                ? "badge-success"
                                : item.status === "overdue"
                                ? "badge-error"
                                : item.status === "debt"
                                ? "badge-warning"
                                : item.status === "closed"
                                ? "badge-neutral"
                                : item.status === "liquidated"
                                ? "badge-info"
                                : "badge-ghost"
                            }`}
                          >
                            {getStatusText(item.status)}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {category === "waiting-liquidation" && item.status !== "liquidated" && (
                              <button
                                onClick={() => {
                                  setLiquidateContract(item);
                                  setIsLiquidateOpen(true);
                                }}
                                className="btn btn-error btn-xs text-white rounded-lg gap-1 font-bold"
                              >
                                <AlertOctagon className="w-3.5 h-3.5" />
                                Thanh Lý
                              </button>
                            )}
                            <Link
                              to={`/contracts/pawn/${item.id}`}
                              className="btn btn-ghost btn-xs text-amber-500 hover:bg-slate-50 rounded-lg gap-1"
                            >
                              Chi Tiết <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === "unsecured" && (
              <table className="table w-full text-slate-600">
                <thead>
                  <tr className="border-b border-slate-200/80/60 text-slate-500">
                    <th>STT</th>
                    <th>Mã HĐ</th>
                    <th>Khách Hàng</th>
                    <th>Ngày Vay</th>
                    <th>Số Tiền Vay</th>
                    <th>Kỳ Hạn</th>
                    <th>Lãi Suất</th>
                    <th>Trạng Thái</th>
                    <th className="text-right">Chức Năng</th>
                  </tr>
                </thead>
                <tbody>
                  {currentList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-slate-500">
                        Không có dữ liệu hợp đồng tín chấp nào.
                      </td>
                    </tr>
                  ) : (
                    currentList.map((item, idx) => (
                      <tr key={item.id} className="border-b border-slate-200/40 hover:bg-slate-50/50 text-xs">
                        <td>{idx + 1}</td>
                        <td className="font-bold text-purple-400">{item.code}</td>
                        <td className="font-semibold text-slate-800">{item.customer?.full_name || "—"}</td>
                        <td>{new Date(item.start_date).toLocaleDateString("vi-VN")}</td>
                        <td className="font-bold">{formatCurrency(item.loan_amount)}</td>
                        <td>{item.loan_term} ngày</td>
                        <td>{formatInterestRateText(item.interest_rate, item.interest_type)}</td>
                        <td>
                          <span
                            className={`badge badge-sm uppercase ${
                              item.status === "active"
                                ? "badge-success"
                                : item.status === "overdue"
                                ? "badge-error"
                                : item.status === "debt"
                                ? "badge-warning"
                                : item.status === "closed"
                                ? "badge-neutral"
                                : "badge-ghost"
                            }`}
                          >
                            {getStatusText(item.status)}
                          </span>
                        </td>
                        <td className="text-right">
                          <Link
                            to={`/contracts/unsecured/${item.id}`}
                            className="btn btn-ghost btn-xs text-purple-400 hover:bg-slate-50 rounded-lg gap-1"
                          >
                            Chi Tiết <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === "installment" && (
              <table className="table w-full text-slate-600">
                <thead>
                  <tr className="border-b border-slate-200/80/60 text-slate-500">
                    <th>STT</th>
                    <th>Mã HĐ</th>
                    <th>Khách Hàng</th>
                    <th>Ngày Vay</th>
                    <th>Tổng Tiền Góp</th>
                    <th>Số Tiền/Kỳ</th>
                    <th>Đã Đóng</th>
                    <th>Trạng Thái</th>
                    <th className="text-right">Chức Năng</th>
                  </tr>
                </thead>
                <tbody>
                  {currentList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-slate-500">
                        Không có dữ liệu hợp đồng trả góp nào.
                      </td>
                    </tr>
                  ) : (
                    currentList.map((item, idx) => (
                      <tr key={item.id} className="border-b border-slate-200/40 hover:bg-slate-50/50 text-xs">
                        <td>{idx + 1}</td>
                        <td className="font-bold text-blue-400">{item.code}</td>
                        <td className="font-semibold text-slate-800">{item.customer?.full_name || "—"}</td>
                        <td>{new Date(item.start_date).toLocaleDateString("vi-VN")}</td>
                        <td className="font-bold">{formatCurrency(item.total_amount)}</td>
                        <td>{formatCurrency(item.installment_amount)}</td>
                        <td>
                          {item.paid_periods}/{item.total_periods} kỳ
                        </td>
                        <td>
                          <span
                            className={`badge badge-sm uppercase ${
                              item.status === "active"
                                ? "badge-success"
                                : item.status === "overdue"
                                ? "badge-error"
                                : item.status === "debt"
                                ? "badge-warning"
                                : item.status === "closed"
                                ? "badge-neutral"
                                : "badge-ghost"
                            }`}
                          >
                            {getStatusText(item.status)}
                          </span>
                        </td>
                        <td className="text-right">
                          <Link
                            to={`/contracts/installment/${item.id}`}
                            className="btn btn-ghost btn-xs text-blue-400 hover:bg-slate-50 rounded-lg gap-1"
                          >
                            Chi Tiết <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modal Liquidate */}
      {isLiquidateOpen && liquidateContract && (
        <div className="modal modal-open">
          <div className="modal-box bg-slate-50 border border-slate-200/80 rounded-3xl p-6 text-slate-800 max-w-lg shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200/80">
              <h3 className="text-lg font-extrabold text-red-500 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5" />
                Thanh Lý Tài Sản - {liquidateContract.code}
              </h3>
              <button
                type="button"
                onClick={() => setIsLiquidateOpen(false)}
                className="btn btn-ghost btn-sm btn-circle text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLiquidateSubmit} className="space-y-4 mt-4 text-xs">
              <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl space-y-1">
                <p>
                  <strong>Khách hàng:</strong> {liquidateContract.customer?.full_name}
                </p>
                <p>
                  <strong>Tài sản cầm cố:</strong> {liquidateContract.commodity_name || "—"}
                </p>
                <p>
                  <strong>Tiền cho vay:</strong> {formatCurrency(liquidateContract.loan_amount)}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-semibold">Giá Thu Hồi / Giá Thanh Lý (VNĐ) *</label>
                <input
                  type="number"
                  required
                  value={liquidationPrice}
                  onChange={(e) => setLiquidationPrice(e.target.value)}
                  placeholder="Nhập số tiền thu được từ thanh lý..."
                  className="input input-bordered w-full rounded-2xl bg-white border-slate-200 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-semibold">Người Mua / Khách Mua Hàng</label>
                <input
                  type="text"
                  value={liquidationBuyer}
                  onChange={(e) => setLiquidationBuyer(e.target.value)}
                  placeholder="Tên khách hàng/cửa hàng mua lại tài sản..."
                  className="input input-bordered w-full rounded-2xl bg-white border-slate-200 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-semibold">Ghi Chú Chi Tiết</label>
                <textarea
                  rows={2}
                  value={liquidationNotes}
                  onChange={(e) => setLiquidationNotes(e.target.value)}
                  placeholder="Lý do thanh lý, tình trạng tài sản..."
                  className="textarea textarea-bordered w-full rounded-2xl bg-white border-slate-200 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setIsLiquidateOpen(false)}
                  className="btn btn-ghost rounded-2xl text-slate-500"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold px-6 border-none"
                >
                  {loading ? <span className="loading loading-spinner loading-xs"></span> : "Xác Nhận Thanh Lý"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
