import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  RefreshCw,
  AlertCircle,
  ArrowRightLeft,
  Download,
  Printer,
  ChevronDown,
  FileSpreadsheet,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { DateRangePicker } from "../../components/shared/DateRangePicker";

export const DailyCashFlowReport: React.FC = () => {
  const { activeStore } = useAuth();
  
  const todayStr = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    if (!activeStore) return;
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`/api/reports/cashflow?startDate=${startDate}&endDate=${endDate}`);
      setList(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Lỗi khi tải báo cáo dòng tiền theo ngày.");
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

  const handleExportHTML = () => {
    const tableRowsHTML = list.length === 0
      ? `<tr><td colSpan="11" class="text-center" style="padding: 15px; color:#6b7280;">Không tìm thấy lịch sử dòng tiền trong khoảng thời gian này.</td></tr>`
      : list.map((item) => `
        <tr>
          <td class="text-center font-bold">${new Date(item.date).toLocaleDateString("vi-VN")}</td>
          <td class="text-right">${formatNumberOnly(item.beginning_cash)}</td>
          <td class="text-right">${formatNumberOnly(item.pawn_flow)}</td>
          <td class="text-right">${formatNumberOnly(item.unsecured_flow)}</td>
          <td class="text-right">${formatNumberOnly(item.installment_flow)}</td>
          <td class="text-right">${formatNumberOnly(item.voucher_flow)}</td>
          <td class="text-right">${formatNumberOnly(item.capital_flow)}</td>
          <td class="text-right font-bold">${formatNumberOnly(item.ending_cash)}</td>
          <td class="text-right">${formatNumberOnly(Number(item.lending.pawn) + Number(item.lending.unsecured) + Number(item.lending.installment))}</td>
          <td class="text-right">${formatNumberOnly(item.capital)}</td>
          <td class="text-right font-bold">${formatNumberOnly(item.total_assets)}</td>
        </tr>
      `).join("");

    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Báo Cáo Dòng Tiền Theo Ngày - Bản In</title>
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
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt; }
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
            <h1>BÁO CÁO DÒNG TIỀN THEO NGÀY</h1>
            <p>Kỳ báo cáo: Từ ngày ${formatDateDisplay(startDate)} đến ngày ${formatDateDisplay(endDate)}</p>
        </div>

        <div class="section-title">NHẬT KÝ DÒNG TIỀN LŨY KẾ HÀNG NGÀY</div>
        <table>
            <thead>
                <tr>
                    <th>Ngày Ghi Nhận</th>
                    <th>Dư Đầu Ngày</th>
                    <th>Phát Sinh Cầm Đồ</th>
                    <th>Phát Sinh Tín Chấp</th>
                    <th>Phát Sinh Trả Góp</th>
                    <th>Thu/Chi Khác</th>
                    <th>Nhận Vốn Góp</th>
                    <th>Dư Cuối Ngày</th>
                    <th>Dư Nợ Cho Vay</th>
                    <th>Vốn Góp Lũy Kế</th>
                    <th>Tổng Tài Sản</th>
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
    let excelRowsHTML = list.length === 0
      ? `<tr><td colspan="11" class="text-center" style="padding:10px;">Không có dữ liệu dòng tiền.</td></tr>`
      : list.map((item) => `
        <tr>
          <td class="text-center font-bold" style="mso-number-format:'\\@';">${new Date(item.date).toLocaleDateString("vi-VN")}</td>
          <td class="text-right" style="mso-number-format:'#,##0';">${Number(item.beginning_cash)}</td>
          <td class="text-right" style="mso-number-format:'#,##0';">${Number(item.pawn_flow)}</td>
          <td class="text-right" style="mso-number-format:'#,##0';">${Number(item.unsecured_flow)}</td>
          <td class="text-right" style="mso-number-format:'#,##0';">${Number(item.installment_flow)}</td>
          <td class="text-right" style="mso-number-format:'#,##0';">${Number(item.voucher_flow)}</td>
          <td class="text-right" style="mso-number-format:'#,##0';">${Number(item.capital_flow)}</td>
          <td class="text-right font-bold" style="mso-number-format:'#,##0';">${Number(item.ending_cash)}</td>
          <td class="text-right" style="mso-number-format:'#,##0';">${Number(item.lending.pawn) + Number(item.lending.unsecured) + Number(item.lending.installment)}</td>
          <td class="text-right" style="mso-number-format:'#,##0';">${Number(item.capital)}</td>
          <td class="text-right font-bold" style="mso-number-format:'#,##0';">${Number(item.total_assets)}</td>
        </tr>
      `).join("");

    let excelHTML = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Báo Cáo Dòng Tiền Theo Ngày</title>
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
        <tr><td colspan="11" class="font-bold">CÔNG TY TNHH ĐẦU TƯ TÀI CHÍNH CDPAWN</td></tr>
        <tr><td colspan="11">Chi nhánh: ${activeStore?.name || "Tất cả chi nhánh"}</td></tr>
        <tr><td colspan="11">Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}</td></tr>
        <tr><td colspan="11"></td></tr>
        <tr><td colspan="11" class="text-center report-title">BÁO CÁO DÒNG TIỀN THEO NGÀY</td></tr>
        <tr><td colspan="11" class="text-center font-italic">Từ ngày ${formatDateDisplay(startDate)} đến ngày ${formatDateDisplay(endDate)}</td></tr>
        <tr><td colspan="11"></td></tr>
        <tr class="grid-header">
            <th>Ngày Ghi Nhận</th><th>Dư Đầu Ngày (VNĐ)</th><th>Phát Sinh Cầm Đồ (VNĐ)</th><th>Phát Sinh Tín Chấp (VNĐ)</th><th>Phát Sinh Trả Góp (VNĐ)</th><th>Thu/Chi Khác (VNĐ)</th><th>Nhận Vốn Góp (VNĐ)</th><th>Dư Cuối Ngày (VNĐ)</th><th>Dư Nợ Cho Vay (VNĐ)</th><th>Vốn Góp Lũy Kế (VNĐ)</th><th>Tổng Tài Sản (VNĐ)</th>
        </tr>
        ${excelRowsHTML}
        <tr><td colspan="11" style="height: 30px;"></td></tr>
        <tr><td colspan="4" class="text-center font-bold">NGƯỜI LẬP BIỂU</td><td colspan="4" class="text-center font-bold">KẾ TOÁN TRƯỞNG</td><td colspan="3" class="text-center font-bold">GIÁM ĐỐC</td></tr>
    </table>
</body>
</html>`;

    const blob = new Blob([excelHTML], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BaoCao_DongTienTheoNgay_${startDate}_${endDate}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 p-2 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Dòng Tiền Theo Ngày
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Báo cáo kiểm toán dòng tiền luân chuyển hàng ngày của chi nhánh: số dư đầu/cuối ngày, phát sinh thu chi và tổng tài sản lưu động.
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

      {/* Main Table */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 backdrop-blur-lg space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-amber-500" />
            Nhật Ký Dòng Tiền Lũy Kế Hàng Ngày
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
            <table className="table w-full text-slate-600 text-xs">
              <thead>
                <tr className="border-b border-slate-200/80/60 text-slate-500">
                  <th>Ngày Ghi Nhận</th>
                  <th>Số Dư Đầu Ngày</th>
                  <th>Phát Sinh Cầm Đồ</th>
                  <th>Phát Sinh Tín Chấp</th>
                  <th>Phát Sinh Trả Góp</th>
                  <th>Chi Hoạt Động (Thu/Chi)</th>
                  <th>Nhận Vốn Góp</th>
                  <th>Số Dư Cuối Ngày</th>
                  <th>Dư Nợ Đang Cho Vay</th>
                  <th>Vốn Góp Lũy Kế</th>
                  <th className="text-right">Tổng Tài Sản Chi Nhánh</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-8 text-slate-500">
                      Không tìm thấy lịch sử dòng tiền trong khoảng thời gian này.
                    </td>
                  </tr>
                ) : (
                  list.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-200/40 hover:bg-slate-50/50">
                      <td className="font-semibold">{new Date(item.date).toLocaleDateString("vi-VN")}</td>
                      <td>{formatCurrency(item.beginning_cash)}</td>
                      <td className={item.pawn_flow >= 0 ? "text-emerald-400" : "text-red-400"}>
                        {item.pawn_flow > 0 ? "+" : ""}{formatCurrency(item.pawn_flow)}
                      </td>
                      <td className={item.unsecured_flow >= 0 ? "text-emerald-400" : "text-red-400"}>
                        {item.unsecured_flow > 0 ? "+" : ""}{formatCurrency(item.unsecured_flow)}
                      </td>
                      <td className={item.installment_flow >= 0 ? "text-emerald-400" : "text-red-400"}>
                        {item.installment_flow > 0 ? "+" : ""}{formatCurrency(item.installment_flow)}
                      </td>
                      <td className={item.voucher_flow >= 0 ? "text-emerald-400" : "text-red-400"}>
                        {item.voucher_flow > 0 ? "+" : ""}{formatCurrency(item.voucher_flow)}
                      </td>
                      <td className={item.capital_flow >= 0 ? "text-emerald-400" : "text-red-400"}>
                        {item.capital_flow > 0 ? "+" : ""}{formatCurrency(item.capital_flow)}
                      </td>
                      <td className="text-emerald-400 font-bold">{formatCurrency(item.ending_cash)}</td>
                      <td>{formatCurrency(Number(item.lending.pawn) + Number(item.lending.unsecured) + Number(item.lending.installment))}</td>
                      <td>{formatCurrency(item.capital)}</td>
                      <td className="text-amber-600 font-extrabold text-right">{formatCurrency(item.total_assets)}</td>
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
