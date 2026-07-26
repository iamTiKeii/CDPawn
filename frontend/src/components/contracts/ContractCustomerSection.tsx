import React from "react";
import { History } from "lucide-react";
import { CustomerLookup } from "../shared/CustomerLookup";

export interface CustomerSectionProps {
  state: any;
  onChange: (updates: any) => void;
  isEditMode: boolean;
  onViewHistory?: (customerId: string, name: string) => void;
  config?: any;
}

export const formatDateForInput = (val: any): string => {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

export const ContractCustomerSection: React.FC<CustomerSectionProps> = ({
  state,
  onChange,
  isEditMode,
  onViewHistory,
  config,
}) => {


  let prefix = "HĐ";
  if (config?.type === "pawn") prefix = "CĐ";
  else if (config?.type === "unsecured") prefix = "TC";
  else if (config?.type === "installment") prefix = "TG";
  else if (config?.type === "capital") prefix = "NV";

  let suffix = "";
  if (isEditMode && state.contractCode) {
    prefix = state.contractCode.slice(0, 2);
    suffix = state.contractCode.slice(2);
  } else {
    const num = state.contractCodeNumber || 1;
    suffix = `-${num}`;
  }

  const labelClass =
    "w-[120px] text-right pr-3 font-bold text-slate-700 shrink-0 text-sm select-none";

  return (
    <div className="space-y-4">
      {/* Centered Radio Selection */}
      {!isEditMode && (
        <div className="flex justify-center gap-6 mt-2 mb-4">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 text-sm">
            <input
              type="radio"
              name="customerType"
              checked={state.customerType === "new"}
              onChange={() =>
                onChange({
                  customerType: "new",
                  customerId: "",
                  customerName: "",
                  customerIdCard: "",
                  customerIdCardDate: "",
                  customerIdCardPlace: "",
                  customerPhone: "",
                  customerAddress: "",
                  customerSearchQuery: "",
                })
              }
              className="radio radio-sm radio-primary"
            />
            <span>Khách mới</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 text-sm">
            <input
              type="radio"
              name="customerType"
              checked={state.customerType === "existing"}
              onChange={() =>
                onChange({
                  customerType: "existing",
                  customerId: "",
                  customerName: "",
                  customerIdCard: "",
                  customerIdCardDate: "",
                  customerIdCardPlace: "",
                  customerPhone: "",
                  customerAddress: "",
                  customerSearchQuery: "",
                })
              }
              className="radio radio-sm radio-primary"
            />
            <span>Khách cũ</span>
          </label>

          {/* Eye Icon for History */}
          {state.customerType === "existing" && onViewHistory && (
            <button
              type="button"
              onClick={() => {
                if (state.customerId) {
                  onViewHistory(state.customerId, state.customerName);
                }
              }}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                !state.customerId
                  ? "opacity-40 cursor-not-allowed text-slate-400 border-slate-200 bg-slate-50"
                  : "text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 cursor-pointer"
              }`}
              title="Xem lịch sử giao dịch của khách"
              disabled={!state.customerId}
            >
              <History className="w-3.5 h-3.5" />
              <span>Lịch sử GD</span>
            </button>
          )}
        </div>
      )}

      {/* Grid Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
        {/* Customer Name */}
        <div className="flex items-center">
          <label className={labelClass}>
            Tên khách hàng <span className="text-red-500">*</span>
          </label>
          <div className="grow">
            {state.customerType === "new" ? (
              <input
                type="text"
                placeholder="Nhập họ và tên"
                value={state.customerName}
                onChange={(e) => onChange({ customerName: e.target.value })}
                className="input input-bordered w-full bg-white border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none h-10"
                required
              />
            ) : (
              <CustomerLookup
                value={state.customerSearchQuery}
                onChange={(val) => onChange({ customerSearchQuery: val })}
                onSelect={(c: any) => {
                  onChange({
                    customerId: c.id,
                    customerSearchQuery: c.full_name,
                    customerName: c.full_name,
                    customerIdCard: c.identity_card_number || "",
                    customerIdCardDate: formatDateForInput(c.identity_card_date),
                    customerIdCardPlace: c.identity_card_place || "",
                    customerPhone: c.phone || "",
                    customerAddress: c.address || "",
                  });
                }}
                onClear={() => {
                  onChange({
                    customerId: "",
                    customerName: "",
                    customerIdCard: "",
                    customerIdCardDate: "",
                    customerIdCardPlace: "",
                    customerPhone: "",
                    customerAddress: "",
                  });
                }}
                required
              />
            )}
          </div>
        </div>

        {/* Contract Code Number */}
        <div className="flex items-center">
          <label className={labelClass}>
            Mã hợp đồng <span className="text-red-500">*</span>
          </label>
          <div className="grow">
            <label className="input input-bordered flex items-center gap-2 bg-slate-100/90 border-slate-200 rounded-lg h-10 w-full cursor-not-allowed">
              <span className="label font-extrabold text-slate-700 text-sm select-none border-r border-slate-300 pr-3 py-1">
                {prefix}
              </span>
              <input
                type="text"
                value={suffix}
                readOnly
                disabled
                className="grow font-bold text-slate-800 text-sm bg-transparent outline-none cursor-not-allowed"
              />
            </label>
          </div>
        </div>

        {/* CCCD / Passport */}
        <div className="flex items-center">
          <label className={labelClass}>Số CCCD/Hộ chiếu</label>
          <div className="grow">
            <input
              type="text"
              placeholder="CCCD/CMND khách hàng..."
              value={state.customerIdCard}
              onChange={(e) => onChange({ customerIdCard: e.target.value })}
              className="input input-bordered w-full bg-white border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none h-10"
            />
          </div>
        </div>

        {/* Card Details: Ngày cấp & Nơi cấp (Shown for both new and existing customers) */}
        <div className="flex items-center">
          <label className={labelClass}>Ngày cấp</label>
          <div className="grow">
            <input
              type="date"
              value={formatDateForInput(state.customerIdCardDate)}
              onChange={(e) =>
                onChange({ customerIdCardDate: e.target.value })
              }
              className="input input-bordered w-full bg-white border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none h-10"
            />
          </div>
        </div>

        <div className="flex items-center">
          <label className={labelClass}>Nơi cấp</label>
          <div className="grow">
            <input
              type="text"
              placeholder="Nơi cấp CCCD..."
              value={state.customerIdCardPlace}
              onChange={(e) =>
                onChange({ customerIdCardPlace: e.target.value })
              }
              className="input input-bordered w-full bg-white border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none h-10"
            />
          </div>
        </div>

        {/* Phone number */}
        <div className="flex items-center">
          <label className={labelClass}>Số điện thoại</label>
          <div className="grow">
            <input
              type="text"
              placeholder="09xx..."
              value={state.customerPhone}
              onChange={(e) => onChange({ customerPhone: e.target.value })}
              className="input input-bordered w-full bg-white border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none h-10"
            />
          </div>
        </div>

        {/* Address */}
        <div className="flex items-center md:col-span-2">
          <label className={labelClass}>Địa chỉ</label>
          <div className="grow">
            <input
              type="text"
              placeholder="Địa chỉ khách hàng..."
              value={state.customerAddress}
              onChange={(e) => onChange({ customerAddress: e.target.value })}
              className="input input-bordered w-full bg-white border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none h-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
