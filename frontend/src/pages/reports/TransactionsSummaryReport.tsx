import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FileText,
  RefreshCw,
  Printer,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ChevronDown,
  FileSpreadsheet,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { DateRangePicker } from "../../components/shared/DateRangePicker";
import { toast } from "../../lib/toast";
import { formatTransactionType } from "../../utils/transactionUtils";

export const TransactionsSummaryReport: React.FC = () => {
  const { activeStore } = useAuth();

  const todayStr = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!activeStore) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/reports/transactions?startDate=${startDate}&endDate=${endDate}`
      );
      setLedger(res.data.ledger || []);
    } catch (err: any) {
      toast.error(
        err.response?.data?.error || "Lỗi khi tải báo cáo tổng kết giao dịch."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeStore, startDate, endDate]);

  const formatCurrency = (val: any) => {
    const num = Number(val || 0);
    return num.toLocaleString("vi-VN") + " ₫";
  };

  const formatNumberOnly = (val: any) => {
    const num = Number(val || 0);
    return num === 0 ? "-" : num.toLocaleString("vi-VN");
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  // Tính toán tổng quan
  const totalThu = ledger.reduce(
    (sum, item) => sum + Number(item.received_amount || 0),
    0
  );
  const totalChi = ledger.reduce(
    (sum, item) => sum + Number(item.spent_amount || 0),
    0
  );
  const chenhLech = totalThu - totalChi;

  // Thống kê theo loại hình
  const getCatStats = (categoryName: string) => {
    let thu = 0;
    let chi = 0;
    ledger.forEach((item) => {
      let isMatch = false;
      if (categoryName === "Cầm đồ" && item.type === "Cầm đồ") isMatch = true;
      if (categoryName === "Tín chấp" && item.type === "Tín chấp") isMatch = true;
      if (categoryName === "Trả góp" && item.type === "Trả góp") isMatch = true;
      if (categoryName === "Góp vốn" && item.type?.startsWith("Nguồn vốn")) isMatch = true;
      if (
        categoryName === "Thu/Chi khác" &&
        (item.type?.includes("Thu") || item.type?.includes("Chi")) &&
        !item.type?.startsWith("Nguồn vốn")
      )
        isMatch = true;

      if (isMatch) {
        thu += Number(item.received_amount || 0);
        chi += Number(item.spent_amount || 0);
      }
    });
    return { thu, chi };
  };

  const camDoStats = getCatStats("Cầm đồ");
  const tinChapStats = getCatStats("Tín chấp");
  const traGopStats = getCatStats("Trả góp");
  const gopVonStats = getCatStats("Góp vốn");
  const khacStats = getCatStats("Thu/Chi khác");

  // XUẤT BÁO CÁO THEO MẪU HTML / IN PDF
  const handleExportHTML = () => {
    const tableRowsHTML = ledger.length === 0
      ? `<tr><td colSpan="8" class="text-center" style="padding: 15px; color:#6b7280;">Không có giao dịch nào phát sinh trong khoảng thời gian này.</td></tr>`
      : ledger.map((item) => {
          const isThu = Number(item.received_amount || 0) > 0;
          const isChi = Number(item.spent_amount || 0) > 0;
          return `
            <tr>
              <td class="text-center">${new Date(item.date).toLocaleDateString("vi-VN")}</td>
              <td class="text-center font-bold">${item.contract_code || "—"}</td>
              <td>${item.customer_name || "—"}</td>
              <td class="text-center">${formatTransactionType(item.type)}</td>
              <td class="text-center">${item.employee_name || "—"}</td>
              <td>${item.description || "—"}</td>
              <td class="text-right">${isThu ? formatNumberOnly(item.received_amount) : "-"}</td>
              <td class="text-right">${isChi ? formatNumberOnly(item.spent_amount) : "-"}</td>
            </tr>
          `;
        }).join("");

    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Báo Cáo Tổng Hợp Giao Dịch - Bản In</title>
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
        @media print { body { background: none; margin: 0; padding: 0; } .page-a4 { box-shadow: none; margin: 0; padding: 0; width: auto; min-height: auto; } .no-print { display: none; } th, td { border: 1pt solid #000 !important; } th { background-color: #e6e6e6 !important; -webkit-print-color-adjust: exact; } }
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
            <h1>BÁO CÁO TỔNG HỢP GIAO DỊCH DÒNG TIỀN</h1>
            <p>Kỳ báo cáo: Từ ngày ${formatDateDisplay(startDate)} đến ngày ${formatDateDisplay(endDate)}</p>
        </div>
        <div class="section-title">I. TỔNG HỢP SỐ LIỆU THEO LOẠI HÌNH</div>
        <table>
            <thead>
                <tr>
                    <th width="5%">STT</th>
                    <th width="25%">Loại Hình Giao Dịch</th>
                    <th width="20%">Tổng Tiền Thu (VNĐ)</th>
                    <th width="20%">Tổng Tiền Chi (VNĐ)</th>
                    <th width="30%">Ghi chú</th>
                </tr>
            </thead>
            <tbody>
                <tr><td class="text-center">1</td><td>Cầm đồ</td><td class="text-right">${formatNumberOnly(camDoStats.thu)}</td><td class="text-right">${formatNumberOnly(camDoStats.chi)}</td><td></td></tr>
                <tr><td class="text-center">2</td><td>Tín chấp</td><td class="text-right">${formatNumberOnly(tinChapStats.thu)}</td><td class="text-right">${formatNumberOnly(tinChapStats.chi)}</td><td></td></tr>
                <tr><td class="text-center">3</td><td>Trả góp</td><td class="text-right">${formatNumberOnly(traGopStats.thu)}</td><td class="text-right">${formatNumberOnly(traGopStats.chi)}</td><td></td></tr>
                <tr><td class="text-center">4</td><td>Góp vốn (Nhà đầu tư)</td><td class="text-right">${formatNumberOnly(gopVonStats.thu)}</td><td class="text-right">${formatNumberOnly(gopVonStats.chi)}</td><td></td></tr>
                <tr><td class="text-center">5</td><td>Thu / Chi phí hoạt động khác</td><td class="text-right">${formatNumberOnly(khacStats.thu)}</td><td class="text-right">${formatNumberOnly(khacStats.chi)}</td><td>Mặt bằng, điện nước...</td></tr>
                <tr class="font-bold"><td colspan="2" class="text-center">TỔNG CỘNG</td><td class="text-right">${formatNumberOnly(totalThu)}</td><td class="text-right">${formatNumberOnly(totalChi)}</td><td class="text-center">${chenhLech >= 0 ? "Tồn quỹ tăng: " : "Tồn quỹ giảm: "}${formatNumberOnly(Math.abs(chenhLech))}</td></tr>
            </tbody>
        </table>
        <div class="section-title">II. BẢNG KÊ CHI TIẾT GIAO DỊCH</div>
        <table>
            <thead>
                <tr>
                    <th width="12%">Thời gian</th>
                    <th width="10%">Mã HĐ</th>
                    <th width="14%">Khách hàng</th>
                    <th width="10%">Loại hình</th>
                    <th width="12%">Nhân viên</th>
                    <th width="18%">Nội dung</th>
                    <th width="12%">Thu (VNĐ)</th>
                    <th width="12%">Chi (VNĐ)</th>
                </tr>
            </thead>
            <tbody>
                ${tableRowsHTML}
            </tbody>
        </table>
        <div class="signature-section">
            <div class="signature-box"><div class="role">NGƯỜI LẬP BIỂU</div><div class="note">(Ký, ghi rõ họ tên)</div></div>
            <div class="signature-box"><div class="role">KẾ TOÁN TRƯỞNG</div><div class="note">(Ký, ghi rõ họ tên)</div></div>
            <div class="signature-box"><div class="role">GIÁM ĐỐC</div><div class="note">(Ký, đóng dấu, ghi rõ họ tên)</div></div>
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

  // XUẤT EXCEL (XLS)
  const handleExportExcel = () => {
    let excelRowsHTML = ledger.length === 0
      ? `<tr><td colspan="9" class="text-center" style="padding:10px;">Không có dữ liệu giao dịch phát sinh.</td></tr>`
      : ledger.map((item) => `
        <tr>
            <td class="text-center" style="mso-number-format:'\\@';">${new Date(item.date).toLocaleDateString("vi-VN")}</td>
            <td class="text-center font-bold" style="mso-number-format:'\\@';">${item.contract_code || "—"}</td>
            <td>${item.customer_name || "—"}</td>
            <td>${formatTransactionType(item.type)}</td>
            <td>${item.employee_name || "—"}</td>
            <td>${item.description || "—"}</td>
            <td class="text-right" style="mso-number-format:'#,##0';">${Number(item.received_amount || 0)}</td>
            <td class="text-right" style="mso-number-format:'#,##0';">${Number(item.spent_amount || 0)}</td>
            <td>${item.notes || ""}</td>
        </tr>
      `).join("");

    let excelHTML = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Báo Cáo Tổng Hợp Giao Dịch</title>
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
        <tr><td colspan="9" class="text-center report-title">BÁO CÁO TỔNG HỢP GIAO DỊCH DÒNG TIỀN</td></tr>
        <tr><td colspan="9" class="text-center font-italic">Từ ngày ${formatDateDisplay(startDate)} đến ngày ${formatDateDisplay(endDate)}</td></tr>
        <tr><td colspan="9"></td></tr>
        <tr><td colspan="9" class="font-bold">I. TỔNG HỢP SỐ LIỆU THEO LOẠI HÌNH</td></tr>
        <tr class="grid-header">
            <th width="5%">STT</th>
            <th width="20%">Loại Hình</th>
            <th colspan="4"></th>
            <th width="15%">Tổng Thu (VNĐ)</th>
            <th width="15%">Tổng Chi (VNĐ)</th>
            <th width="20%">Ghi chú</th>
        </tr>
        <tr><td class="text-center">1</td><td>Cầm đồ</td><td colspan="4"></td><td class="text-right" style="mso-number-format:'#,##0';">${Number(camDoStats.thu)}</td><td class="text-right" style="mso-number-format:'#,##0';">${Number(camDoStats.chi)}</td><td></td></tr>
        <tr><td class="text-center">2</td><td>Tín chấp</td><td colspan="4"></td><td class="text-right" style="mso-number-format:'#,##0';">${Number(tinChapStats.thu)}</td><td class="text-right" style="mso-number-format:'#,##0';">${Number(tinChapStats.chi)}</td><td></td></tr>
        <tr><td class="text-center">3</td><td>Trả góp</td><td colspan="4"></td><td class="text-right" style="mso-number-format:'#,##0';">${Number(traGopStats.thu)}</td><td class="text-right" style="mso-number-format:'#,##0';">${Number(traGopStats.chi)}</td><td></td></tr>
        <tr><td class="text-center">4</td><td>Góp vốn (Nhà đầu tư)</td><td colspan="4"></td><td class="text-right" style="mso-number-format:'#,##0';">${Number(gopVonStats.thu)}</td><td class="text-right" style="mso-number-format:'#,##0';">${Number(gopVonStats.chi)}</td><td></td></tr>
        <tr><td class="text-center">5</td><td>Thu / Chi phí hoạt động khác</td><td colspan="4"></td><td class="text-right" style="mso-number-format:'#,##0';">${Number(khacStats.thu)}</td><td class="text-right" style="mso-number-format:'#,##0';">${Number(khacStats.chi)}</td><td>Mặt bằng, điện nước...</td></tr>
        <tr class="font-bold"><td colspan="2" class="text-center">TỔNG CỘNG</td><td colspan="4"></td><td class="text-right" style="mso-number-format:'#,##0';">${Number(totalThu)}</td><td class="text-right" style="mso-number-format:'#,##0';">${Number(totalChi)}</td><td class="text-center">${chenhLech >= 0 ? "Tồn quỹ tăng: " : "Tồn quỹ giảm: "}${Number(Math.abs(chenhLech)).toLocaleString("vi-VN")}</td></tr>
        <tr><td colspan="9"></td></tr>
        <tr><td colspan="9" class="font-bold">II. BẢNG KÊ CHI TIẾT GIAO DỊCH</td></tr>
        <tr class="grid-header">
            <th>Ngày giờ</th><th>Mã HĐ</th><th>Khách hàng</th><th>Loại hình</th><th>Nhân viên</th><th>Nội dung</th><th>Thu (VNĐ)</th><th>Chi (VNĐ)</th><th>Ghi chú</th>
        </tr>
        ${excelRowsHTML}
        <tr><td colspan="9" style="height: 30px;"></td></tr>
        <tr><td colspan="3" class="text-center font-bold">NGƯỜI LẬP BIỂU</td><td colspan="3" class="text-center font-bold">KẾ TOÁN TRƯỞNG</td><td colspan="3" class="text-center font-bold">GIÁM ĐỐC</td></tr>
        <tr><td colspan="3" class="text-center font-italic">(Ký, họ tên)</td><td colspan="3" class="text-center font-italic">(Ký, họ tên)</td><td colspan="3" class="text-center font-italic">(Ký, đóng dấu, họ tên)</td></tr>
    </table>
</body>
</html>`;

    const blob = new Blob([excelHTML], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BaoCao_TongKetGiaoDich_${startDate}_${endDate}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 animate-fade-in text-slate-800">
      {/* PHẦN 1: HEADER & BỘ LỌC */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-500" />
            Báo Cáo Tổng Kết Giao Dịch Dòng Tiền
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thống kê toàn bộ dòng tiền Thu / Chi theo loại hình giao dịch trong kỳ báo cáo
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

      {/* PHẦN 2: THẺ THỐNG KÊ TỔNG QUAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center gap-0 justify-center shrink-0">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng Tiền Thu
            </span>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-0.5">
              {formatCurrency(totalThu)}
            </h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <ArrowDownRight className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng Tiền Chi
            </span>
            <h3 className="text-2xl font-extrabold text-red-600 mt-0.5">
              {formatCurrency(totalChi)}
            </h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tồn Quỹ / Chênh Lệch
            </span>
            <h3 className={`text-2xl font-extrabold mt-0.5 ${chenhLech >= 0 ? "text-slate-900" : "text-red-600"}`}>
              {formatCurrency(chenhLech)}
            </h3>
          </div>
        </div>
      </div>

      {/* CÁC THẺ PHÂN LOẠI NHỎ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {/* Cầm đồ */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
          <h3 className="font-bold text-sm text-blue-900 mb-3 border-b border-slate-100 pb-2">
            Cầm đồ
          </h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Thu:</span>
              <span className="font-bold text-emerald-600">{formatNumberOnly(camDoStats.thu)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Chi:</span>
              <span className="font-bold text-red-600">{formatNumberOnly(camDoStats.chi)}</span>
            </div>
          </div>
        </div>

        {/* Tín chấp */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
          <h3 className="font-bold text-sm text-blue-900 mb-3 border-b border-slate-100 pb-2">
            Tín chấp
          </h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Thu:</span>
              <span className="font-bold text-emerald-600">{formatNumberOnly(tinChapStats.thu)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Chi:</span>
              <span className="font-bold text-red-600">{formatNumberOnly(tinChapStats.chi)}</span>
            </div>
          </div>
        </div>

        {/* Trả góp */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
          <h3 className="font-bold text-sm text-blue-900 mb-3 border-b border-slate-100 pb-2">
            Trả góp
          </h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Thu:</span>
              <span className="font-bold text-emerald-600">{formatNumberOnly(traGopStats.thu)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Chi:</span>
              <span className="font-bold text-red-600">{formatNumberOnly(traGopStats.chi)}</span>
            </div>
          </div>
        </div>

        {/* Góp vốn */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
          <h3 className="font-bold text-sm text-blue-900 mb-3 border-b border-slate-100 pb-2">
            Góp vốn
          </h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Thu:</span>
              <span className="font-bold text-emerald-600">{formatNumberOnly(gopVonStats.thu)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Chi:</span>
              <span className="font-bold text-red-600">{formatNumberOnly(gopVonStats.chi)}</span>
            </div>
          </div>
        </div>

        {/* Thu/Chi khác */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
          <h3 className="font-bold text-sm text-blue-900 mb-3 border-b border-slate-100 pb-2">
            Thu/Chi khác
          </h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Thu:</span>
              <span className="font-bold text-emerald-600">{formatNumberOnly(khacStats.thu)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Chi:</span>
              <span className="font-bold text-red-600">{formatNumberOnly(khacStats.chi)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PHẦN 3: BẢNG KÊ CHI TIẾT GIAO DỊCH */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-900" />
            Danh sách Giao dịch & Hợp đồng
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            Tổng cộng: {ledger.length} giao dịch
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
                <tr className="bg-slate-50 text-slate-500 text-xs border-b border-slate-200">
                  <th className="py-3 px-4">Ngày giờ</th>
                  <th className="py-3 px-4">Mã HĐ</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Loại hình</th>
                  <th className="py-3 px-4">Nhân viên</th>
                  <th className="py-3 px-4">Nội dung giao dịch</th>
                  <th className="py-3 px-4 text-right">Số tiền THU</th>
                  <th className="py-3 px-4 text-right">Số tiền CHI</th>
                  <th className="py-3 px-4">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledger.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-400 text-xs">
                      Không có giao dịch nào phát sinh trong khoảng thời gian này.
                    </td>
                  </tr>
                ) : (
                  ledger.map((item, idx) => {
                    const isThu = Number(item.received_amount || 0) > 0;
                    const isChi = Number(item.spent_amount || 0) > 0;

                    let badgeClass = "bg-slate-100 text-slate-700";
                    if (item.type === "Cầm đồ") badgeClass = "bg-sky-100 text-sky-800";
                    else if (item.type === "Tín chấp") badgeClass = "bg-amber-100 text-amber-800";
                    else if (item.type === "Trả góp") badgeClass = "bg-slate-200 text-slate-800";
                    else if (item.type?.startsWith("Nguồn vốn")) badgeClass = "bg-emerald-100 text-emerald-800";
                    else if (item.type?.includes("Thu") || item.type?.includes("Chi")) badgeClass = "bg-pink-100 text-pink-800";

                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors text-xs">
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          {new Date(item.date).toLocaleString("vi-VN")}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {item.contract_code}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {item.customer_name || "—"}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${badgeClass}`}>
                            {formatTransactionType(item.type)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                          {item.employee_name || "—"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {item.description}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-600 whitespace-nowrap">
                          {isThu ? formatNumberOnly(item.received_amount) : "-"}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-red-600 whitespace-nowrap">
                          {isChi ? formatNumberOnly(item.spent_amount) : "-"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs max-w-xs truncate" title={item.notes}>
                          {item.notes || "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
