import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, X, FileText } from "lucide-react";

interface ContractHeaderProps {
  title: string;
  code: string;
  status: string;
  statusLabel: string;
  loanDate?: string;
  customerName?: string;
  onRefresh?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const ContractHeader: React.FC<ContractHeaderProps> = ({
  title,
  code,
  status,
  statusLabel,
  loanDate,
  customerName,
  onRefresh,
  onClose,
  isModal = false,
}) => {
  // Determine badge colors based on status
  const getBadgeClass = () => {
    switch (status) {
      // Đang cầm / Đang vay / Đang trả góp
      case "active":
        return "bg-emerald-500 text-white border-none";
        
      // Đã tất toán / Đã chuộc / Kết thúc
      case "closed":
      case "completed":
        return "bg-slate-100 text-slate-500 border-slate-200";

      // Hôm nay đóng tiền / Hôm nay đóng họ
      case "today_pawn_interest":
      case "today_unsecured_interest":
      case "today_installment_due":
        return "bg-[#3b82f6] text-white border-none";

      // Đến ngày chuộc đồ / Đến hạn trả gốc
      case "due_pawn_contract":
      case "due_unsecured_contract":
        return "bg-[#2563eb] text-white border-none";

      // Chậm lãi / Chậm đóng / Chậm họ
      case "overdue":
      case "overdue_pawn_interest":
      case "overdue_unsecured_interest":
      case "overdue_installment_cycle":
        return "bg-[#ff9800] text-white border-none";

      // Trễ hạn / Nợ xấu / Quá hạn
      case "overdue_pawn_contract":
      case "overdue_unsecured_contract":
      case "overdue_unsecured_bad_debt":
      case "overdue_installment_bad_debt":
        return "bg-[#ef4444] text-white border-none";

      // Chờ thanh lý
      case "waiting_liquidation":
        return "bg-[#7c3aed] text-white border-none";

      // Đã thanh lý / Thanh lý
      case "liquidated":
        return "bg-slate-500 text-white border-none";

      case "cancelled":
        return "bg-red-500 text-white border-none";

      default:
        return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  if (isModal) {
    return (
      <div className="flex justify-between items-center border-b border-slate-200/80 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-2.5 rounded-2xl border border-amber-500/20">
            <FileText className="w-5 h-5 text-amber-600 shrink-0" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-extrabold text-lg text-slate-850 tracking-tight">
                {title}
              </h3>
              <span className="px-2.5 py-0.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-black text-xs tracking-wider">
                {code}
              </span>
              <span className={`badge badge-sm font-bold uppercase rounded-lg py-2 px-3 shadow-xs ${getBadgeClass()}`}>
                {statusLabel}
              </span>
            </div>
            {(customerName || loanDate) && (
              <div className="text-slate-500 text-xs mt-1 flex items-center gap-2 font-medium">
                {customerName && (
                  <span>
                    Khách hàng: <strong className="text-slate-800 font-bold">{customerName}</strong>
                  </span>
                )}
                {loanDate && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>Ngày lập: {loanDate}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm">
      <div className="flex items-center gap-4">
        <Link
          to="/contracts"
          className="btn btn-outline border-slate-200 hover:bg-slate-50 text-slate-600 btn-circle btn-sm flex items-center justify-center rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-850 flex items-center gap-2.5">
            <span>{title}:</span>
            <span className="px-3 py-0.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-black text-sm tracking-wider">
              {code}
            </span>
            <span className={`badge badge-sm font-bold uppercase rounded-lg py-2 px-3 ${getBadgeClass()}`}>
              {statusLabel}
            </span>
          </h1>
          {(customerName || loanDate) && (
            <p className="text-slate-500 text-xs mt-1 font-medium">
              {customerName && (
                <>
                  Khách hàng: <span className="text-slate-800 font-bold">{customerName}</span>
                </>
              )}
              {loanDate && (
                <>
                  <span className="mx-2 text-slate-300">•</span>
                  Ngày lập: {loanDate}
                </>
              )}
            </p>
          )}
        </div>
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="btn btn-outline border-slate-200 text-slate-600 btn-sm flex items-center gap-1 rounded-xl hover:bg-slate-50"
          type="button"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
