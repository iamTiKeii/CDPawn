import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ChevronsUpDown,
  AlertCircle,
  RefreshCw,
  Download,
  Printer,
  ChevronDown,
  FileSpreadsheet,
  Building2,
  Store,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { DateRangePicker } from "../../components/shared/DateRangePicker";

export const ShopsSummaryReport: React.FC = () => {
  const { activeStore } = useAuth();
  const todayStr = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination states
  const [limit, setLimit] = useState(50);
  const [page, setPage] = useState(1);

  // Sorting states
  const [sortField, setSortField] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`/api/reports/overview?startDate=${startDate}&endDate=${endDate}`);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Lỗi khi tải báo cáo chuỗi cửa hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeStore, startDate, endDate]);

  const formatNumber = (val: any) => {
    const num = Number(val || 0);
    return num === 0 ? "0" : num.toLocaleString("vi-VN");
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Sort logic
  const sortedData = [...data].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = (bVal || "").toLowerCase();
    } else {
      aVal = Number(aVal || 0);
      bVal = Number(bVal || 0);
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination calculations
  const totalRecords = sortedData.length;
  const totalPages = Math.ceil(totalRecords / limit);
  const indexOfLastRecord = page * limit;
  const indexOfFirstRecord = indexOfLastRecord - limit;
  const currentRecords = sortedData.slice(indexOfFirstRecord, indexOfLastRecord);

  // Totals calculations (across the entire dataset)
  const totalCash = data.reduce((sum, item) => sum + Number(item.current_cash || 0), 0);
  const totalInvestment = data.reduce((sum, item) => sum + Number(item.investment_capital || 0), 0);
  const totalPawn = data.reduce((sum, item) => sum + Number(item.pawn_lending || 0), 0);
  const totalUnsecured = data.reduce((sum, item) => sum + Number(item.unsecured_lending || 0), 0);
  const totalInstallment = data.reduce((sum, item) => sum + Number(item.installment_lending || 0), 0);
  const totalExpectedInterest = data.reduce((sum, item) => sum + Number(item.expected_interest || 0), 0);
  const totalCollectedInterest = data.reduce((sum, item) => sum + Number(item.collected_interest || 0), 0);

  const totalLending = totalPawn + totalUnsecured + totalInstallment;

  const handleExportHTML = () => {
    const tableRowsHTML = data.length === 0
      ? `<tr><td colSpan="9" class="text-center" style="padding: 15px; color:#6b7280;">Không có dữ liệu cửa hàng.</td></tr>`
      : data.map((item, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="font-bold">${item.name}</td>
          <td class="text-right">${formatNumber(item.current_cash)}</td>
          <td class="text-right">${formatNumber(item.investment_capital)}</td>
          <td class="text-right">${formatNumber(item.pawn_lending)}</td>
          <td class="text-right">${formatNumber(item.unsecured_lending)}</td>
          <td class="text-right">${formatNumber(item.installment_lending)}</td>
          <td class="text-right">${formatNumber(item.expected_interest)}</td>
          <td class="text-right font-bold">${formatNumber(item.collected_interest)}</td>
        </tr>
      `).join("");

    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Báo Cáo Tổng Quát Các Cửa Hàng - Bản In</title>
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
                <p><strong>Ngày xuất:</strong> ${new Date().toLocaleDateString("vi-VN")}</p>
            </div>
        </div>

        <div class="report-title">
            <h1>BÁO CÁO TỔNG QUÁT CÁC CỬA HÀNG</h1>
            <p>Kỳ báo cáo: Từ ngày ${formatDateDisplay(startDate)} đến ngày ${formatDateDisplay(endDate)}</p>
        </div>

        <div class="section-title">DANH SÁCH CHI NHÁNH & SỐ LIỆU TÀI CHÍNH</div>
        <table>
            <thead>
                <tr>
                    <th width="5%">#</th>
                    <th width="20%">Tên cửa hàng</th>
                    <th width="12%">Quỹ tiền mặt</th>
                    <th width="12%">Vốn đầu tư</th>
                    <th width="12%">Cho vay Cầm Đồ</th>
                    <th width="12%">Cho Tín Chấp</th>
                    <th width="12%">Cho vay Trả Góp</th>
                    <th width="12%">Lãi dự kiến</th>
                    <th width="12%">Lãi đã thu</th>
                </tr>
            </thead>
            <tbody>
                ${tableRowsHTML}
                ${data.length > 0 ? `
                <tr class="font-bold">
                    <td class="text-center">${data.length + 1}</td>
                    <td>Tổng Cửa Hàng</td>
                    <td class="text-right">${formatNumber(totalCash)}</td>
                    <td class="text-right">${formatNumber(totalInvestment)}</td>
                    <td class="text-right">${formatNumber(totalPawn)}</td>
                    <td class="text-right">${formatNumber(totalUnsecured)}</td>
                    <td class="text-right">${formatNumber(totalInstallment)}</td>
                    <td class="text-right">${formatNumber(totalExpectedInterest)}</td>
                    <td class="text-right">${formatNumber(totalCollectedInterest)}</td>
                </tr>` : ""}
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
    let excelRowsHTML = data.length === 0
      ? `<tr><td colspan="9" class="text-center" style="padding:10px;">Không có dữ liệu.</td></tr>`
      : data.map((item, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="font-bold">${item.name}</td>
          <td class="text-right" style="mso-number-format:'#,##0';">${Number(item.current_cash || 0)}</td>
          <td class="text-right" style="mso-number-format:'#,##0';">${Number(item.investment_capital || 0)}</td>
          <td class="text-right" style="mso-number-format:'#,##0';">${Number(item.pawn_lending || 0)}</td>
          <td class="text-right" style="mso-number-format:'#,##0';">${Number(item.unsecured_lending || 0)}</td>
          <td class="text-right" style="mso-number-format:'#,##0';">${Number(item.installment_lending || 0)}</td>
          <td class="text-right" style="mso-number-format:'#,##0';">${Number(item.expected_interest || 0)}</td>
          <td class="text-right font-bold" style="mso-number-format:'#,##0';">${Number(item.collected_interest || 0)}</td>
        </tr>
      `).join("");

    let excelHTML = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Báo Cáo Tổng Quát Các Cửa Hàng</title>
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
        <tr><td colspan="9" class="font-bold">CÔNG TY TNHH ĐẦU TƯ TÀI CHÍNH CDPAWN</td></tr>
        <tr><td colspan="9">Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}</td></tr>
        <tr><td colspan="9"></td></tr>
        <tr><td colspan="9" class="text-center report-title">BÁO CÁO TỔNG QUÁT CÁC CỬA HÀNG</td></tr>
        <tr><td colspan="9" class="text-center font-italic">Từ ngày ${formatDateDisplay(startDate)} đến ngày ${formatDateDisplay(endDate)}</td></tr>
        <tr><td colspan="9"></td></tr>
        <tr class="grid-header">
            <th>#</th><th>Tên cửa hàng</th><th>Quỹ tiền mặt (VNĐ)</th><th>Vốn đầu tư (VNĐ)</th><th>Cho vay Cầm Đồ (VNĐ)</th><th>Cho Tín Chấp (VNĐ)</th><th>Cho vay Trả Góp (VNĐ)</th><th>Lãi dự kiến (VNĐ)</th><th>Lãi đã thu (VNĐ)</th>
        </tr>
        ${excelRowsHTML}
        ${data.length > 0 ? `
        <tr class="font-bold">
            <td class="text-center">${data.length + 1}</td>
            <td>Tổng Cửa Hàng</td>
            <td class="text-right" style="mso-number-format:'#,##0';">${Number(totalCash)}</td>
            <td class="text-right" style="mso-number-format:'#,##0';">${Number(totalInvestment)}</td>
            <td class="text-right" style="mso-number-format:'#,##0';">${Number(totalPawn)}</td>
            <td class="text-right" style="mso-number-format:'#,##0';">${Number(totalUnsecured)}</td>
            <td class="text-right" style="mso-number-format:'#,##0';">${Number(totalInstallment)}</td>
            <td class="text-right" style="mso-number-format:'#,##0';">${Number(totalExpectedInterest)}</td>
            <td class="text-right" style="mso-number-format:'#,##0';">${Number(totalCollectedInterest)}</td>
        </tr>` : ""}
        <tr><td colspan="9" style="height: 30px;"></td></tr>
        <tr><td colspan="3" class="text-center font-bold">NGƯỜI LẬP BIỂU</td><td colspan="3" class="text-center font-bold">KẾ TOÁN TRƯỜNG</td><td colspan="3" class="text-center font-bold">GIÁM ĐỐC</td></tr>
    </table>
</body>
</html>`;

    const blob = new Blob([excelHTML], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BaoCao_TongQuatCuaHang_${startDate}_${endDate}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in max-w-7xl mx-auto font-sans pb-10">
      
      {/* ── Title Banner & Filter Actions ── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
              BÁO CÁO TỔNG QUÁT CHUỖI CỬA HÀNG
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Báo cáo tổng hợp số liệu tài chính, quỹ tiền mặt và dư nợ giữa các chi nhánh</span>
              <span>•</span>
              <span>Tổng số cửa hàng: <strong className="text-slate-700">{data.length}</strong></span>
            </p>
          </div>
        </div>

        {/* Date Filter & Export Actions */}
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
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="btn btn-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border-none rounded-xl font-medium px-4 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin text-amber-500" : ""}`} />
            <span>Làm Mới</span>
          </button>

          {/* Dropdown Xuất Báo Cáo */}
          <div className="dropdown dropdown-end border-l border-slate-200 pl-3">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-sm bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white rounded-xl flex items-center gap-1.5 shadow-sm border-none font-semibold px-4"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Báo Cáo</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow-xl bg-white border border-slate-200 rounded-2xl w-48 z-[50] mt-2 space-y-1"
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

      {error && (
        <div className="alert alert-error text-xs p-3 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 flex items-start gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ── 5 TOP SUMMARY METRIC CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Quỹ tiền mặt */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">QUỸ TIỀN MẶT</span>
          <div className="mt-2">
            <h3 className="text-xl font-black text-purple-700 tracking-tight">
              {formatNumber(totalCash)} <span className="text-xs text-purple-500">đ</span>
            </h3>
          </div>
        </div>

        {/* Vốn đầu tư */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VỐN ĐẦU TƯ</span>
          <div className="mt-2">
            <h3 className="text-xl font-black text-amber-600 tracking-tight">
              {formatNumber(totalInvestment)} <span className="text-xs text-amber-500">đ</span>
            </h3>
          </div>
        </div>

        {/* Tổng Dư Nợ Cho Vay */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TỔNG CHO VAY</span>
          <div className="mt-2">
            <h3 className="text-xl font-black text-blue-600 tracking-tight">
              {formatNumber(totalLending)} <span className="text-xs text-blue-400">đ</span>
            </h3>
          </div>
        </div>

        {/* Lãi Dự Kiến */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LÃI DỰ KIẾN</span>
          <div className="mt-2">
            <h3 className="text-xl font-black text-indigo-600 tracking-tight">
              {formatNumber(totalExpectedInterest)} <span className="text-xs text-indigo-400">đ</span>
            </h3>
          </div>
        </div>

        {/* Lãi Đã Thu */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LÃI ĐÃ THU</span>
          <div className="mt-2">
            <h3 className="text-xl font-black text-emerald-600 tracking-tight">
              {formatNumber(totalCollectedInterest)} <span className="text-xs text-emerald-500">đ</span>
            </h3>
          </div>
        </div>
      </div>

      {/* ── MAIN DATA TABLE CARD ── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
            <span className="loading loading-spinner loading-lg text-amber-500"></span>
            <span className="text-xs text-slate-500 font-medium">Đang tải dữ liệu báo cáo cửa hàng...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full text-slate-700">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase">
                  <th className="w-12 text-center py-3.5">#</th>
                  
                  {/* Sortable Store Name */}
                  <th 
                    onClick={() => handleSort("name")}
                    className="cursor-pointer hover:bg-slate-100/50 py-3.5"
                  >
                    <div className="flex items-center gap-1">
                      <span>Tên cửa hàng</span>
                      <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>

                  {/* Sortable Cash */}
                  <th 
                    onClick={() => handleSort("current_cash")}
                    className="cursor-pointer hover:bg-slate-100/50 py-3.5 text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Quỹ tiền mặt</span>
                      <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>

                  {/* Sortable Capital */}
                  <th 
                    onClick={() => handleSort("investment_capital")}
                    className="cursor-pointer hover:bg-slate-100/50 py-3.5 text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Vốn đầu tư</span>
                      <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>

                  {/* Sortable Pawn Lending */}
                  <th 
                    onClick={() => handleSort("pawn_lending")}
                    className="cursor-pointer hover:bg-slate-100/50 py-3.5 text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Cho vay Cầm Đồ</span>
                      <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>

                  {/* Sortable Unsecured Lending */}
                  <th 
                    onClick={() => handleSort("unsecured_lending")}
                    className="cursor-pointer hover:bg-slate-100/50 py-3.5 text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Cho Tín Chấp</span>
                      <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>

                  {/* Sortable Installment Lending */}
                  <th 
                    onClick={() => handleSort("installment_lending")}
                    className="cursor-pointer hover:bg-slate-100/50 py-3.5 text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Cho vay Trả Góp</span>
                      <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>

                  <th className="py-3.5 text-right">Lãi dự kiến</th>
                  <th className="py-3.5 text-right pr-4">Lãi đã thu</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 bg-white text-slate-400 text-xs">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  <>
                    {currentRecords.map((item, index) => {
                      const displayIndex = indexOfFirstRecord + index + 1;
                      return (
                        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors text-xs text-slate-700">
                          <td className="text-center font-medium text-slate-400 py-3.5">{displayIndex}</td>
                          <td className="font-bold text-slate-900 flex items-center gap-2 py-3.5">
                            <Store className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>{item.name}</span>
                          </td>
                          <td className="text-right font-bold text-purple-700">{formatNumber(item.current_cash)}</td>
                          <td className="text-right font-semibold text-amber-600">{formatNumber(item.investment_capital)}</td>
                          <td className="text-right font-semibold text-blue-600">{formatNumber(item.pawn_lending)}</td>
                          <td className="text-right font-semibold text-indigo-600">{formatNumber(item.unsecured_lending)}</td>
                          <td className="text-right font-semibold text-teal-600">{formatNumber(item.installment_lending)}</td>
                          <td className="text-right font-bold text-slate-700">{formatNumber(item.expected_interest)}</td>
                          <td className="text-right font-bold text-emerald-600 pr-4">{formatNumber(item.collected_interest)}</td>
                        </tr>
                      );
                    })}

                    {/* Bold Total Row styled with red text at the bottom */}
                    <tr className="bg-slate-50/80 hover:bg-slate-100/80 font-bold text-rose-600 text-xs border-t-2 border-slate-200">
                      <td className="text-center py-4">{totalRecords + 1}</td>
                      <td className="font-extrabold text-rose-600 uppercase">Tổng cộng</td>
                      <td className="text-right text-rose-600 font-extrabold">{formatNumber(totalCash)}</td>
                      <td className="text-right text-rose-600 font-extrabold">{formatNumber(totalInvestment)}</td>
                      <td className="text-right text-rose-600 font-extrabold">{formatNumber(totalPawn)}</td>
                      <td className="text-right text-rose-600 font-extrabold">{formatNumber(totalUnsecured)}</td>
                      <td className="text-right text-rose-600 font-extrabold">{formatNumber(totalInstallment)}</td>
                      <td className="text-right text-rose-600 font-extrabold">{formatNumber(totalExpectedInterest)}</td>
                      <td className="text-right text-rose-600 font-extrabold pr-4">{formatNumber(totalCollectedInterest)}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/80">
          <div className="text-xs text-slate-500 font-medium">
            Hiển thị {currentRecords.length}/{totalRecords} cửa hàng
          </div>

          <div className="flex items-center gap-4">
            {/* Page Limit Selector */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Mỗi trang:</span>
              <select 
                value={limit} 
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} 
                className="select select-bordered select-xs bg-white text-slate-800 border-slate-200 focus:outline-none rounded-lg h-[28px] min-h-[28px]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="join gap-1.5">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="btn btn-outline border-slate-200 hover:bg-slate-100 btn-xs rounded-lg px-2.5 text-slate-600 disabled:bg-slate-50 disabled:text-slate-300"
                  type="button"
                >
                  Trước
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`btn btn-xs rounded-lg px-2.5 ${
                      page === i + 1 
                        ? "btn-primary bg-emerald-600 border-none text-white hover:bg-emerald-700" 
                        : "btn-outline border-slate-200 hover:bg-slate-100 text-slate-600 bg-white"
                    }`}
                    type="button"
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="btn btn-outline border-slate-200 hover:bg-slate-100 btn-xs rounded-lg px-2.5 text-slate-600 disabled:bg-slate-50 disabled:text-slate-300"
                  type="button"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
