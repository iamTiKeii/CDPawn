import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  RefreshCw,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Users,
  Award,
  Download,
  Printer,
  ChevronDown,
  FileSpreadsheet,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { DateRangePicker } from "../../components/shared/DateRangePicker";

export const ProfitSummaryReport: React.FC = () => {
  const { activeStore } = useAuth();
  
  const todayStr = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    if (!activeStore) return;
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`/api/reports/profit?startDate=${startDate}&endDate=${endDate}`);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Lỗi khi tải báo cáo tổng kết lợi nhuận.");
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

  const getSubTotal = (field: string) => {
    if (!data) return 0;
    return (
      Number(data.pawn?.[field] || 0) +
      Number(data.unsecured?.[field] || 0) +
      Number(data.installment?.[field] || 0) +
      Number(data.capital?.[field] || 0)
    );
  };

  const handleExportHTML = () => {
    if (!data) return;
    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Báo Cáo Tổng Kết Lợi Nhuận - Bản In</title>
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
            <h1>BÁO CÁO TỔNG KẾT LỢI NHUẬN</h1>
            <p>Kỳ báo cáo: Từ ngày ${formatDateDisplay(startDate)} đến ngày ${formatDateDisplay(endDate)}</p>
        </div>

        <div class="section-title">I. THỐNG KÊ TỔNG QUAN</div>
        <table>
            <tr>
                <td width="25%" class="font-bold">Giải ngân / Nhận vốn mới:</td>
                <td width="25%" class="text-right">${formatCurrency(getSubTotal("disbursed"))}</td>
                <td width="25%" class="font-bold">Tổng dư nợ / Vốn góp hiện tại:</td>
                <td width="25%" class="text-right">${formatCurrency(getSubTotal("outstanding"))}</td>
            </tr>
            <tr>
                <td class="font-bold">Tiền lãi đã thu:</td>
                <td class="text-right font-bold" style="color:#16a34a;">${formatCurrency(getSubTotal("profit"))}</td>
                <td class="font-bold">Khách nợ lại:</td>
                <td class="text-right font-bold" style="color:#dc2626;">${formatCurrency(getSubTotal("customer_debt"))}</td>
            </tr>
        </table>

        <div class="section-title">II. BẢNG CHI TIẾT SẢN PHẨM KINH DOANH</div>
        <table>
            <thead>
                <tr>
                    <th>Loại Hình</th>
                    <th>Tổng HĐ</th>
                    <th>HĐ Mới</th>
                    <th>Đang Hoạt Động</th>
                    <th>Tất Toán</th>
                    <th>Giải Ngân / Nhận Vốn</th>
                    <th>Dư Nợ / Vốn Hiện Tại</th>
                    <th>Lãi Đã Thu</th>
                    <th>Khách Nợ</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="font-bold">Cầm đồ</td>
                    <td class="text-center">${data.pawn.total}</td>
                    <td class="text-center">${data.pawn.new}</td>
                    <td class="text-center">${data.pawn.active}</td>
                    <td class="text-center">${data.pawn.closed}</td>
                    <td class="text-right">${formatNumberOnly(data.pawn.disbursed)}</td>
                    <td class="text-right">${formatNumberOnly(data.pawn.outstanding)}</td>
                    <td class="text-right font-bold">${formatNumberOnly(data.pawn.profit)}</td>
                    <td class="text-right">${formatNumberOnly(data.pawn.customer_debt)}</td>
                </tr>
                <tr>
                    <td class="font-bold">Tín chấp</td>
                    <td class="text-center">${data.unsecured.total}</td>
                    <td class="text-center">${data.unsecured.new}</td>
                    <td class="text-center">${data.unsecured.active}</td>
                    <td class="text-center">${data.unsecured.closed}</td>
                    <td class="text-right">${formatNumberOnly(data.unsecured.disbursed)}</td>
                    <td class="text-right">${formatNumberOnly(data.unsecured.outstanding)}</td>
                    <td class="text-right font-bold">${formatNumberOnly(data.unsecured.profit)}</td>
                    <td class="text-right">${formatNumberOnly(data.unsecured.customer_debt)}</td>
                </tr>
                <tr>
                    <td class="font-bold">Trả góp</td>
                    <td class="text-center">${data.installment.total}</td>
                    <td class="text-center">${data.installment.new}</td>
                    <td class="text-center">${data.installment.active}</td>
                    <td class="text-center">${data.installment.closed}</td>
                    <td class="text-right">${formatNumberOnly(data.installment.disbursed)}</td>
                    <td class="text-right">${formatNumberOnly(data.installment.outstanding)}</td>
                    <td class="text-right font-bold">${formatNumberOnly(data.installment.profit)}</td>
                    <td class="text-right">${formatNumberOnly(data.installment.customer_debt)}</td>
                </tr>
                ${data.capital ? `
                <tr>
                    <td class="font-bold">Nguồn vốn (Góp vốn)</td>
                    <td class="text-center">${data.capital.total}</td>
                    <td class="text-center">${data.capital.new}</td>
                    <td class="text-center">${data.capital.active}</td>
                    <td class="text-center">${data.capital.closed}</td>
                    <td class="text-right">${formatNumberOnly(data.capital.disbursed)}</td>
                    <td class="text-right">${formatNumberOnly(data.capital.outstanding)}</td>
                    <td class="text-right font-bold">${formatNumberOnly(data.capital.profit || 0)}</td>
                    <td class="text-right">${formatNumberOnly(data.capital.customer_debt || 0)}</td>
                </tr>` : ""}
                <tr class="font-bold">
                    <td>TỔNG CỘNG</td>
                    <td class="text-center">${getSubTotal("total")}</td>
                    <td class="text-center">${getSubTotal("new")}</td>
                    <td class="text-center">${getSubTotal("active")}</td>
                    <td class="text-center">${getSubTotal("closed")}</td>
                    <td class="text-right">${formatNumberOnly(getSubTotal("disbursed"))}</td>
                    <td class="text-right">${formatNumberOnly(getSubTotal("outstanding"))}</td>
                    <td class="text-right">${formatNumberOnly(getSubTotal("profit"))}</td>
                    <td class="text-right">${formatNumberOnly(getSubTotal("customer_debt"))}</td>
                </tr>
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
    if (!data) return;
    let excelHTML = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Báo Cáo Tổng Kết Lợi Nhuận</title>
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
        <tr><td colspan="9" class="text-center report-title">BÁO CÁO TỔNG KẾT LỢI NHUẬN</td></tr>
        <tr><td colspan="9" class="text-center font-italic">Từ ngày ${formatDateDisplay(startDate)} đến ngày ${formatDateDisplay(endDate)}</td></tr>
        <tr><td colspan="9"></td></tr>
        <tr class="grid-header">
            <th>Loại Hình</th><th>Tổng HĐ</th><th>HĐ Mới</th><th>Đang Hoạt Động</th><th>Tất Toán</th><th>Giải Ngân / Nhận Vốn (VNĐ)</th><th>Dư Nợ / Vốn Hiện Tại (VNĐ)</th><th>Lãi Đã Thu (VNĐ)</th><th>Khách Nợ (VNĐ)</th>
        </tr>
        <tr>
            <td class="font-bold">Cầm đồ</td><td class="text-center">${data.pawn.total}</td><td class="text-center">${data.pawn.new}</td><td class="text-center">${data.pawn.active}</td><td class="text-center">${data.pawn.closed}</td>
            <td class="text-right" style="mso-number-format:'#,##0';">${Number(data.pawn.disbursed)}</td><td class="text-right" style="mso-number-format:'#,##0';">${Number(data.pawn.outstanding)}</td>
            <td class="text-right font-bold" style="mso-number-format:'#,##0';">${Number(data.pawn.profit)}</td><td class="text-right" style="mso-number-format:'#,##0';">${Number(data.pawn.customer_debt)}</td>
        </tr>
        <tr>
            <td class="font-bold">Tín chấp</td><td class="text-center">${data.unsecured.total}</td><td class="text-center">${data.unsecured.new}</td><td class="text-center">${data.unsecured.active}</td><td class="text-center">${data.unsecured.closed}</td>
            <td class="text-right" style="mso-number-format:'#,##0';">${Number(data.unsecured.disbursed)}</td><td class="text-right" style="mso-number-format:'#,##0';">${Number(data.unsecured.outstanding)}</td>
            <td class="text-right font-bold" style="mso-number-format:'#,##0';">${Number(data.unsecured.profit)}</td><td class="text-right" style="mso-number-format:'#,##0';">${Number(data.unsecured.customer_debt)}</td>
        </tr>
        <tr>
            <td class="font-bold">Trả góp</td><td class="text-center">${data.installment.total}</td><td class="text-center">${data.installment.new}</td><td class="text-center">${data.installment.active}</td><td class="text-center">${data.installment.closed}</td>
            <td class="text-right" style="mso-number-format:'#,##0';">${Number(data.installment.disbursed)}</td><td class="text-right" style="mso-number-format:'#,##0';">${Number(data.installment.outstanding)}</td>
            <td class="text-right font-bold" style="mso-number-format:'#,##0';">${Number(data.installment.profit)}</td><td class="text-right" style="mso-number-format:'#,##0';">${Number(data.installment.customer_debt)}</td>
        </tr>
        ${data.capital ? `
        <tr>
            <td class="font-bold">Nguồn vốn (Góp vốn)</td><td class="text-center">${data.capital.total}</td><td class="text-center">${data.capital.new}</td><td class="text-center">${data.capital.active}</td><td class="text-center">${data.capital.closed}</td>
            <td class="text-right" style="mso-number-format:'#,##0';">${Number(data.capital.disbursed || 0)}</td><td class="text-right" style="mso-number-format:'#,##0';">${Number(data.capital.outstanding || 0)}</td>
            <td class="text-right font-bold" style="mso-number-format:'#,##0';">${Number(data.capital.profit || 0)}</td><td class="text-right" style="mso-number-format:'#,##0';">${Number(data.capital.customer_debt || 0)}</td>
        </tr>` : ""}
        <tr class="font-bold">
            <td>TỔNG CỘNG</td><td class="text-center">${getSubTotal("total")}</td><td class="text-center">${getSubTotal("new")}</td><td class="text-center">${getSubTotal("active")}</td><td class="text-center">${getSubTotal("closed")}</td>
            <td class="text-right" style="mso-number-format:'#,##0';">${Number(getSubTotal("disbursed"))}</td><td class="text-right" style="mso-number-format:'#,##0';">${Number(getSubTotal("outstanding"))}</td>
            <td class="text-right" style="mso-number-format:'#,##0';">${Number(getSubTotal("profit"))}</td><td class="text-right" style="mso-number-format:'#,##0';">${Number(getSubTotal("customer_debt"))}</td>
        </tr>
        <tr><td colspan="9" style="height: 30px;"></td></tr>
        <tr><td colspan="3" class="text-center font-bold">NGƯỜI LẬP BIỂU</td><td colspan="3" class="text-center font-bold">KẾ TOÁN TRƯỜNG</td><td colspan="3" class="text-center font-bold">GIÁM ĐỐC</td></tr>
    </table>
</body>
</html>`;

    const blob = new Blob([excelHTML], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BaoCao_TongKetLoiNhuan_${startDate}_${endDate}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 p-2 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Tổng Kết Lợi Nhuận
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Xem báo cáo hiệu quả tài chính, tiền giải ngân/nhận vốn mới, dư nợ hiện tại và lợi nhuận (lãi thực thu) của chi nhánh.
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
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/65 border border-slate-200/80 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110" />
            <div className="p-3 bg-amber-500/10 rounded-2xl w-fit text-amber-500 mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Giải Ngân / Nhận Vốn Mới</p>
            <h2 className="text-2xl font-black text-slate-800 mt-2">{formatCurrency(getSubTotal("disbursed"))}</h2>
            <p className="text-slate-500 text-xs mt-1">Trong khoảng thời gian chọn</p>
          </div>

          <div className="bg-white/65 border border-slate-200/80 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110" />
            <div className="p-3 bg-blue-500/10 rounded-2xl w-fit text-blue-500 mb-4">
              <DollarSign className="w-6 h-6" />
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Tổng Dư Nợ / Vốn Hiện Tại</p>
            <h2 className="text-2xl font-black text-slate-800 mt-2">{formatCurrency(getSubTotal("outstanding"))}</h2>
            <p className="text-slate-500 text-xs mt-1">Nợ gốc, trả góp & vốn góp đầu tư</p>
          </div>

          <div className="bg-white/65 border border-slate-200/80 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110" />
            <div className="p-3 bg-emerald-500/10 rounded-2xl w-fit text-emerald-500 mb-4">
              <Award className="w-6 h-6" />
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Tiền Lãi Đã Thu</p>
            <h2 className="text-2xl font-black text-emerald-400 mt-2">{formatCurrency(getSubTotal("profit"))}</h2>
            <p className="text-slate-500 text-xs mt-1">Tổng lãi & chênh lệch trả góp thu được</p>
          </div>

          <div className="bg-white/65 border border-slate-200/80 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110" />
            <div className="p-3 bg-red-500/10 rounded-2xl w-fit text-red-500 mb-4">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Khách Hàng Nợ Lại</p>
            <h2 className="text-2xl font-black text-red-400 mt-2">{formatCurrency(getSubTotal("customer_debt"))}</h2>
            <p className="text-slate-500 text-xs mt-1">Tiền khách nợ chậm đóng lãi</p>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 backdrop-blur-lg space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">
            Thống Kê Sản Phẩm Kinh Doanh
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

        {loading || !data ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-amber-500"></span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full text-slate-600">
              <thead>
                <tr className="border-b border-slate-200/80/60 text-slate-500 text-xs">
                  <th>Loại Hình</th>
                  <th>Tổng Số HĐ</th>
                  <th>HĐ Mới</th>
                  <th>HĐ Cũ</th>
                  <th>Đang Hoạt Động</th>
                  <th>Đang Nợ Lãi</th>
                  <th>Quá Hạn</th>
                  <th>Tất Toán</th>
                  <th>Thanh Lý</th>
                  <th>Giải Ngân / Nhận Vốn</th>
                  <th>Dư Nợ / Vốn Hiện Tại</th>
                  <th>Lãi Đã Thu</th>
                  <th>Khách Nợ</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {/* Pawn Row */}
                <tr className="border-b border-slate-200/40 hover:bg-slate-50/50">
                  <td className="font-bold text-amber-600">Cầm đồ</td>
                  <td>{data.pawn.total}</td>
                  <td>{data.pawn.new}</td>
                  <td>{data.pawn.old}</td>
                  <td>{data.pawn.active}</td>
                  <td>{data.pawn.debt}</td>
                  <td className="text-red-400">{data.pawn.overdue}</td>
                  <td>{data.pawn.closed}</td>
                  <td>{data.pawn.liquidated}</td>
                  <td>{formatCurrency(data.pawn.disbursed)}</td>
                  <td>{formatCurrency(data.pawn.outstanding)}</td>
                  <td className="text-emerald-400 font-semibold">{formatCurrency(data.pawn.profit)}</td>
                  <td className="text-red-400">{formatCurrency(data.pawn.customer_debt)}</td>
                </tr>

                {/* Unsecured Row */}
                <tr className="border-b border-slate-200/40 hover:bg-slate-50/50">
                  <td className="font-bold text-purple-400">Tín chấp</td>
                  <td>{data.unsecured.total}</td>
                  <td>{data.unsecured.new}</td>
                  <td>{data.unsecured.old}</td>
                  <td>{data.unsecured.active}</td>
                  <td>{data.unsecured.debt}</td>
                  <td className="text-red-400">{data.unsecured.overdue}</td>
                  <td>{data.unsecured.closed}</td>
                  <td>{data.unsecured.liquidated}</td>
                  <td>{formatCurrency(data.unsecured.disbursed)}</td>
                  <td>{formatCurrency(data.unsecured.outstanding)}</td>
                  <td className="text-emerald-400 font-semibold">{formatCurrency(data.unsecured.profit)}</td>
                  <td className="text-red-400">{formatCurrency(data.unsecured.customer_debt)}</td>
                </tr>

                {/* Installment Row */}
                <tr className="border-b border-slate-200/40 hover:bg-slate-50/50">
                  <td className="font-bold text-blue-400">Trả góp</td>
                  <td>{data.installment.total}</td>
                  <td>{data.installment.new}</td>
                  <td>{data.installment.old}</td>
                  <td>{data.installment.active}</td>
                  <td>{data.installment.debt}</td>
                  <td className="text-red-400">{data.installment.overdue}</td>
                  <td>{data.installment.closed}</td>
                  <td>—</td>
                  <td>{formatCurrency(data.installment.disbursed)}</td>
                  <td>{formatCurrency(data.installment.outstanding)}</td>
                  <td className="text-emerald-400 font-semibold">{formatCurrency(data.installment.profit)}</td>
                  <td className="text-red-400">{formatCurrency(data.installment.customer_debt)}</td>
                </tr>

                {/* Capital Row */}
                {data.capital && (
                  <tr className="border-b border-slate-200/40 hover:bg-slate-50/50">
                    <td className="font-bold text-emerald-600">Nguồn vốn (Góp vốn)</td>
                    <td>{data.capital.total}</td>
                    <td>{data.capital.new}</td>
                    <td>{data.capital.old}</td>
                    <td>{data.capital.active}</td>
                    <td>{data.capital.debt || 0}</td>
                    <td className="text-red-400">{data.capital.overdue || 0}</td>
                    <td>{data.capital.closed}</td>
                    <td>—</td>
                    <td>{formatCurrency(data.capital.disbursed)}</td>
                    <td>{formatCurrency(data.capital.outstanding)}</td>
                    <td className="text-emerald-400 font-semibold">{formatCurrency(data.capital.profit || 0)}</td>
                    <td className="text-red-400">{formatCurrency(data.capital.customer_debt || 0)}</td>
                  </tr>
                )}

                {/* Total Row */}
                <tr className="border-t border-slate-200 bg-white/50 font-bold text-slate-800">
                  <td>Tổng Cộng</td>
                  <td>{getSubTotal("total")}</td>
                  <td>{getSubTotal("new")}</td>
                  <td>{getSubTotal("old")}</td>
                  <td>{getSubTotal("active")}</td>
                  <td>{getSubTotal("debt")}</td>
                  <td className="text-red-400">{getSubTotal("overdue")}</td>
                  <td>{getSubTotal("closed")}</td>
                  <td>{Number(data.pawn.liquidated) + Number(data.unsecured.liquidated)}</td>
                  <td>{formatCurrency(getSubTotal("disbursed"))}</td>
                  <td>{formatCurrency(getSubTotal("outstanding"))}</td>
                  <td className="text-emerald-400">{formatCurrency(getSubTotal("profit"))}</td>
                  <td className="text-red-400">{formatCurrency(getSubTotal("customer_debt"))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
