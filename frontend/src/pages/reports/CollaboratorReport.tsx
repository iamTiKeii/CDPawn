import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  RefreshCw,
  AlertCircle,
  Download,
  Printer,
  ChevronDown,
  FileSpreadsheet,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { DateRangePicker } from "../../components/shared/DateRangePicker";

export const CollaboratorReport: React.FC = () => {
  const { activeStore } = useAuth();
  
  const todayStr = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    if (!activeStore) return;
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(
        `/api/reports/collaborators?startDate=${startDate}&endDate=${endDate}`
      );
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Lỗi khi tải báo cáo cộng tác viên.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeStore, startDate, endDate]);

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

  const filteredData = data.filter((item) =>
    item.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (item.code && item.code.toLowerCase().includes(search.toLowerCase()))
  );

  const handleExportHTML = () => {
    const tableRowsHTML = filteredData.length === 0
      ? `<tr><td colSpan="8" class="text-center" style="padding: 15px; color:#6b7280;">Không tìm thấy dữ liệu cộng tác viên nào.</td></tr>`
      : filteredData.map((item, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center font-bold">${item.code || "—"}</td>
          <td class="font-bold">${item.full_name}</td>
          <td class="text-center">${item.phone || "—"}</td>
          <td class="text-center font-bold">${item.contract_count} HĐ</td>
          <td class="text-right">${formatNumberOnly(item.total_disbursed)}</td>
          <td class="text-right font-bold">${formatNumberOnly(item.total_interest_paid)}</td>
          <td class="text-center">${item.status === "active" ? "Đang hợp tác" : "Ngưng hợp tác"}</td>
        </tr>
      `).join("");

    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Báo Cáo Cộng Tác Viên - Bản In</title>
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
            <h1>BÁO CÁO CỘNG TÁC VIÊN</h1>
            <p>Kỳ báo cáo: Từ ngày ${formatDateDisplay(startDate)} đến ngày ${formatDateDisplay(endDate)}</p>
        </div>

        <div class="section-title">DANH SÁCH HIỆU QUẢ CỘNG TÁC VIÊN</div>
        <table>
            <thead>
                <tr>
                    <th width="5%">STT</th>
                    <th width="12%">Mã CTV</th>
                    <th width="23%">Họ Tên CTV</th>
                    <th width="15%">Số Điện Thoại</th>
                    <th width="10%">Số Lượng HĐ</th>
                    <th width="15%">Tổng Giải Ngân (VNĐ)</th>
                    <th width="10%">Lãi Đã Thu (VNĐ)</th>
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
    let excelRowsHTML = filteredData.length === 0
      ? `<tr><td colspan="8" class="text-center" style="padding:10px;">Không có dữ liệu.</td></tr>`
      : filteredData.map((item, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center font-bold" style="mso-number-format:'\\@';">${item.code || "—"}</td>
          <td class="font-bold">${item.full_name}</td>
          <td class="text-center" style="mso-number-format:'\\@';">${item.phone || "—"}</td>
          <td class="text-center">${item.contract_count}</td>
          <td class="text-right" style="mso-number-format:'#,##0';">${Number(item.total_disbursed)}</td>
          <td class="text-right font-bold" style="mso-number-format:'#,##0';">${Number(item.total_interest_paid)}</td>
          <td class="text-center">${item.status === "active" ? "Đang hợp tác" : "Ngưng hợp tác"}</td>
        </tr>
      `).join("");

    let excelHTML = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Báo Cáo Cộng Tác Viên</title>
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
        <tr><td colspan="8" class="text-center report-title">BÁO CÁO CỘNG TÁC VIÊN</td></tr>
        <tr><td colspan="8" class="text-center font-italic">Từ ngày ${formatDateDisplay(startDate)} đến ngày ${formatDateDisplay(endDate)}</td></tr>
        <tr><td colspan="8"></td></tr>
        <tr class="grid-header">
            <th>STT</th><th>Mã CTV</th><th>Họ Tên CTV</th><th>Số Điện Thoại</th><th>Số Lượng HĐ</th><th>Tổng Giải Ngân (VNĐ)</th><th>Lãi Đã Thu (VNĐ)</th><th>Trạng Thái</th>
        </tr>
        ${excelRowsHTML}
        <tr><td colspan="8" style="height: 30px;"></td></tr>
        <tr><td colspan="3" class="text-center font-bold">NGƯỜI LẬP BIỂU</td><td colspan="3" class="text-center font-bold">KẾ TOÁN TRƯỞNG</td><td colspan="2" class="text-center font-bold">GIÁM ĐỐC</td></tr>
    </table>
</body>
</html>`;

    const blob = new Blob([excelHTML], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BaoCao_CongTacVien_${startDate}_${endDate}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 animate-fade-in text-slate-800 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
            BÁO CÁO CỘNG TÁC VIÊN
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Theo dõi doanh số giới thiệu khách hàng, số lượng hợp đồng phát sinh và hiệu quả đóng lãi từ mạng lưới cộng tác viên
          </p>
        </div>

        {/* Date Filter & Export */}
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

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm cộng tác viên bằng tên hoặc mã..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-bordered w-full rounded-2xl bg-slate-50 border-slate-200 pl-11 text-slate-800 text-xs focus:border-amber-500 focus:outline-none h-[40px]"
            />
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            Tổng cộng: {filteredData.length} cộng tác viên
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
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4">Mã CTV</th>
                  <th className="py-3 px-4">Họ Tên CTV</th>
                  <th className="py-3 px-4">Số Điện Thoại</th>
                  <th className="py-3 px-4 text-center">Số Lượng HĐ</th>
                  <th className="py-3 px-4 text-right">Tổng Giải Ngân</th>
                  <th className="py-3 px-4 text-right">Lãi Đã Thu</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      Không tìm thấy dữ liệu cộng tác viên nào.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center font-medium text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{item.code || "—"}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{item.full_name}</td>
                      <td className="py-3.5 px-4">{item.phone || "—"}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-amber-600">{item.contract_count} HĐ</td>
                      <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap">{formatCurrency(item.total_disbursed)}</td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-600 whitespace-nowrap">{formatCurrency(item.total_interest_paid)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`badge badge-sm font-bold uppercase rounded-full px-3 py-1 ${
                            item.status === "active"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          {item.status === "active" ? "Đang hợp tác" : "Ngưng hợp tác"}
                        </span>
                      </td>
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
