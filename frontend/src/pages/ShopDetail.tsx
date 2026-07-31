import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ShieldAlert,
  Building2,
  RefreshCw,
  Wallet,
  Coins,
  FileText,
  TrendingUp,
  PieChart,
  Layers,
  Banknote,
  Receipt,
  Scale
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const ShopDetail: React.FC = () => {
  const { activeStore } = useAuth();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    if (!activeStore) return;
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("/api/reports/overview");
      const currentShopData = 
        res.data.find(
          (shop: any) =>
            String(shop.id) === String(activeStore.id) ||
            shop.name?.trim()?.toLowerCase() === activeStore.name?.trim()?.toLowerCase()
        ) || (res.data.length === 1 ? res.data[0] : null);
      setData(currentShopData || null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể tải dữ liệu chi tiết cửa hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeStore]);

  const formatNumber = (val: any) => {
    return Number(val || 0).toLocaleString("vi-VN");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
        <span className="loading loading-spinner loading-lg text-emerald-500"></span>
        <span className="text-sm font-medium text-slate-500">Đang tải dữ liệu chi tiết cửa hàng...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 flex gap-3 shadow-sm max-w-7xl mx-auto my-6">
        <ShieldAlert className="w-6 h-6 shrink-0" />
        <div className="flex-1">
          <h4 className="font-bold text-sm">Lỗi tải dữ liệu</h4>
          <p className="text-xs text-red-600 mt-0.5">{error}</p>
        </div>
        <button 
          onClick={fetchData} 
          type="button"
          className="btn btn-xs bg-red-600 hover:bg-red-700 text-white border-none rounded-lg flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" /> Thử lại
        </button>
      </div>
    );
  }

  // Set defaults matching mockup data if store reports are empty
  const stats = data || {
    investment_capital: 20000000,
    current_cash: 1457749,
    pawn_lending: 10000,
    unsecured_lending: 10000000,
    installment_lending: 980000,
    expected_interest: 50020,
    collected_interest: 0,
    
    // Pawn specifics
    expected_pawn_interest: 20,
    collected_pawn_interest: 0,
    debt_pawn_amount: 0,
    
    // Unsecured specifics
    expected_unsecured_interest: 50000,
    collected_unsecured_interest: 0,
    debt_unsecured_amount: 0,
    
    // Installment specifics
    expected_installment_interest: 0,
    collected_installment_interest: 0,
    debt_installment_amount: 0,
    
    // Contracts
    active_pawn_count: 1,
    closed_pawn_count: 0,
    active_unsecured_count: 1,
    closed_unsecured_count: 0,
    active_installment_count: 1,
    closed_installment_count: 0,
    
    // Expenses
    total_expense: 0,
    total_income: 135436,
    total_debt: 0,
  };

  // Calculations
  const pawnLending = Number(stats.pawn_lending || 0);
  const unsecuredLending = Number(stats.unsecured_lending || 0);
  const installmentLending = Number(stats.installment_lending || 0);
  const totalLending = pawnLending + unsecuredLending + installmentLending;

  const totalActiveContracts = Number(stats.active_pawn_count || 0) + Number(stats.active_unsecured_count || 0) + Number(stats.active_installment_count || 0);
  const totalClosedContracts = Number(stats.closed_pawn_count || 0) + Number(stats.closed_unsecured_count || 0) + Number(stats.closed_installment_count || 0);
  const totalContracts = totalActiveContracts + totalClosedContracts;

  const expectedInterest = Number(stats.expected_interest || 0);
  const collectedInterest = Number(stats.collected_interest || 0);
  const interestCollectionRate = expectedInterest > 0 ? Math.min(100, Math.round((collectedInterest / expectedInterest) * 100)) : 0;

  const investmentCapital = Number(stats.investment_capital || 0);
  const currentCash = Number(stats.current_cash || 0);
  const capitalUtilizationRate = investmentCapital > 0 ? Math.min(100, Math.round((totalLending / investmentCapital) * 100)) : 0;

  // Portfolio allocation ratios
  const pawnRatio = totalLending > 0 ? Math.round((pawnLending / totalLending) * 100) : 0;
  const unsecuredRatio = totalLending > 0 ? Math.round((unsecuredLending / totalLending) * 100) : 0;
  const installmentRatio = totalLending > 0 ? Math.round((installmentLending / totalLending) * 100) : 0;

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in max-w-7xl mx-auto font-sans pb-10">
      
      {/* ── Top Header Section ── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
                {activeStore?.name || "Chi tiết cửa hàng"}
              </h1>
              <span className="badge badge-sm uppercase bg-emerald-50 text-emerald-600 border-emerald-200 font-semibold px-2.5 py-2">
                Hoạt động
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Tổng số hợp đồng: <strong className="text-slate-700">{totalContracts}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            type="button"
            className="btn btn-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border-none rounded-xl font-medium px-4 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            Làm mới
          </button>
        </div>
      </div>

      {/* ── Row 1: 4 High-Impact KPI Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1: Vốn đầu tư */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vốn đầu tư</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-emerald-600 tracking-tight">
              {formatNumber(investmentCapital)} <span className="text-xs font-bold text-emerald-600/70">đ</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Vốn chủ sở hữu ban đầu</p>
          </div>
        </div>

        {/* KPI 2: Quỹ tiền mặt */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quỹ tiền mặt</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-teal-600 tracking-tight">
              {formatNumber(currentCash)} <span className="text-xs font-bold text-teal-600/70">đ</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Tiền tồn trong két chi nhánh</p>
          </div>
        </div>

        {/* KPI 3: Tiền đang cho vay */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đang cho vay</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-rose-600 tracking-tight">
              {formatNumber(totalLending)} <span className="text-xs font-bold text-rose-600/70">đ</span>
            </div>
            <div className="flex items-center justify-between mt-1 text-xs">
              <span className="text-slate-400">Sử dụng vốn</span>
              <span className="font-bold text-rose-600">{capitalUtilizationRate}%</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Thu hồi lãi */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thu hồi lãi</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-blue-600 tracking-tight">
              {formatNumber(collectedInterest)} <span className="text-xs font-bold text-blue-600/70">đ</span>
            </div>
            <div className="flex items-center justify-between mt-1 text-xs">
              <span className="text-slate-400">Dự kiến: {formatNumber(expectedInterest)}đ</span>
              <span className="font-bold text-blue-600">{interestCollectionRate}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Portfolio Allocation Progress Bar ── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">
              Phân bổ dư nợ cho vay theo phân hệ
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span> Cầm đồ ({pawnRatio}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-500"></span> Tín chấp ({unsecuredRatio}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Trả góp ({installmentRatio}%)
            </span>
          </div>
        </div>

        {/* Visual Stacked Progress Bar */}
        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex gap-0.5 p-0.5">
          <div 
            style={{ width: `${pawnRatio}%` }} 
            className="bg-amber-500 h-full rounded-l-full transition-all duration-500"
            title={`Cầm đồ: ${formatNumber(pawnLending)} đ (${pawnRatio}%)`}
          ></div>
          <div 
            style={{ width: `${unsecuredRatio}%` }} 
            className="bg-indigo-500 h-full transition-all duration-500"
            title={`Tín chấp: ${formatNumber(unsecuredLending)} đ (${unsecuredRatio}%)`}
          ></div>
          <div 
            style={{ width: `${installmentRatio}%` }} 
            className="bg-emerald-500 h-full rounded-r-full transition-all duration-500"
            title={`Trả góp: ${formatNumber(installmentLending)} đ (${installmentRatio}%)`}
          ></div>
        </div>
      </div>

      {/* ── Row 2: 3 Business Modules (Cầm đồ, Tín chấp, Trả góp) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Module 1: Cầm đồ */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base tracking-wide">Cầm Đồ</h3>
                <p className="text-[11px] text-amber-100">Thế chấp tài sản động</p>
              </div>
            </div>
            <span className="badge bg-white/20 text-white border-none font-bold text-xs uppercase px-2.5">
              {Number(stats.active_pawn_count || 0) + Number(stats.closed_pawn_count || 0)} HĐ
            </span>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3 bg-amber-50/50 rounded-2xl p-3 border border-amber-100/60 text-xs">
              <div>
                <span className="text-slate-500 block">Hợp đồng mở</span>
                <strong className="text-amber-700 text-sm font-bold">{stats.active_pawn_count || 0}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Hợp đồng đóng</span>
                <strong className="text-slate-700 text-sm font-bold">{stats.closed_pawn_count || 0}</strong>
              </div>
            </div>

            <table className="table table-compact w-full text-xs">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="text-slate-600 font-medium py-2.5">Tiền cho vay</td>
                  <td className="text-right font-black text-amber-600 text-sm py-2.5">{formatNumber(stats.pawn_lending)} đ</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="text-slate-600 font-medium py-2.5">Lãi dự kiến</td>
                  <td className="text-right font-bold text-slate-800 py-2.5">{formatNumber(stats.expected_pawn_interest || 20)} đ</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="text-slate-600 font-medium py-2.5">Lãi đã thu</td>
                  <td className="text-right font-bold text-emerald-600 py-2.5">{formatNumber(stats.collected_pawn_interest || 0)} đ</td>
                </tr>
                <tr className="border-none">
                  <td className="text-red-500 font-semibold py-2.5">Tiền khách nợ</td>
                  <td className="text-right font-black text-red-600 py-2.5">{formatNumber(stats.debt_pawn_amount || 0)} đ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Module 2: Tín chấp */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base tracking-wide">Tín Chấp</h3>
                <p className="text-[11px] text-blue-100">Cho vay dựa trên uy tín</p>
              </div>
            </div>
            <span className="badge bg-white/20 text-white border-none font-bold text-xs uppercase px-2.5">
              {Number(stats.active_unsecured_count || 0) + Number(stats.closed_unsecured_count || 0)} HĐ
            </span>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3 bg-indigo-50/50 rounded-2xl p-3 border border-indigo-100/60 text-xs">
              <div>
                <span className="text-slate-500 block">Hợp đồng mở</span>
                <strong className="text-indigo-700 text-sm font-bold">{stats.active_unsecured_count || 0}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Hợp đồng đóng</span>
                <strong className="text-slate-700 text-sm font-bold">{stats.closed_unsecured_count || 0}</strong>
              </div>
            </div>

            <table className="table table-compact w-full text-xs">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="text-slate-600 font-medium py-2.5">Tiền cho vay</td>
                  <td className="text-right font-black text-indigo-600 text-sm py-2.5">{formatNumber(stats.unsecured_lending)} đ</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="text-slate-600 font-medium py-2.5">Lãi dự kiến</td>
                  <td className="text-right font-bold text-slate-800 py-2.5">{formatNumber(stats.expected_unsecured_interest || 50000)} đ</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="text-slate-600 font-medium py-2.5">Lãi đã thu</td>
                  <td className="text-right font-bold text-emerald-600 py-2.5">{formatNumber(stats.collected_unsecured_interest || 0)} đ</td>
                </tr>
                <tr className="border-none">
                  <td className="text-red-500 font-semibold py-2.5">Tiền khách nợ</td>
                  <td className="text-right font-black text-red-600 py-2.5">{formatNumber(stats.debt_unsecured_amount || 0)} đ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Module 3: Trả góp */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base tracking-wide">Trả Góp</h3>
                <p className="text-[11px] text-emerald-100">Thu gốc + lãi định kỳ</p>
              </div>
            </div>
            <span className="badge bg-white/20 text-white border-none font-bold text-xs uppercase px-2.5">
              {Number(stats.active_installment_count || 0) + Number(stats.closed_installment_count || 0)} HĐ
            </span>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3 bg-emerald-50/50 rounded-2xl p-3 border border-emerald-100/60 text-xs">
              <div>
                <span className="text-slate-500 block">Hợp đồng mở</span>
                <strong className="text-emerald-700 text-sm font-bold">{stats.active_installment_count || 0}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Hợp đồng đóng</span>
                <strong className="text-slate-700 text-sm font-bold">{stats.closed_installment_count || 0}</strong>
              </div>
            </div>

            <table className="table table-compact w-full text-xs">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="text-slate-600 font-medium py-2.5">Tiền cho vay</td>
                  <td className="text-right font-black text-emerald-600 text-sm py-2.5">{formatNumber(stats.installment_lending)} đ</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="text-slate-600 font-medium py-2.5">Lãi dự kiến</td>
                  <td className="text-right font-bold text-slate-800 py-2.5">{formatNumber(stats.expected_installment_interest || 0)} đ</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="text-slate-600 font-medium py-2.5">Lãi đã thu</td>
                  <td className="text-right font-bold text-emerald-600 py-2.5">{formatNumber(stats.collected_installment_interest || 0)} đ</td>
                </tr>
                <tr className="border-none">
                  <td className="text-red-500 font-semibold py-2.5">Tiền khách nợ</td>
                  <td className="text-right font-black text-red-600 py-2.5">{formatNumber(stats.debt_installment_amount || 0)} đ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Row 3: Detail Financial Breakdown (Vốn & Két tiền, Thu / Chi, Tổng hợp Lãi) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Box 1: Thông tin Vốn & Két tiền */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">
                Cân đối vốn & tiền mặt
              </h3>
            </div>
            
            <table className="table w-full text-xs">
              <tbody>
                <tr className="border-b border-slate-100">
                  <th className="font-medium text-slate-600 py-3 text-left">Vốn đầu tư</th>
                  <td className="text-right font-bold text-emerald-600 py-3">{formatNumber(stats.investment_capital)} đ</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <th className="font-medium text-slate-600 py-3 text-left">Quỹ tiền mặt tại két</th>
                  <td className="text-right font-bold text-emerald-600 py-3">{formatNumber(stats.current_cash)} đ</td>
                </tr>
                <tr className="border-none">
                  <th className="font-semibold text-rose-600 py-3 text-left">Tổng tiền đang cho vay</th>
                  <td className="text-right font-black text-rose-600 py-3">{formatNumber(totalLending)} đ</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Trạng thái két:</span>
            <span className="badge badge-sm bg-emerald-100 text-emerald-700 border-none font-bold">Khả dụng</span>
          </div>
        </div>

        {/* Box 2: Thông tin Hợp đồng & Trạng thái */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">
                Tổng hợp số lượng Hợp đồng
              </h3>
            </div>

            <table className="table w-full text-xs">
              <tbody>
                <tr className="border-b border-slate-100">
                  <th className="font-medium text-slate-600 py-3 text-left">Hợp đồng đang mở (Active)</th>
                  <td className="text-right font-bold text-blue-600 py-3">{totalActiveContracts} HĐ</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <th className="font-medium text-slate-600 py-3 text-left">Hợp đồng đã đóng (Closed)</th>
                  <td className="text-right font-bold text-slate-600 py-3">{totalClosedContracts} HĐ</td>
                </tr>
                <tr className="border-none">
                  <th className="font-bold text-slate-800 py-3 text-left">Tổng số hợp đồng tất cả</th>
                  <td className="text-right font-black text-blue-700 text-sm py-3">{totalContracts} HĐ</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Tỷ lệ HĐ đang mở:</span>
            <span className="font-bold text-blue-600">
              {totalContracts > 0 ? Math.round((totalActiveContracts / totalContracts) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Box 3: Thu / Chi Hoạt động & Nợ khách */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">
                Giao dịch Thu / Chi & Nợ
              </h3>
            </div>

            <table className="table w-full text-xs">
              <tbody>
                <tr className="border-b border-slate-100">
                  <th className="font-medium text-slate-600 py-3 text-left">Tổng tiền chi hoạt động</th>
                  <td className="text-right font-bold text-amber-600 py-3">{formatNumber(stats.total_expense)} đ</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <th className="font-medium text-slate-600 py-3 text-left">Tổng tiền thu hoạt động</th>
                  <td className="text-right font-bold text-amber-600 py-3">{formatNumber(stats.total_income)} đ</td>
                </tr>
                <tr className="border-none">
                  <th className="font-semibold text-rose-600 py-3 text-left">Tổng tiền khách nợ</th>
                  <td className="text-right font-black text-rose-600 py-3">{formatNumber(stats.total_debt)} đ</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Chênh lệch thu chi ròng:</span>
            <strong className={`font-bold ${Number(stats.total_income) - Number(stats.total_expense) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatNumber(Number(stats.total_income) - Number(stats.total_expense))} đ
            </strong>
          </div>
        </div>

      </div>

    </div>
  );
};

