import { ModalPortal } from "../components/shared/ModalPortal";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Wrench,
  X,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Banknote,
  History,
  RefreshCw,
  Search,
  Building2,
  TrendingUp,
  Coins,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { toast } from "../lib/toast";
import { MoneyInput } from "../components/shared/MoneyInput";
import { useAuth } from "../context/AuthContext";
import { formatTransactionType } from "../utils/transactionUtils";

interface CashHistoryItem {
  id: string;
  date: string;
  amount: string;
  type: string;
  description: string;
  created_at: string;
  employee?: {
    full_name: string;
  };
}

export const BeginningCash: React.FC = () => {
  const { activeStore } = useAuth();
  const [currentSummary, setCurrentSummary] = useState<any>(null);
  const [histories, setHistories] = useState<CashHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const setError = (msg: string) => { if (msg) toast.error(msg); };
  const setSuccess = (msg: string) => { if (msg) toast.success(msg); };

  // Modal states
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isBeginningModalOpen, setIsBeginningModalOpen] = useState(false);
  const [modalAmount, setModalAmount] = useState<number>(0);

  // Table Sort and Pagination states
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const fetchData = async () => {
    if (!activeStore) return;
    try {
      setLoading(true);
      setError("");
      
      // Fetch summary
      const summaryRes = await axios.get("/api/cash/summary");
      setCurrentSummary(summaryRes.data);

      // Fetch logs
      const logsRes = await axios.get("/api/cash/history");
      setHistories(logsRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể tải thông tin quỹ đầu ngày.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeStore]);

  // Open modals prefilled
  const handleOpenAdjustModal = () => {
    setError("");
    setSuccess("");
    const current = currentSummary ? Math.round(Number(currentSummary.current_cash)) : 0;
    setModalAmount(current);
    setIsAdjustModalOpen(true);
  };

  const handleOpenBeginningModal = () => {
    setError("");
    setSuccess("");
    const beg = currentSummary ? Math.round(Number(currentSummary.beginning_cash)) : 0;
    setModalAmount(beg);
    setIsBeginningModalOpen(true);
  };

  // Submit handlers
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const newCashVal = modalAmount;
    const currentCashVal = currentSummary ? Number(currentSummary.current_cash) : 0;
    const diff = newCashVal - currentCashVal;

    if (diff === 0) {
      setIsAdjustModalOpen(false);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        amount: Math.abs(diff),
        type: diff > 0 ? "deposit" : "withdraw",
        description: "Nhập lại quỹ tiền mặt",
      };

      await axios.post("/api/cash/adjust", payload);
      setSuccess("Nhập lại quỹ tiền mặt thành công!");
      setIsAdjustModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || "Lỗi khi nhập lại quỹ tiền mặt.");
    } finally {
      setLoading(false);
    }
  };

  const handleBeginningSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const newBegVal = modalAmount;

    try {
      setLoading(true);
      await axios.post("/api/cash/beginning", {
        beginning_cash: newBegVal,
      });
      setSuccess("Cập nhật tiền đầu ngày thành công!");
      setIsBeginningModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || "Lỗi khi cập nhật tiền đầu ngày.");
    } finally {
      setLoading(false);
    }
  };

  // Table sorting & filtering
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const filteredHistories = histories.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const descMatch = item.description?.toLowerCase().includes(term);
    const empMatch = item.employee?.full_name?.toLowerCase().includes(term);
    const typeMatch = item.type?.toLowerCase().includes(term);
    return descMatch || empMatch || typeMatch;
  });

  const sortedHistories = [...filteredHistories].sort((a, b) => {
    let valA: any = a[sortField as keyof typeof a];
    let valB: any = b[sortField as keyof typeof b];

    if (sortField === "employee") {
      valA = a.employee?.full_name || "";
      valB = b.employee?.full_name || "";
    } else if (sortField === "amount") {
      valA = Number(a.amount);
      valB = Number(b.amount);
    } else if (sortField === "created_at") {
      valA = new Date(a.created_at).getTime();
      valB = new Date(b.created_at).getTime();
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Table pagination
  const totalItems = sortedHistories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedHistories.slice(indexOfFirstItem, indexOfLastItem);

  const getAmountColorAndSign = (item: CashHistoryItem) => {
    const amt = Number(item.amount);
    const sign = amt >= 0 ? "+" : "";
    const formatted = sign + amt.toLocaleString("vi-VN") + " đ";

    if (amt < 0) {
      return { className: "text-rose-600 font-bold", text: formatted, icon: <ArrowDownRight className="w-3.5 h-3.5 text-rose-500 inline mr-0.5" /> };
    }

    if (item.type === "beginning_cash_set" || item.description?.includes("đầu ngày")) {
      return { className: "text-emerald-600 font-bold", text: formatted, icon: <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 inline mr-0.5" /> };
    }

    return { className: "text-indigo-600 font-bold", text: formatted, icon: <ArrowUpRight className="w-3.5 h-3.5 text-indigo-500 inline mr-0.5" /> };
  };

  const currentCashVal = currentSummary ? Number(currentSummary.current_cash || 0) : 0;
  const beginningCashVal = currentSummary ? Number(currentSummary.beginning_cash || 0) : 0;

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in max-w-7xl mx-auto font-sans pb-10">
      
      {/* ── Header Section ── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
                Quản lý quỹ tiền mặt đầu ngày
              </h1>
              <span className="badge badge-sm uppercase bg-purple-50 text-purple-700 border-purple-200 font-semibold px-2.5 py-2">
                Quỹ két
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Chi nhánh: <strong className="text-slate-700">{activeStore?.name || "Tất cả"}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            type="button"
            className="btn btn-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border-none rounded-xl font-medium px-4 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>
      </div>

      {/* ── Top 3 KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Quỹ tiền mặt hiện tại */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/5 rounded-bl-full pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quỹ tiền mặt hiện tại</span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-purple-700 tracking-tight my-2">
              {currentCashVal.toLocaleString("vi-VN")} <span className="text-xs font-bold text-purple-500">đ</span>
            </div>
            <p className="text-xs text-slate-400">Số dư tiền mặt khả dụng tại két chi nhánh</p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Cập nhật theo thực tế</span>
            <button
              onClick={handleOpenAdjustModal}
              type="button"
              className="btn btn-sm bg-purple-600 hover:bg-purple-700 text-white border-none font-semibold px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-purple-500/20"
            >
              <Wrench className="w-3.5 h-3.5" />
              Điều chỉnh quỹ
            </button>
          </div>
        </div>

        {/* Card 2: Tiền đầu ngày */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-teal-500/5 rounded-bl-full pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiền đầu ngày</span>
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Banknote className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-teal-600 tracking-tight my-2">
              {beginningCashVal.toLocaleString("vi-VN")} <span className="text-xs font-bold text-teal-500">đ</span>
            </div>
            <p className="text-xs text-slate-400">Số dư quỹ két chốt mở cửa đầu ngày</p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Cấu hình đầu ngày</span>
            <button
              onClick={handleOpenBeginningModal}
              type="button"
              className="btn btn-sm bg-teal-600 hover:bg-teal-700 text-white border-none font-semibold px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-teal-500/20"
            >
              <Wrench className="w-3.5 h-3.5" />
              Cập nhật đầu ngày
            </button>
          </div>
        </div>

        {/* Card 3: Nhật ký biến động */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/5 rounded-bl-full pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng giao dịch quỹ</span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Coins className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-indigo-600 tracking-tight my-2">
              {histories.length} <span className="text-xs font-bold text-indigo-400">bản ghi</span>
            </div>
            <p className="text-xs text-slate-400">Lịch sử nạp/rút & điều chỉnh quỹ</p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Biến động gần nhất:</span>
            <span className="font-bold text-slate-700">
              {histories.length > 0 ? new Date(histories[0].created_at).toLocaleDateString("vi-VN") : "Chưa có"}
            </span>
          </div>
        </div>

      </div>

      {/* ── Transaction History Section ── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        
        {/* Table Header & Search Tool */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-base text-slate-900 tracking-tight">
              Lịch sử biến động quỹ tiền mặt
            </h3>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Tìm theo nội dung, nhân viên..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="input input-sm w-full bg-slate-50 border border-slate-200 rounded-xl text-xs pl-9 pr-4 focus:outline-none focus:border-purple-500 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="table w-full text-slate-800">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-150 text-slate-600 text-xs font-semibold uppercase">
                <th className="w-16 text-center">STT</th>
                <th className="cursor-pointer hover:bg-slate-100/60" onClick={() => handleSort("created_at")}>
                  <div className="flex items-center gap-1">
                    Ngày giao dịch
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="cursor-pointer hover:bg-slate-100/60" onClick={() => handleSort("employee")}>
                  <div className="flex items-center gap-1">
                    Người thực hiện
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="text-right cursor-pointer hover:bg-slate-100/60" onClick={() => handleSort("amount")}>
                  <div className="flex items-center gap-1 justify-end">
                    Số tiền biến động
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th>Loại</th>
                <th>Nội dung diễn giải</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <History className="w-8 h-8 text-slate-300" />
                      <span>Không tìm thấy lịch sử biến động quỹ nào.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => {
                  const num = getAmountColorAndSign(item);
                  return (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="text-center font-medium text-slate-400">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="text-slate-650 font-medium">
                        {new Date(item.created_at).toLocaleString("vi-VN")}
                      </td>
                      <td className="font-semibold text-slate-800">
                        {item.employee?.full_name || "Hệ thống"}
                      </td>
                      <td className={`text-right ${num.className}`}>
                        {num.icon}
                        {num.text}
                      </td>
                      <td>
                        <span className="badge badge-sm uppercase bg-slate-100 text-slate-600 border-slate-200 font-semibold px-2 py-1">
                          {formatTransactionType(item.type)}
                        </span>
                      </td>
                      <td className="text-slate-600 max-w-sm truncate" title={item.description}>
                        {item.description}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        {totalItems > 0 && (
          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-150 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <span className="text-xs text-slate-500">
                Hiển thị <span className="font-semibold text-slate-700">{indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)}</span> của <span className="font-semibold text-slate-700">{totalItems}</span> bản ghi
              </span>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Mỗi trang:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="select select-bordered select-xs bg-white text-slate-800 text-xs border-slate-200 focus:outline-none rounded-lg"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-xs btn-outline border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-50 rounded-lg"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentPage(i + 1)}
                    className={`btn btn-xs rounded-lg min-w-[28px] ${
                      currentPage === i + 1
                        ? "bg-purple-600 text-white font-bold border-none"
                        : "btn-outline border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-xs btn-outline border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-50 rounded-lg"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal 1: Nhập lại quỹ tiền mặt */}
      <ModalPortal isOpen={isAdjustModalOpen}>
        <div className="modal-box bg-white max-w-md p-6 rounded-3xl relative shadow-2xl border border-slate-100">
          <button
            type="button"
            onClick={() => setIsAdjustModalOpen(false)}
            className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Nhập lại quỹ tiền mặt
              </h3>
              <p className="text-xs text-slate-400">Điều chỉnh số dư két tiền mặt hiện tại</p>
            </div>
          </div>

          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Số tiền mặt mới (VNĐ) <span className="text-red-500">*</span>
              </label>
              <MoneyInput
                value={modalAmount}
                onChange={(val) => setModalAmount(val)}
                placeholder="Nhập số tiền"
                required
              />
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed bg-purple-50/60 p-3 rounded-2xl border border-purple-100">
                Chức năng <strong className="text-purple-700">Nhập lại quỹ tiền mặt</strong> giúp cập nhật lại số dư két mặt thực tế khi có chênh lệch.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="btn btn-sm bg-slate-100 hover:bg-slate-200 text-slate-600 border-none rounded-xl font-medium px-4 h-[36px]"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-sm bg-purple-600 hover:bg-purple-700 text-white border-none font-semibold px-6 rounded-xl h-[36px] shadow-sm shadow-purple-500/20"
              >
                {loading ? "Đang xử lý..." : "Cập nhật quỹ"}
              </button>
            </div>
          </form>
        </div>
      </ModalPortal>

      {/* Modal 2: Cập nhật tiền đầu ngày */}
      <ModalPortal isOpen={isBeginningModalOpen}>
        <div className="modal-box bg-white max-w-md p-6 rounded-3xl relative shadow-2xl border border-slate-100">
          <button
            type="button"
            onClick={() => setIsBeginningModalOpen(false)}
            className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Cập nhật tiền đầu ngày
              </h3>
              <p className="text-xs text-slate-400">Thay đổi số dư quỹ két chốt mở cửa</p>
            </div>
          </div>

          <form onSubmit={handleBeginningSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Số tiền đầu ngày (VNĐ) <span className="text-red-500">*</span>
              </label>
              <MoneyInput
                value={modalAmount}
                onChange={(val) => setModalAmount(val)}
                placeholder="Nhập số tiền"
                required
              />
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed bg-teal-50/60 p-3 rounded-2xl border border-teal-100">
                Chức năng <strong className="text-teal-700">Cập nhật tiền đầu ngày</strong> cho phép đặt lại hạn mức quỹ ban đầu cho cửa hàng.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsBeginningModalOpen(false)}
                className="btn btn-sm bg-slate-100 hover:bg-slate-200 text-slate-600 border-none rounded-xl font-medium px-4 h-[36px]"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-sm bg-teal-600 hover:bg-teal-700 text-white border-none font-semibold px-6 rounded-xl h-[36px] shadow-sm shadow-teal-500/20"
              >
                {loading ? "Đang xử lý..." : "Cập nhật đầu ngày"}
              </button>
            </div>
          </form>
        </div>
      </ModalPortal>

    </div>
  );
};

