import React, { useEffect, useState } from "react";
import axios from "axios";
import { Printer, Calendar, AlertCircle, Coins, Package, UserCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const ShiftHandoverReport: React.FC = () => {
  const { activeStore } = useAuth();

  const todayStr = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(todayStr);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    if (!activeStore) return;
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`/api/reports/shift-handover?date=${date}`);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Lỗi khi tải biên bản bàn giao ca.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeStore, date]);

  const fmt = (val: any) => Number(val || 0).toLocaleString("vi-VN");
  const fmtDate = (d: any) => new Date(d).toLocaleDateString("vi-VN");

  const handlePrint = () => {
    if (!data) return;

    const storeName = activeStore?.name || "Cửa hàng";
    const handoverDate = fmtDate(data.handover_date || date);
    const now = new Date().toLocaleString("vi-VN");

    const cash = data.cash || {};
    const pawnList: any[] = data.assets?.pawn || [];
    const unsecuredList: any[] = data.assets?.unsecured || [];
    const installmentList: any[] = data.assets?.installment || [];

    // Nhóm cầm đồ theo commodity
    const pawnGroups: Record<string, any[]> = {};
    pawnList.forEach((item) => {
      const rawKey = item.commodity?.name || "Khác";
      const key = rawKey.split("|")[0].trim();
      if (!pawnGroups[key]) pawnGroups[key] = [];
      pawnGroups[key].push(item);
    });

    const totalPawnValue = pawnList.reduce((s: number, c: any) => s + Number(c.loan_amount || 0), 0);
    const totalUnsecuredValue = unsecuredList.reduce((s: number, c: any) => s + Number(c.loan_amount || 0), 0);
    const totalInstallmentDisbursed = installmentList.reduce((s: number, c: any) => s + Number(c.disbursed_amount || 0), 0);
    const totalInstallmentRemaining = installmentList.reduce((s: number, c: any) => s + Number(c.remaining_amount || 0), 0);

    // Sinh bảng cầm đồ theo từng nhóm tài sản
    const pawnGroupHTML = Object.entries(pawnGroups).map(([category, items]) => {
      const groupTotal = items.reduce((s, c) => s + Number(c.loan_amount || 0), 0);
      const rows = items.map((item, i) => `
        <tr>
          <td class="text-center">${i + 1}</td>
          <td class="text-center">${item.contract_code}</td>
          <td>${item.customer?.full_name || ""}</td>
          <td class="text-center">${fmtDate(item.loan_date)}</td>
          <td class="text-right">${fmt(item.loan_amount)}</td>
          <td>${item.asset_name || ""}${item.license_plate ? " — " + item.license_plate : ""}</td>
        </tr>
      `).join("");
      return `
        <p style="margin:10px 0 5px 0;font-style:italic;">• ${category}: ${items.length} mã</p>
        <table>
          <thead>
            <tr>
              <th width="5%">STT</th>
              <th width="15%">Mã HĐ</th>
              <th width="22%">Tên KH</th>
              <th width="15%">Ngày cầm</th>
              <th width="20%">Số tiền cầm (đ)</th>
              <th width="23%">Tài sản</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr class="total-row">
              <td colspan="3"></td>
              <td class="text-center"><b>Tổng</b></td>
              <td class="text-right"><b>${fmt(groupTotal)}</b></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      `;
    }).join("") || `<p style="font-style:italic;color:#555;">Không có tài sản cầm đồ.</p>`;

    // Bảng tín chấp
    const unsecuredRows = unsecuredList.map((item, i) => `
      <tr>
        <td class="text-center">${i + 1}</td>
        <td class="text-center">${item.contract_code}</td>
        <td>${item.customer?.full_name || ""}</td>
        <td class="text-center">${fmtDate(item.loan_date)}</td>
        <td class="text-right">${fmt(item.loan_amount)}</td>
        <td class="text-right">${fmt(item.totalRepayment)}</td>
      </tr>
    `).join("") || `<tr><td colspan="6" style="text-align:center;font-style:italic;color:#555;">Không có hợp đồng tín chấp.</td></tr>`;

    // Bảng trả góp
    const installmentRows = installmentList.map((item, i) => `
      <tr>
        <td class="text-center">${i + 1}</td>
        <td class="text-center">${item.contract_code}</td>
        <td>${item.customer_name || ""}</td>
        <td class="text-center">${fmtDate(item.loan_date)}</td>
        <td class="text-right">${fmt(item.disbursed_amount)}</td>
        <td class="text-right">${fmt(item.remaining_amount)}</td>
        <td></td>
      </tr>
    `).join("") || `<tr><td colspan="7" style="text-align:center;font-style:italic;color:#555;">Không có hợp đồng trả góp.</td></tr>`;

    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Biên Bản Bàn Giao Ca</title>
  <style>
    :root { --font-main: 'Times New Roman', Times, serif; }
    body {
      font-family: var(--font-main);
      background-color: #525659;
      margin: 0; padding: 20px;
      font-size: 13pt; color: #000;
    }
    .page-a4 {
      width: 210mm; min-height: 297mm;
      padding: 20mm 15mm;
      margin: 0 auto;
      background: #fff;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
      box-sizing: border-box;
    }
    /* Header chuẩn giống các mẫu khác */
    .company-header { margin-bottom: 10px; }
    .company-header h3 { margin: 0; font-size: 13pt; text-transform: uppercase; }
    .company-header p  { margin: 2px 0; font-size: 11pt; }
    .report-title { text-align: center; margin: 10px 0 20px 0; }
    .report-title h1 { margin: 0 0 6px 0; font-size: 18pt; text-transform: uppercase; }
    .report-title p  { margin: 3px 0; font-style: italic; font-size: 11pt; }
    .section-title {
      font-weight: bold; font-size: 13pt;
      margin: 20px 0 10px 0; text-transform: uppercase;
    }
    .section-subtitle { font-weight: normal; font-style: italic; margin-left: 5px; text-transform: none; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11pt; }
    th, td { border: 1pt solid #000; padding: 6px 8px; vertical-align: middle; }
    th { background-color: #e6e6e6; font-weight: bold; text-align: center; -webkit-print-color-adjust: exact; }
    .table-cash th, .table-cash td { border: none; border-bottom: 1pt dashed #ccc; padding: 9px 5px; }
    .table-cash tr:last-child td { border-bottom: 2pt solid #000; font-weight: bold; }
    .total-row { background-color: #fafafa; }
    .text-center { text-align: center; }
    .text-right  { text-align: right; }
    .text-left   { text-align: left; }
    .signature-grid { display: table; width: 100%; margin-top: 40px; page-break-inside: avoid; }
    .signature-col  { display: table-cell; width: 33.33%; text-align: center; vertical-align: top; }
    .signature-title { font-weight: bold; margin-bottom: 60px; }
    .signature-line  { text-align: left; padding-left: 15%; margin-bottom: 8px; }
    .other-assets    { min-height: 50px; border-bottom: 1pt dotted #000; margin-bottom: 20px; }
    @media print {
      body { background: none; padding: 0; }
      .page-a4 { box-shadow: none; margin: 0; padding: 15mm 12mm; width: 100%; min-height: auto; }
      th { background-color: #e6e6e6 !important; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
<div class="page-a4">

  <div class="company-header">
    <h3>${storeName}</h3>
    <p><strong>Ngày xuất:</strong> ${new Date().toLocaleDateString("vi-VN")}</p>
  </div>

  <div class="report-title">
    <h1>BIÊN BẢN BÀN GIAO CA</h1>
    <p>Ngày bàn giao: <b>${handoverDate}</b> &nbsp;|&nbsp; Thực hiện lúc: <b>${now}</b></p>
  </div>

  <!-- PHẦN I: SỐ TIỀN -->
  <div class="section-title">PHẦN I. SỐ TIỀN BÀN GIAO</div>
  <table class="table-cash">
    <tbody>
      <tr>
        <td>Quỹ tiền mặt đầu ngày</td>
        <td class="text-right">+${fmt(cash.beginning_cash)}</td>
      </tr>
      <tr>
        <td>Biến động Cầm đồ</td>
        <td class="text-right">${cash.pawn_flow >= 0 ? "+" : ""}${fmt(cash.pawn_flow)}</td>
      </tr>
      <tr>
        <td>Biến động Tín chấp</td>
        <td class="text-right">${cash.unsecured_flow >= 0 ? "+" : ""}${fmt(cash.unsecured_flow)}</td>
      </tr>
      <tr>
        <td>Biến động Trả góp</td>
        <td class="text-right">${cash.installment_flow >= 0 ? "+" : ""}${fmt(cash.installment_flow)}</td>
      </tr>
      <tr>
        <td>Thu Chi hoạt động</td>
        <td class="text-right">${cash.voucher_flow >= 0 ? "+" : ""}${fmt(cash.voucher_flow)}</td>
      </tr>
      <tr>
        <td>Nguồn vốn đầu tư</td>
        <td class="text-right">${cash.capital_flow >= 0 ? "+" : ""}${fmt(cash.capital_flow)}</td>
      </tr>
      <tr>
        <td>Tiền mặt còn lại (cuối ca)</td>
        <td class="text-right">+${fmt(cash.ending_cash)}</td>
      </tr>
    </tbody>
  </table>

  <!-- PHẦN II: CẦM ĐỒ -->
  <div class="section-title">
    PHẦN II. BÀN GIAO TÀI SẢN CẦM ĐỒ
    <span class="section-subtitle">: Tổng ${pawnList.length} tài sản — Tổng giá trị ${fmt(totalPawnValue)} đ</span>
  </div>
  ${pawnGroupHTML}

  <!-- PHẦN III: TÍN CHẤP -->
  <div class="section-title">
    PHẦN III. BÀN GIAO HỢP ĐỒNG TÍN CHẤP
    <span class="section-subtitle">: Tổng ${unsecuredList.length} hợp đồng — Giải ngân ${fmt(totalUnsecuredValue)} đ</span>
  </div>
  <table>
    <thead>
      <tr>
        <th width="5%">STT</th>
        <th width="15%">Mã HĐ</th>
        <th width="22%">Tên KH</th>
        <th width="15%">Ngày vay</th>
        <th width="20%">Số tiền vay (đ)</th>
        <th width="23%">Tổng phải thu (đ)</th>
      </tr>
    </thead>
    <tbody>
      ${unsecuredRows}
      ${unsecuredList.length > 0 ? `
      <tr class="total-row">
        <td colspan="3"></td>
        <td class="text-center"><b>Tổng</b></td>
        <td class="text-right"><b>${fmt(totalUnsecuredValue)}</b></td>
        <td></td>
      </tr>` : ""}
    </tbody>
  </table>

  <!-- PHẦN IV: TRẢ GÓP -->
  <div class="section-title">
    PHẦN IV. BÀN GIAO HỢP ĐỒNG TRẢ GÓP
    <span class="section-subtitle">: Tổng ${installmentList.length} hợp đồng — Giải ngân ${fmt(totalInstallmentDisbursed)} đ</span>
  </div>
  <table>
    <thead>
      <tr>
        <th width="5%">STT</th>
        <th width="14%">Mã HĐ</th>
        <th width="18%">Tên KH</th>
        <th width="14%">Ngày vay</th>
        <th width="18%">Tiền giao khách (đ)</th>
        <th width="18%">Còn phải đóng (đ)</th>
        <th width="13%">Ghi chú</th>
      </tr>
    </thead>
    <tbody>
      ${installmentRows}
      ${installmentList.length > 0 ? `
      <tr class="total-row">
        <td colspan="3"></td>
        <td class="text-center"><b>Tổng</b></td>
        <td class="text-right"><b>${fmt(totalInstallmentDisbursed)}</b></td>
        <td class="text-right"><b>${fmt(totalInstallmentRemaining)}</b></td>
        <td></td>
      </tr>` : ""}
    </tbody>
  </table>

  <!-- PHẦN V: TÀI SẢN KHÁC -->
  <div class="section-title">PHẦN V. BÀN GIAO TÀI SẢN KHÁC</div>
  <div class="other-assets"></div>

  <!-- CHỮ KÝ -->
  <div class="signature-grid">
    <div class="signature-col">
      <div class="signature-title">BÊN GIAO</div>
      <div class="signature-line">Họ tên: ..........................</div>
      <div class="signature-line">Chữ ký: ..........................</div>
      <br><br>
      <div class="signature-line">Họ tên: ..........................</div>
      <div class="signature-line">Chữ ký: ..........................</div>
    </div>
    <div class="signature-col">
      <div class="signature-title">BÊN NHẬN</div>
      <div class="signature-line">Họ tên: ..........................</div>
      <div class="signature-line">Chữ ký: ..........................</div>
      <br><br>
      <div class="signature-line">Họ tên: ..........................</div>
      <div class="signature-line">Chữ ký: ..........................</div>
    </div>
    <div class="signature-col">
      <div class="signature-title">ĐẠI DIỆN CÔNG TY</div>
      <div class="signature-line">Họ tên: ..........................</div>
      <div class="signature-line">Chữ ký: ..........................</div>
      <br><br>
      <div class="signature-line">Họ tên: ..........................</div>
      <div class="signature-line">Chữ ký: ..........................</div>
    </div>
  </div>

</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  return (
    <div className="space-y-6 p-2 animate-fade-in">
      {/* Title & Print Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Biên Bản Bàn Giao Ca
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Báo cáo kiểm quỹ két tiền mặt đầu/cuối ca, tài sản thế chấp và hồ sơ đang quản lý tại chi nhánh.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3 py-1.5 focus-within:border-amber-500 transition-colors shadow-sm">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-slate-800 text-xs font-bold focus:outline-none border-none cursor-pointer [color-scheme:light]"
            />
          </div>
          <button
            type="button"
            onClick={handlePrint}
            disabled={!data || loading}
            className="btn btn-warning bg-amber-500 hover:bg-amber-600 border-none text-slate-950 font-bold px-6 rounded-2xl flex items-center gap-2 disabled:opacity-50"
          >
            <Printer className="w-5 h-5" />
            In Biên Bản
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error bg-red-500/10 border-red-500/20 text-red-200 shadow-lg rounded-2xl flex gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading || !data ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-amber-500"></span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cash breakdown */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 backdrop-blur-lg">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              I. Báo Cáo Quỹ Két Tiền Mặt
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Tiền quỹ đầu ngày:</span>
                  <span className="font-bold text-slate-800">+{fmt(data.cash.beginning_cash)} đ</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Biến động Cầm đồ:</span>
                  <span className={`font-bold ${data.cash.pawn_flow >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {data.cash.pawn_flow > 0 ? "+" : ""}{fmt(data.cash.pawn_flow)} đ
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Biến động Tín chấp:</span>
                  <span className={`font-bold ${data.cash.unsecured_flow >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {data.cash.unsecured_flow > 0 ? "+" : ""}{fmt(data.cash.unsecured_flow)} đ
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Biến động Trả góp:</span>
                  <span className={`font-bold ${data.cash.installment_flow >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {data.cash.installment_flow > 0 ? "+" : ""}{fmt(data.cash.installment_flow)} đ
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Thu Chi hoạt động:</span>
                  <span className={`font-bold ${data.cash.voucher_flow >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {data.cash.voucher_flow > 0 ? "+" : ""}{fmt(data.cash.voucher_flow)} đ
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Nguồn vốn đầu tư:</span>
                  <span className={`font-bold ${data.cash.capital_flow >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {data.cash.capital_flow > 0 ? "+" : ""}{fmt(data.cash.capital_flow)} đ
                  </span>
                </div>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex flex-col justify-center">
                <p className="text-amber-500/80 text-xs font-semibold uppercase tracking-wider">Tiền quỹ bàn giao cuối ca</p>
                <h3 className="text-2xl font-black text-amber-600 mt-1">
                  {fmt(data.cash.ending_cash)} đ
                </h3>
              </div>
            </div>
          </div>

          {/* Active Assets Pawn */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 backdrop-blur-lg">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              II. Tài Sản Cầm Cố Đang Lưu Kho
              <span className="text-sm font-normal text-slate-500 ml-2">
                ({data.assets.pawn.length} tài sản — {fmt(data.assets.pawn.reduce((s: number, c: any) => s + Number(c.loan_amount || 0), 0))} đ)
              </span>
            </h3>

            <div className="overflow-x-auto">
              <table className="table w-full text-slate-600 text-xs">
                <thead>
                  <tr className="border-b border-slate-200/60 text-slate-500 text-xs">
                    <th>Mã HĐ</th>
                    <th>Khách Hàng</th>
                    <th>Tài Sản</th>
                    <th>Tiền Cầm</th>
                    <th>Biển Số / Số Khung</th>
                    <th>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  {data.assets.pawn.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-slate-500">Không có tài sản nào lưu kho.</td>
                    </tr>
                  ) : (
                    data.assets.pawn.map((item: any) => (
                      <tr key={item.id} className="border-b border-slate-200/30">
                        <td className="font-bold">{item.contract_code}</td>
                        <td>{item.customer.full_name}</td>
                        <td className="font-semibold">{item.asset_name}</td>
                        <td>{fmt(item.loan_amount)} đ</td>
                        <td>{item.license_plate || "—"}</td>
                        <td>
                          <span className={`badge badge-sm ${item.status === "overdue" ? "badge-error" : "badge-success"}`}>
                            {item.status === "overdue" ? "Quá hạn" : "Đang vay"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Assets Unsecured */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 backdrop-blur-lg">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-500" />
              III. Hồ Sơ Tín Chấp Đang Quản Lý
              <span className="text-sm font-normal text-slate-500 ml-2">
                ({data.assets.unsecured.length} hợp đồng)
              </span>
            </h3>
            <div className="overflow-x-auto">
              <table className="table w-full text-slate-600 text-xs">
                <thead>
                  <tr className="border-b border-slate-200/60 text-slate-500 text-xs">
                    <th>Mã HĐ</th>
                    <th>Khách Hàng</th>
                    <th>Ngày Vay</th>
                    <th>Số Tiền Giải Ngân</th>
                    <th>Tổng Phải Thu</th>
                  </tr>
                </thead>
                <tbody>
                  {data.assets.unsecured.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-slate-500">Không có hợp đồng tín chấp.</td>
                    </tr>
                  ) : data.assets.unsecured.map((item: any) => (
                    <tr key={item.id} className="border-b border-slate-200/30">
                      <td className="font-bold">{item.contract_code}</td>
                      <td>{item.customer.full_name}</td>
                      <td>{new Date(item.loan_date).toLocaleDateString("vi-VN")}</td>
                      <td>{fmt(item.loan_amount)} đ</td>
                      <td className="font-bold text-slate-700">{fmt(item.totalRepayment)} đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Assets Installment */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 backdrop-blur-lg">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-500" />
              IV. Hồ Sơ Trả Góp Đang Quản Lý
              <span className="text-sm font-normal text-slate-500 ml-2">
                ({data.assets.installment.length} hợp đồng)
              </span>
            </h3>
            <div className="overflow-x-auto">
              <table className="table w-full text-slate-600 text-xs">
                <thead>
                  <tr className="border-b border-slate-200/60 text-slate-500 text-xs">
                    <th>Mã HĐ</th>
                    <th>Khách Hàng</th>
                    <th>Ngày Vay</th>
                    <th>Tiền Giao Khách</th>
                    <th>Còn Phải Đóng</th>
                  </tr>
                </thead>
                <tbody>
                  {data.assets.installment.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-slate-500">Không có hợp đồng trả góp.</td>
                    </tr>
                  ) : data.assets.installment.map((item: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-200/30">
                      <td className="font-bold">{item.contract_code}</td>
                      <td>{item.customer_name}</td>
                      <td>{new Date(item.loan_date).toLocaleDateString("vi-VN")}</td>
                      <td>{fmt(item.disbursed_amount)} đ</td>
                      <td className="font-bold text-slate-700">{fmt(item.remaining_amount)} đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
