import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  RefreshCw,
  AlertCircle,
  Users,
  Coins,
  Download,
  Printer,
  ChevronDown,
  FileSpreadsheet,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { DateRangePicker } from "../../components/shared/DateRangePicker";

export const EmployeeCollectionReport: React.FC = () => {
  const { activeStore } = useAuth();
  
  const todayStr = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    if (!activeStore) return;
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`/api/reports/collection?startDate=${startDate}&endDate=${endDate}`);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Lỗi khi tải báo cáo thống kê thu tiền nhân viên.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeStore, startDate, endDate]);

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

  const totalCollected = data.reduce((sum, item) => sum + Number(item.total_collected), 0);

  const handleExportHTML = () => {
    const tableRowsHTML = data.length === 0
      ? `<tr><td colSpan="5" class="text-center" style="padding: 15px; color:#6b7280;">Không có dữ liệu đóng góp doanh số nào.</td></tr>`
      : data.map((item, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="font-bold">${item.full_name}</td>
          <td class="text-center">${new Date(item.startDate).toLocaleDateString("vi-VN")}</td>
          <td class="text-center">${new Date(item.endDate).toLocaleDateString("vi-VN")}</td>
          <td class="text-right font-bold">${formatNumberOnly(item.total_collected)}</td>
        </tr>
      `).join("");

    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Báo Cáo Thu Tiền Nhân Viên - Bản In</title>
    <style>
        :root { --font-main: 'Times New Roman', Times, serif; }
        body { font-family: var(--font-main); background-color: #525659; margin: 0; padding: 20px; font-size: 13pt; color: #000; }
        .page-a4 { width: 210mm; min-height: 297mm; padding: 20mm 15mm; margin: 0 auto; background: #fff; box-shadow: 0 0 10px rgba(0,0,0,0.5); box-sizing: border-box; }
        .company-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .company-info h3 { margin: 0 0 5px 0; font-size: 14pt; text-transform: uppercase; }
        .company-info p { margin: 0 0 3px 0; font-size: 11pt; }
        .report-title { text-align: center; margin: 30px 0; }
        .report-title h1 { margin: 0; font-size: 18pt; text-transform: uppercase; }
        .report-title p { margin: 5px 0 0 0; font-style: italic; }
        .section-title { font-weight: bold; font-size: 14pt; margin: 20px 0 10px 0; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12pt; }
        th, td { border: 1px solid #000; padding: 8px; vertical-align: middle; }
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
            <h1>BÁO CÁO THU TIỀN NHÂN VIÊN</h1>
            <p>Kỳ báo cáo: Từ ngày ${formatDateDisplay(startDate)} đến ngày ${formatDateDisplay(endDate)}</p>
        </div>

        <div class="section-title">BẢNG DOANH SỐ THU TIỀN NHÂN VIÊN</div>
        <table>
            <thead>
                <tr>
                    <th width="10%">STT</th>
                    <th width="35%">Nhân Viên Thu Tiền</th>
                    <th width="20%">Từ Ngày</th>
                    <th width="20%">Đến Ngày</th>
                    <th width="15%">Tổng Thu (VNĐ)</th>
                </tr>
            </thead>
            <tbody>
                ${tableRowsHTML}
                ${data.length > 0 ? `
                <tr class="font-bold">
                    <td colspan="4" class="text-center">TỔNG CỘNG DOANH SỐ THU KÉT</td>
                    <td class="text-right">${formatNumberOnly(totalCollected)}</td>
                </tr>` : ""}
            </tbody>
        </table>

        <div class="signature-section">
            <div class="signature-box"><div class="role">NGƯỜI LẬP BIỂU</div><div class="note">(Ký, ghi rõ họ tên)</div></div>
            <div class="signature-box"><div class="role">KẾ TOÁN TRƯỞNG</div><div class="note">(Ký, ghi rõ họ tên)</div></div>
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
      ? `<tr><td colspan="5" class="text-center" style="padding:10px;">Không có dữ liệu.</td></tr>`
      : data.map((item, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="font-bold">${item.full_name}</td>
          <td class="text-center" style="mso-number-format:'\\@';">${new Date(item.startDate).toLocaleDateString("vi-VN")}</td>
          <td class="text-center" style="mso-number-format:'\\@';">${new Date(item.endDate).toLocaleDateString("vi-VN")}</td>
          <td class="text-right font-bold" style="mso-number-format:'#,##0';">${Number(item.total_collected)}</td>
        </tr>
      `).join("");

    let excelHTML = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Báo Cáo Thu Tiền Nhân Viên</title>
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
        <tr><td colspan="5" class="font-bold">CÔNG TY TNHH ĐẦU TƯ TÀI CHÍNH CDPAWN</td></tr>
        <tr><td colspan="5">Chi nhánh: ${activeStore?.name || "Tất cả chi nhánh"}</td></tr>
        <tr><td colspan="5">Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}</td></tr>
        <tr><td colspan="5"></td></tr>
        <tr><td colspan="5" class="text-center report-title">BÁO CÁO THU TIỀN NHÂN VIÊN</td></tr>
        <tr><td colspan="5" class="text-center font-italic">Từ ngày ${formatDateDisplay(startDate)} đến ngày ${formatDateDisplay(endDate)}</td></tr>
        <tr><td colspan="5"></td></tr>
        <tr class="grid-header">
            <th>STT</th><th>Nhân Viên Thu Tiền</th><th>Từ Ngày</th><th>Đến Ngày</th><th>Tổng Tiền Thu (VNĐ)</th>
        </tr>
        ${excelRowsHTML}
        ${data.length > 0 ? `
        <tr class="font-bold">
            <td colspan="4" class="text-center">TỔNG CỘNG DOANH SỐ THU KÉT</td>
            <td class="text-right" style="mso-number-format:'#,##0';">${Number(totalCollected)}</td>
        </tr>` : ""}
        <tr><td colspan="5" style="height: 30px;"></td></tr>
        <tr><td colspan="2" class="text-center font-bold">NGƯỜI LẬP BIỂU</td><td colspan="2" class="text-center font-bold">KẾ TOÁN TRƯỞNG</td><td class="text-center font-bold">GIÁM ĐỐC</td></tr>
    </table>
</body>
</html>`;

    const blob = new Blob([excelHTML], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BaoCao_ThuTienNhanVien_${startDate}_${endDate}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 p-2 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Thống Kê Thu Tiền Nhân Viên
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Theo dõi hiệu quả thu nợ, thu tiền lãi, đóng trả góp của từng nhân viên chi nhánh theo khoảng thời gian.
          </p>
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
        <div className="alert alert-error bg-red-500/10 border-red-500/20 text-red-200 shadow-lg rounded-2xl flex gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/65 border border-slate-200/80 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110" />
          <div className="p-3 bg-amber-500/10 rounded-2xl w-fit text-amber-500 mb-4">
            <Coins className="w-6 h-6" />
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Tổng Thu Tập Thể Nhân Viên</p>
          <h2 className="text-3xl font-extrabold text-emerald-400 mt-2">
            {formatCurrency(totalCollected)}
          </h2>
          <p className="text-slate-500 text-xs mt-1">Cộng dồn doanh số thu từ đóng lãi, đóng gốc</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 backdrop-blur-lg space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            Bảng Doanh Số Thu Tiền Nhân Viên
          </h3>
          <button
            onClick={fetchData}
            className="btn btn-ghost btn-sm rounded-xl text-slate-500 hover:bg-slate-50 flex items-center gap-1.5"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-500" : ""}`} />
            Làm Mới
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-amber-500"></span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full text-slate-600">
              <thead>
                <tr className="border-b border-slate-200/80/60 text-slate-500">
                  <th>STT</th>
                  <th>Nhân Viên Thu Tiền</th>
                  <th>Từ Ngày</th>
                  <th>Đến Ngày</th>
                  <th className="text-right">Tổng Tiền Thu Nhập (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">
                      Không có dữ liệu đóng góp doanh số nào.
                    </td>
                  </tr>
                ) : (
                  data.map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-200/40 hover:bg-slate-50/50">
                      <td>{idx + 1}</td>
                      <td className="font-bold text-slate-800">{item.full_name}</td>
                      <td>{new Date(item.startDate).toLocaleDateString("vi-VN")}</td>
                      <td>{new Date(item.endDate).toLocaleDateString("vi-VN")}</td>
                      <td className="text-emerald-400 font-extrabold text-right">{formatCurrency(item.total_collected)}</td>
                    </tr>
                  ))
                )}
                {data.length > 0 && (
                  <tr className="border-t border-slate-200 bg-white/50 font-bold text-slate-800 text-sm">
                    <td colSpan={4}>Tổng Cộng Doanh Số Thu Két</td>
                    <td className="text-emerald-400 text-right">{formatCurrency(totalCollected)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
