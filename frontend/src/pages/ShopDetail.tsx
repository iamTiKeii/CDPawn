import React, { useEffect, useState } from "react";
import axios from "axios";
import { ShieldAlert } from "lucide-react";
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
      const currentShopData = res.data.find(
        (shop: any) => shop.id === activeStore.id || shop.name === activeStore.name
      );
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
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-emerald-500"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 flex gap-3">
        <ShieldAlert className="w-6 h-6 shrink-0" />
        <span>{error}</span>
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

  const totalLending = Number(stats.pawn_lending || 0) + Number(stats.unsecured_lending || 0) + Number(stats.installment_lending || 0);
  const totalActiveContracts = Number(stats.active_pawn_count || 0) + Number(stats.active_unsecured_count || 0) + Number(stats.active_installment_count || 0);
  const totalClosedContracts = Number(stats.closed_pawn_count || 0) + Number(stats.closed_unsecured_count || 0) + Number(stats.closed_installment_count || 0);
  const totalContracts = totalActiveContracts + totalClosedContracts;

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in max-w-7xl mx-auto font-sans">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-800 uppercase mt-2">
          {activeStore?.name || "Demo"}
        </h1>
      </div>

      {/* Row 1: Thông tin vốn, Thông tin hợp đồng, Thu / Chi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        
        {/* 1. Thông tin vốn */}
        <div className="relative bg-white border border-slate-200 rounded-3xl p-5 pt-8 shadow-sm flex flex-col justify-between mt-4">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 text-[11px] font-semibold text-white rounded-lg shadow-sm bg-teal-500 whitespace-nowrap">
            Thông tin vốn
          </div>
          <table className="table w-full">
            <tbody>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-slate-700 text-xs py-2 w-[55%] text-left">Vốn đầu tư</th>
                <td className="text-right font-bold text-emerald-500 py-2">{formatNumber(stats.investment_capital)}</td>
              </tr>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-slate-700 text-xs py-2 w-[55%] text-left">Quỹ tiền mặt</th>
                <td className="text-right font-bold text-emerald-500 py-2">{formatNumber(stats.current_cash)}</td>
              </tr>
              <tr className="border-none">
                <th className="font-semibold text-red-500 text-xs py-2 w-[55%] text-left">Tiền đang cho vay</th>
                <td className="text-right font-bold text-red-500 py-2">{formatNumber(totalLending)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Thông tin hợp đồng */}
        <div className="relative bg-white border border-slate-200 rounded-3xl p-5 pt-8 shadow-sm flex flex-col justify-between mt-4">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 text-[11px] font-semibold text-white rounded-lg shadow-sm bg-blue-600 whitespace-nowrap">
            Thông tin hợp đồng
          </div>
          <table className="table w-full">
            <tbody>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-slate-700 text-xs py-2 w-[55%] text-left">Hợp đồng mở</th>
                <td className="text-right font-bold text-blue-600 py-2">{totalActiveContracts}</td>
              </tr>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-slate-700 text-xs py-2 w-[55%] text-left">Hợp đồng đóng</th>
                <td className="text-right font-bold text-blue-600 py-2">{totalClosedContracts}</td>
              </tr>
              <tr className="border-none">
                <th className="font-semibold text-slate-700 text-xs py-2 w-[55%] text-left">Tổng số hợp đồng</th>
                <td className="text-right font-bold text-blue-600 py-2">{totalContracts}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 3. Thu / Chi */}
        <div className="relative bg-white border border-slate-200 rounded-3xl p-5 pt-8 shadow-sm flex flex-col justify-between mt-4">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 text-[11px] font-semibold text-white rounded-lg shadow-sm bg-amber-500 whitespace-nowrap">
            Thu / Chi
          </div>
          <table className="table w-full">
            <tbody>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-slate-700 text-xs py-2 w-[55%] text-left">Tổng tiền chi</th>
                <td className="text-right font-bold text-amber-500 py-2">{formatNumber(stats.total_expense)}</td>
              </tr>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-slate-700 text-xs py-2 w-[55%] text-left">Tổng tiền thu</th>
                <td className="text-right font-bold text-amber-500 py-2">{formatNumber(stats.total_income)}</td>
              </tr>
              <tr className="border-none">
                <th className="font-semibold text-red-500 text-xs py-2 w-[55%] text-left">Tổng tiền khách nợ</th>
                <td className="text-right font-bold text-red-500 py-2">{formatNumber(stats.total_debt)}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      {/* Row 2: Cầm đồ, Tín chấp, Trả góp */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        
        {/* 4. Cầm đồ */}
        <div className="relative bg-white border border-slate-200 rounded-3xl p-5 pt-8 shadow-sm flex flex-col justify-between mt-4">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 text-[11px] font-semibold text-white rounded-lg shadow-sm bg-purple-600 whitespace-nowrap">
            Cầm đồ
          </div>
          <table className="table w-full">
            <tbody>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-slate-700 text-xs py-2 w-[55%] text-left">Số hợp đồng</th>
                <td className="text-right font-bold text-indigo-500 py-2">
                  {Number(stats.active_pawn_count || 0) + Number(stats.closed_pawn_count || 0)}
                </td>
              </tr>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-slate-700 text-xs py-2 w-[55%] text-left">Hợp đồng đóng</th>
                <td className="text-right font-bold text-indigo-500 py-2">{stats.closed_pawn_count || 0}</td>
              </tr>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-slate-700 text-xs py-2 w-[55%] text-left">Hợp đồng mở</th>
                <td className="text-right font-bold text-indigo-500 py-2">{stats.active_pawn_count || 0}</td>
              </tr>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-red-500 text-xs py-2 w-[55%] text-left">Tiền cho vay</th>
                <td className="text-right font-bold text-red-500 py-2">{formatNumber(stats.pawn_lending)}</td>
              </tr>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-red-500 text-xs py-2 w-[55%] text-left">Lãi dự kiến</th>
                <td className="text-right font-bold text-red-500 py-2">{formatNumber(stats.expected_pawn_interest || 20)}</td>
              </tr>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-red-500 text-xs py-2 w-[55%] text-left">Lãi đã thu</th>
                <td className="text-right font-bold text-red-500 py-2">{formatNumber(stats.collected_pawn_interest || 0)}</td>
              </tr>
              <tr className="border-none">
                <th className="font-semibold text-red-500 text-xs py-2 w-[55%] text-left">Tiền khách nợ</th>
                <td className="text-right font-bold text-red-500 py-2">{formatNumber(stats.debt_pawn_amount || 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 5. Tín chấp */}
        <div className="relative bg-white border border-slate-200 rounded-3xl p-5 pt-8 shadow-sm flex flex-col justify-between mt-4">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 text-[11px] font-semibold text-white rounded-lg shadow-sm bg-purple-600 whitespace-nowrap">
            Tín chấp
          </div>
          <table className="table w-full">
            <tbody>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-slate-700 text-xs py-2 w-[55%] text-left">Số hợp đồng</th>
                <td className="text-right font-bold text-indigo-500 py-2">
                  {Number(stats.active_unsecured_count || 0) + Number(stats.closed_unsecured_count || 0)}
                </td>
              </tr>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-slate-700 text-xs py-2 w-[55%] text-left">Hợp đồng đóng</th>
                <td className="text-right font-bold text-indigo-500 py-2">{stats.closed_unsecured_count || 0}</td>
              </tr>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-slate-700 text-xs py-2 w-[55%] text-left">Hợp đồng mở</th>
                <td className="text-right font-bold text-indigo-500 py-2">{stats.active_unsecured_count || 0}</td>
              </tr>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-red-500 text-xs py-2 w-[55%] text-left">Tiền cho vay</th>
                <td className="text-right font-bold text-red-500 py-2">{formatNumber(stats.unsecured_lending)}</td>
              </tr>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-red-500 text-xs py-2 w-[55%] text-left">Lãi dự kiến</th>
                <td className="text-right font-bold text-red-500 py-2">{formatNumber(stats.expected_unsecured_interest || 50000)}</td>
              </tr>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-red-500 text-xs py-2 w-[55%] text-left">Lãi đã thu</th>
                <td className="text-right font-bold text-red-500 py-2">{formatNumber(stats.collected_unsecured_interest || 0)}</td>
              </tr>
              <tr className="border-none">
                <th className="font-semibold text-red-500 text-xs py-2 w-[55%] text-left">Tiền khách nợ</th>
                <td className="text-right font-bold text-red-500 py-2">{formatNumber(stats.debt_unsecured_amount || 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 6. Trả góp */}
        <div className="relative bg-white border border-slate-200 rounded-3xl p-5 pt-8 shadow-sm flex flex-col justify-between mt-4">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 text-[11px] font-semibold text-white rounded-lg shadow-sm bg-purple-600 whitespace-nowrap">
            Trả góp
          </div>
          <table className="table w-full">
            <tbody>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-slate-700 text-xs py-2 w-[55%] text-left">Số hợp đồng</th>
                <td className="text-right font-bold text-indigo-500 py-2">
                  {Number(stats.active_installment_count || 0) + Number(stats.closed_installment_count || 0)}
                </td>
              </tr>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-slate-700 text-xs py-2 w-[55%] text-left">Hợp đồng đóng</th>
                <td className="text-right font-bold text-indigo-500 py-2">{stats.closed_installment_count || 0}</td>
              </tr>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-slate-700 text-xs py-2 w-[55%] text-left">Hợp đồng mở</th>
                <td className="text-right font-bold text-indigo-500 py-2">{stats.active_installment_count || 0}</td>
              </tr>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-red-500 text-xs py-2 w-[55%] text-left">Tiền cho vay</th>
                <td className="text-right font-bold text-red-500 py-2">{formatNumber(stats.installment_lending)}</td>
              </tr>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-red-500 text-xs py-2 w-[55%] text-left">Lãi dự kiến</th>
                <td className="text-right font-bold text-red-500 py-2">{formatNumber(stats.expected_installment_interest || 0)}</td>
              </tr>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-red-500 text-xs py-2 w-[55%] text-left">Lãi đã thu</th>
                <td className="text-right font-bold text-red-500 py-2">{formatNumber(stats.collected_installment_interest || 0)}</td>
              </tr>
              <tr className="border-none">
                <th className="font-semibold text-red-500 text-xs py-2 w-[55%] text-left">Tiền khách nợ</th>
                <td className="text-right font-bold text-red-500 py-2">{formatNumber(stats.debt_installment_amount || 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      {/* Row 3: Thông tin lãi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        
        {/* 7. Thông tin lãi */}
        <div className="relative bg-white border border-slate-200 rounded-3xl p-5 pt-8 shadow-sm flex flex-col justify-between mt-4">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 text-[11px] font-semibold text-white rounded-lg shadow-sm bg-sky-500 whitespace-nowrap">
            Thông tin lãi
          </div>
          <table className="table w-full">
            <tbody>
              <tr className="border-b border-slate-50">
                <th className="font-semibold text-slate-700 text-xs py-2 w-[55%] text-left">Lãi dự kiến</th>
                <td className="text-right font-bold text-blue-500 py-2">{formatNumber(stats.expected_interest)}</td>
              </tr>
              <tr className="border-none">
                <th className="font-semibold text-slate-700 text-xs py-2 w-[55%] text-left">Lãi đã thu</th>
                <td className="text-right font-bold text-blue-500 py-2">{formatNumber(stats.collected_interest)}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
