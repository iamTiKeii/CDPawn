import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Calendar,
  RefreshCw,
  AlertCircle,
  DollarSign,
  Download,
  Printer,
  ChevronDown,
  FileSpreadsheet,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { DateRangePicker } from "../../components/shared/DateRangePicker";

export const InterestDetailReport: React.FC = () => {
  const { activeStore } = useAuth();
  
  const todayStr = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [year, setYear] = useState(new Date().getFullYear());

  const [chartData, setChartData] = useState<any[]>([]);
  const [details, setDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    if (!activeStore) return;
    try {
      setLoading(true);
      setError("");

      // 1. Fetch Monthly Summary Chart Data
      const summaryRes = await axios.get(`/api/reports/interest?type=summary&year=${year}`);
      setChartData(summaryRes.data);

      // 2. Fetch Detail Ledger with optional date range
      const detailsRes = await axios.get(
        `/api/reports/interest?startDate=${startDate}&endDate=${endDate}`
      );
      setDetails(detailsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Lỗi khi tải báo cáo chi tiết tiền lãi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeStore, year, startDate, endDate]);

  const formatCurrency = (val: any) => {
    return Number(val || 0).toLocaleString("vi-VN") + " ₫";
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

  // Find max value in chartData to scale bars
  const maxMonthValue = chartData.reduce((max, item) => Math.max(max, Number(item.amount)), 1);

  const totalYearInterest = chartData.reduce((sum, item) => sum + Number(item.amount), 0);

  const handleExportHTML = () => {
    const tableRowsHTML = details.length === 0
      ? `<tr><td colSpan="9" class="text-center" style="padding: 15px; color:#6b7280;">Không tìm thấy lịch sử đóng lãi.</td></tr>`
      : details.map((d) => `
        <tr>
          <td class="text-center">${new Date(d.transaction_date).toLocaleDateString("vi-VN")}</td>
          <td class="text-center font-bold">${d.contract_code}</td>
          <td class="text-center">${d.type?.includes("Cầm đồ") ? "Cầm đồ" : "Tín chấp"}</td>
          <td class="font-bold">${d.customer_name}</td>
          <td>${d.commodity_name || "—"}</td>
          <td class="text-right">${formatNumberOnly(d.loan_amount)}</td>
          <td class="text-right font-bold">${formatNumberOnly(d.interest_amount)}</td>
          <td class="text-right">${formatNumberOnly(d.other_amount)}</td>
          <td class="text-right font-bold">${formatNumberOnly(d.total_interest)}</td>
        </tr>
      `).join("");

    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Báo Cáo Chi Tiết Tiền Lãi - Bản In</title>
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
            <h1>BÁO CÁO CHI TIẾT TIỀN LÃI</h1>
            <p>Kỳ báo cáo: Từ ngày ${formatDateDisplay(startDate)} đến ngày ${formatDateDisplay(endDate)} (Năm ${year})</p>
        </div>

        <div class="section-title">CHI TIẾT NHẬT KÝ ĐÓNG TIỀN LÃI</div>
        <table>
            <thead>
                <tr>
                    <th width="12%">Ngày Đóng</th>
                    <th width="10%">Mã HĐ</th>
                    <th width="10%">Phân Loại</th>
                    <th width="15%">Khách Hàng</th>
                    <th width="15%">Tài Sản</th>
                    <th width="10%">Tiền Vay</th>
                    <th width="10%">Tiền Lãi</th>
                    <th width="8%">Khác/Phạt</th>
                    <th width="10%">Tổng Thực Thu</th>
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
    let excelRowsHTML = details.length === 0
      ? `<tr><td colspan="9" class="text-center" style="padding:10px;">Không có dữ liệu đóng lãi.</td></tr>`
      : details.map((d) => `
        <tr>
          <td class="text-center" style="mso-number-format:'\\@';">${new Date(d.transaction_date).toLocaleDateString("vi-VN")}</td>
          <td class="text-center font-bold" style="mso-number-format:'\\@';">${d.contract_code}</td>
          <td class="text-center">${d.type?.includes("Cầm đồ") ? "Cầm đồ" : "Tín chấp"}</td>
          <td class="font-bold">${d.customer_name}</td>
          <td>${d.commodity_name || "—"}</td>
          <td class="text-right" style="mso-number-format:'#,##0';">${Number(d.loan_amount)}</td>
          <td class="text-right font-bold" style="mso-number-format:'#,##0';">${Number(d.interest_amount)}</td>
          <td class="text-right" style="mso-number-format:'#,##0';">${Number(d.other_amount)}</td>
          <td class="text-right font-bold" style="mso-number-format:'#,##0';">${Number(d.total_interest)}</td>
        </tr>
      `).join("");

    let excelHTML = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Báo Cáo Chi Tiết Tiền Lãi</title>
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
        <tr><td colspan="9">Chi nhánh: ${activeStore?.name || "Tất cả chi nhánh"}</td></tr>
        <tr><td colspan="9">Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}</td></tr>
        <tr><td colspan="9"></td></tr>
        <tr><td colspan="9" class="text-center report-title">BÁO CÁO CHI TIẾT TIỀN LÃI</td></tr>
        <tr><td colspan="9" class="text-center font-italic">Từ ngày ${formatDateDisplay(startDate)} đến ngày ${formatDateDisplay(endDate)} (Năm ${year})</td></tr>
        <tr><td colspan="9"></td></tr>
        <tr class="grid-header">
            <th>Ngày Đóng</th><th>Mã HĐ</th><th>Phân Loại</th><th>Khách Hàng</th><th>Tài Sản</th><th>Tiền Vay (VNĐ)</th><th>Tiền Lãi (VNĐ)</th><th>Khác/Phạt (VNĐ)</th><th>Tổng Thực Thu (VNĐ)</th>
        </tr>
        ${excelRowsHTML}
        <tr><td colspan="9" style="height: 30px;"></td></tr>
        <tr><td colspan="3" class="text-center font-bold">NGƯỜI LẬP BIỂU</td><td colspan="3" class="text-center font-bold">KẾ TOÁN TRƯỜNG</td><td colspan="3" class="text-center font-bold">GIÁM ĐỐC</td></tr>
    </table>
</body>
</html>`;

    const blob = new Blob([excelHTML], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BaoCao_ChiTietTienLai_${startDate}_${endDate}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 animate-fade-in text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
            CHI TIẾT TIỀN LÃI
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Báo cáo tổng tiền lãi thực tế thu về của chi nhánh theo từng ngày và thống kê biểu đồ theo tháng
          </p>
        </div>

        {/* Date & Year Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-slate-500 text-xs font-semibold">Năm:</span>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="bg-transparent text-slate-800 text-xs font-bold focus:outline-none border-none cursor-pointer"
            >
              {Array.from({ length: 5 }, (_, idx) => {
                const y = new Date().getFullYear() - idx;
                return (
                  <option key={y} value={y} className="bg-slate-50 text-slate-800">
                    {y}
                  </option>
                );
              })}
            </select>
          </div>

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
            className="btn btn-ghost btn-sm rounded-xl text-slate-500 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-500" : ""}`} />
            <span>Làm Mới</span>
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

      {error && (
        <div className="alert alert-error bg-red-50 border-red-200 text-red-700 rounded-2xl flex gap-3 p-4">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Yearly Stat summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm border-l-8 border-l-amber-500">
          <div className="p-3 bg-amber-500/10 rounded-2xl w-fit text-amber-500 mb-3">
            <DollarSign className="w-6 h-6" />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tổng Lãi Thu Năm {year}</p>
          <h2 className="text-3xl font-black text-slate-800 mt-2">
            {formatCurrency(totalYearInterest)}
          </h2>
          <p className="text-slate-400 text-xs mt-1">Cộng dồn tất cả tiền lãi 12 tháng qua</p>
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Biểu Đồ Lãi Thu Nhập Hàng Tháng (Năm {year})</h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner text-amber-500"></span>
          </div>
        ) : (
          <div className="h-64 flex items-end justify-between gap-2 pt-8 pb-4 border-b border-slate-100 overflow-x-auto min-w-[600px] px-4">
            {chartData.map((item, idx) => {
              const heightPct = (Number(item.amount) / maxMonthValue) * 100;
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                  <span className="text-[10px] text-amber-600 font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {formatCurrency(item.amount)}
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-orange-600 via-amber-500 to-amber-400 rounded-t-lg transition-all duration-500 ease-out shadow-md shadow-amber-500/10 group-hover:shadow-amber-500/30"
                    style={{ height: `${Math.max(4, heightPct)}%` }}
                  />
                  <span className="text-[10px] text-slate-500 font-semibold mt-2">{item.month.split("/")[0]}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-800">Chi Tiết Nhật Ký Đóng Tiền Lãi</h3>
          <span className="text-xs text-slate-500 font-semibold">
            Tổng cộng: {details.length} bản ghi
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-amber-500"></span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full text-slate-700 text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs">
                  <th className="py-3 px-4">Ngày Đóng</th>
                  <th className="py-3 px-4">Mã HĐ</th>
                  <th className="py-3 px-4">Phân Loại</th>
                  <th className="py-3 px-4">Khách Hàng</th>
                  <th className="py-3 px-4">Tài Sản Thế Chấp</th>
                  <th className="py-3 px-4 text-right">Tiền Vay Ban Đầu</th>
                  <th className="py-3 px-4 text-right">Tiền Lãi Đã Thu</th>
                  <th className="py-3 px-4 text-right">Khác / Phạt</th>
                  <th className="py-3 px-4 text-right">Tổng Thực Thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {details.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-400">
                      Không tìm thấy lịch sử đóng lãi.
                    </td>
                  </tr>
                ) : (
                  details.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">{new Date(d.transaction_date).toLocaleString("vi-VN")}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">{d.contract_code}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="badge badge-sm badge-warning badge-outline text-[10px] font-bold">
                          {d.type?.includes("Cầm đồ") ? "Cầm đồ" : "Tín chấp"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{d.customer_name}</td>
                      <td className="py-3.5 px-4">{d.commodity_name}</td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">{formatCurrency(d.loan_amount)}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600 whitespace-nowrap">{formatCurrency(d.interest_amount)}</td>
                      <td className="py-3.5 px-4 text-right text-slate-500 whitespace-nowrap">{formatCurrency(d.other_amount)}</td>
                      <td className="py-3.5 px-4 text-right font-black text-amber-600 whitespace-nowrap">{formatCurrency(d.total_interest)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
