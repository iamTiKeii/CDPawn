import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";

interface Contract {
  id: string;
  type: string;
  typeLabel: string;
  contract_code: string;
  loan_date: string;
  loan_amount: number;
  debt_amount: number;
  interest_rate: string;
  paid_interest: number;
  overdue_amount: number;
  status: string;
  statusLabel: string;
}

interface CustomerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
}

export const CustomerHistoryModal: React.FC<CustomerHistoryModalProps> = ({
  isOpen,
  onClose,
  customerId,
  customerName,
}) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !customerId) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/customers/${customerId}/contracts`);
        setContracts(res.data);
      } catch (err) {
        console.error("Error loading customer contracts history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isOpen, customerId]);

  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
      .format(val)
      .replace("₫", "");
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "---";
    const date = new Date(dateStr);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // Contracts modal summary metrics calculations
  const totalContractsCount = contracts.length;
  const activeContractsCount = contracts.filter((c) => c.status === "active").length;
  const closedContractsCount = contracts.filter((c) => c.status === "closed" || c.status === "finished").length;
  const deletedContractsCount = contracts.filter((c) => c.status === "deleted" || c.status === "cancelled").length;

  const totalDisbursedSum = contracts.reduce((sum, c) => sum + c.loan_amount, 0);
  const totalRemainingDebtSum = contracts.reduce((sum, c) => sum + c.debt_amount, 0);
  const totalPaidInterestSum = contracts.reduce((sum, c) => sum + c.paid_interest, 0);

  return (
    <div className="modal modal-open">
      <div className="modal-box bg-white border border-slate-200 text-slate-800 rounded-2xl max-w-5xl p-0 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-800">
            Danh sách hợp đồng của khách hàng <span className="text-blue-600 font-extrabold">{customerName}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-xs text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-md text-amber-500"></span>
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Khách hàng này chưa có hợp đồng giao dịch nào.
            </div>
          ) : (
            <>
              {/* Two column grid of statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column Box */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-2 text-xs text-slate-700 bg-slate-50/30">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">Tổng hợp đồng</span>
                    <span className="font-bold">{totalContractsCount}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">Dư nợ gốc</span>
                    <span className="font-extrabold text-blue-600">{formatCurrency(totalDisbursedSum)} VNĐ</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">Dư nợ hiện tại</span>
                    <span className="font-extrabold text-blue-600">{formatCurrency(totalRemainingDebtSum)} VNĐ</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">Tiền nợ</span>
                    <span className="font-extrabold text-blue-600">0 VNĐ</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Lãi đã trả</span>
                    <span className="font-extrabold text-blue-600">{formatCurrency(totalPaidInterestSum)} VNĐ</span>
                  </div>
                </div>

                {/* Right Column Box */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-2 text-xs text-slate-700 bg-slate-50/30">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">HĐ đang vay</span>
                    <span className="font-extrabold text-blue-600">{activeContractsCount}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">HĐ đã kết thúc</span>
                    <span className="font-extrabold text-blue-600">{closedContractsCount}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">HĐ chậm thanh toán</span>
                    <span className="font-extrabold text-amber-500">0</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">HĐ quá hạn</span>
                    <span className="font-extrabold text-red-500">0</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">HĐ đã xóa</span>
                    <span className="font-bold text-slate-600">{deletedContractsCount}</span>
                  </div>
                </div>
              </div>

              {/* Detailed contracts list table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="table w-full text-slate-700 text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-250 text-slate-500 text-[10px] font-bold">
                      <th className="w-12 text-center">#</th>
                      <th>Loại hình</th>
                      <th>Mã HĐ</th>
                      <th>Ngày vay</th>
                      <th>Dư nợ gốc</th>
                      <th>Dư nợ hiện tại</th>
                      <th>Lãi suất</th>
                      <th>Lãi đã trả</th>
                      <th>Tiền nợ</th>
                      <th>Tình trạng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((con, idx) => (
                      <tr key={con.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="text-center font-medium text-slate-400">{idx + 1}</td>
                        <td className="font-semibold">{con.typeLabel}</td>
                        <td className="font-semibold text-blue-600">{con.contract_code}</td>
                        <td>{formatDate(con.loan_date)}</td>
                        <td className="font-bold text-blue-600">{formatCurrency(con.loan_amount)}</td>
                        <td className="font-bold text-blue-600">{formatCurrency(con.debt_amount)}</td>
                        <td>{con.interest_rate}</td>
                        <td className="font-bold text-slate-700">{formatCurrency(con.paid_interest)}</td>
                        <td className="font-bold text-slate-700">0</td>
                        <td>
                          <span className={`badge badge-sm font-bold border-none text-white rounded py-2 px-2.5 ${
                            con.status === "active" ? "bg-blue-500" : "bg-slate-400"
                          }`}>
                            {con.statusLabel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
