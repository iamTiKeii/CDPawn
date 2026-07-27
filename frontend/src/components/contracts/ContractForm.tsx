import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, BookOpen, Info, Printer } from "lucide-react";
import type { ContractFormConfig } from "./contract.config";
import { ContractCustomerSection, formatDateForInput } from "./ContractCustomerSection";
import { ContractGoodsSection, ContractAssetAttributesSection } from "./ContractGoodsSection";
import { ContractLoanSection } from "./ContractLoanSection";
import { ContractInterestSection } from "./ContractInterestSection";
import { ContractFinanceSection } from "./ContractFinanceSection";
import { ContractNoteSection } from "./ContractNoteSection";
import { StandardLoanInfoSection } from "./StandardLoanInfoSection";
import { convertDaysToDisplayUnit } from "../../utils/durationUtils";

export interface ContractFormProps {
  config: ContractFormConfig;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void | Promise<void>;
  onPrint?: (contractData: any) => void;
  onPrintReceipt?: (contractData: any) => void;
  initialData?: any; // populated when editing or newly created
  // lookup collections
  staffs: any[];
  collaborators: any[];
  commodities?: any[];
  interestTypes: any[];
  // view history callback
  onViewHistory?: (customerId: string, name: string) => void;
  // default next code index
  defaultCodeNumber?: number;
}

export const ContractForm: React.FC<ContractFormProps> = ({
  config,
  isOpen,
  onClose,
  onSubmit,
  onPrint,
  onPrintReceipt,
  initialData,
  staffs,
  collaborators,
  commodities = [],
  interestTypes,
  onViewHistory,
  defaultCodeNumber = 1,
}) => {
  const [state, setState] = useState<any>({
    customerType: "new",
    customerId: "",
    customerName: "",
    customerIdCard: "",
    customerIdCardDate: "",
    customerIdCardPlace: "",
    customerPhone: "",
    customerAddress: "",
    customerSearchQuery: "",

    contractCodeNumber: defaultCodeNumber,

    loanAmount: "",
    repaymentAmount: "",
    loanDate: new Date().toISOString().split("T")[0],
    loanDays: 50,
    installmentCycles: 50,
    installmentPeriod: 1,
    installmentPeriodType: "daily",

    commodityId: "",
    assetName: "",
    licensePlate: "",
    chassisNumber: "",
    engineNumber: "",

    interestRate: "1",
    interestPeriod: 10,
    interestType: "",
    isUpfrontInterest: false,

    staffId: "",
    collaboratorId: "",
    notes: "",
  });

  const updateState = (updates: any) => {
    setState((prev: any) => ({ ...prev, ...updates }));
  };

  // Sync state with initialData when editing or after creation
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const codeNum =
          Number(initialData.contract_code?.match(/\d+/)?.[0]) ||
          defaultCodeNumber;

        const itCode = initialData.interest_type?.code ||
          interestTypes.find((t) => t.id === initialData.interest_type_id)?.code || "";

        const rawDays = initialData.loan_duration || initialData.loan_days || initialData.loan_term_days || 30;
        const rawPeriod = initialData.period_value || initialData.interest_period || 10;

        setState({
          customerType: "existing",
          contractCode: initialData.contract_code || "",
          customerId: initialData.customer_id || "",
          customerName: initialData.customer?.full_name || initialData.investor_name || "",
          customerIdCard: initialData.customer?.identity_card_number || initialData.investor_id_card || "",
          customerIdCardDate: formatDateForInput(initialData.customer?.identity_card_date),
          customerIdCardPlace: initialData.customer?.identity_card_place || "",
          customerPhone: initialData.customer?.phone || initialData.investor_phone || "",
          customerAddress: initialData.customer?.address || initialData.investor_address || "",
          customerSearchQuery: initialData.customer?.full_name || initialData.investor_name || "",

          contractCodeNumber: codeNum,
          loanAmount: initialData.disbursed_amount || initialData.loan_amount || initialData.amount || "",
          repaymentAmount: initialData.repayment_amount || "",
          loanDate: formatDateForInput(initialData.loan_date || initialData.start_date || initialData.investment_date) || new Date().toISOString().split("T")[0],
          loanDays: convertDaysToDisplayUnit(rawDays, itCode),
          installmentCycles: initialData.installment_cycles || 50,
          installmentPeriod: initialData.cycle_days || 1,
          installmentPeriodType: initialData.period_type || "daily",

          commodityId: initialData.commodity_id || "",
          assetName: initialData.asset_name || "",
          licensePlate: initialData.license_plate || "",
          chassisNumber: initialData.chassis_number || "",
          engineNumber: initialData.engine_number || "",

          interestRate: initialData.interest_rate !== undefined && initialData.interest_rate !== null ? String(initialData.interest_rate) : "1",
          interestPeriod: convertDaysToDisplayUnit(rawPeriod, itCode),
          interestType: initialData.interest_type_id || "",
          isUpfrontInterest: !!(initialData.is_upfront_interest || initialData.is_upfront_collected),

          staffId: initialData.collector_id || "",
          collaboratorId: initialData.collaborator_id || "",
          notes: initialData.notes || "",
        });
      } else {
        // Reset to default new form
        setState({
          customerType: "new",
          contractCode: "",
          customerId: "",
          customerName: "",
          customerIdCard: "",
          customerIdCardDate: "",
          customerIdCardPlace: "",
          customerPhone: "",
          customerAddress: "",
          customerSearchQuery: "",

          contractCodeNumber: defaultCodeNumber,

          loanAmount: "",
          repaymentAmount: "",
          loanDate: new Date().toISOString().split("T")[0],
          loanDays: 50,
          installmentCycles: 50,
          installmentPeriod: 1,
          installmentPeriodType: "daily",

          commodityId: "",
          assetName: "",
          licensePlate: "",
          chassisNumber: "",
          engineNumber: "",

          interestRate: "1",
          interestPeriod: 10,
          interestType: "",
          isUpfrontInterest: false,

          staffId: staffs[0]?.id || "",
          collaboratorId: "",
          notes: "",
        });
      }
    }
  }, [isOpen, initialData, defaultCodeNumber, staffs]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(state);
  };

  return createPortal(
    <div className="modal modal-open z-[9999]">
      <div className="modal-box bg-white border border-slate-200 text-slate-800 rounded-2xl max-w-6xl p-6 relative">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
          <h3 className="font-extrabold text-base text-slate-800 uppercase">
            {initialData ? `Chỉnh sửa ${config.title}` : `Thêm mới ${config.title}`}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm text-slate-400 hover:bg-slate-100"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-sm text-slate-700">

          {/* ── PHẦN 1: Thông tin khách hàng — full width ── */}
          {config.showCustomer && (
            <ContractCustomerSection
              state={state}
              onChange={updateState}
              isEditMode={!!initialData}
              onViewHistory={onViewHistory}
              config={config}
            />
          )}

          {/* ── PHẦN 2+3: 2 cột — Khoản vay (trái) & Thông tin khác (phải) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-5">

            {/* CỘT TRÁI — Thông tin khoản vay */}
            {(config.showGoods || config.showLoan || config.showInterest) && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="font-bold text-blue-600 text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5 uppercase">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Thông tin khoản vay</span>
                </h4>

                {config.type === "pawn" || config.type === "unsecured" ? (
                  <StandardLoanInfoSection
                    state={state}
                    onChange={updateState}
                    config={config}
                    commodities={commodities}
                    interestTypes={interestTypes}
                  />
                ) : (
                  <>
                    {config.showGoods && (
                      <ContractGoodsSection
                        state={state}
                        onChange={updateState}
                        commodities={commodities}
                      />
                    )}

                    {config.showLoan && (
                      <ContractLoanSection
                        state={state}
                        onChange={updateState}
                        config={config}
                        interestTypes={interestTypes}
                      />
                    )}

                    {config.showInterest && (
                      <ContractInterestSection
                        state={state}
                        onChange={updateState}
                        interestTypes={interestTypes}
                        config={config}
                      />
                    )}
                  </>
                )}

                {/* Asset attributes đi kèm cột trái (chỉ khi có showGoods) */}
                {config.showGoods && (
                  <ContractAssetAttributesSection
                    state={state}
                    onChange={updateState}
                    commodities={commodities}
                  />
                )}
              </div>
            )}

            {/* CỘT PHẢI — Thông tin khác */}
            {(config.showFinance || config.showNotes) && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="font-bold text-blue-600 text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5 uppercase">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Thông tin khác</span>
                </h4>

                {config.showFinance && (
                  <ContractFinanceSection
                    state={state}
                    onChange={updateState}
                    staffs={staffs}
                    collaborators={collaborators}
                  />
                )}

                {config.showNotes && (
                  <ContractNoteSection
                    state={state}
                    onChange={updateState}
                  />
                )}
              </div>
            )}

          </div>{/* end 2-col grid */}

          {config.type === "installment" && (
            <div className="text-red-500 text-xs font-semibold leading-relaxed border-t border-slate-100 pt-3">
              * Lưu ý: Theo Bộ luật Dân sự, lãi suất cho vay tối đa không được vượt quá 20%/năm. Vượt quá mức này là vi phạm pháp luật. Đặc biệt, hành vi cho vay với lãi suất từ 100%/năm trở lên có thể bị truy cứu trách nhiệm hình sự theo Điều 201 Bộ luật Hình sự.
            </div>
          )}

          {/* Modal Actions Footer */}
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 mt-6">
            {initialData && (
              <div className="flex items-center gap-2 mr-auto">
                <button
                  type="button"
                  onClick={() => onPrint?.(initialData)}
                  className="btn bg-amber-500 hover:bg-amber-600 border-none text-slate-950 h-10 min-h-[40px] px-4 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>🖨️ In hợp đồng</span>
                </button>
                {config.type === "pawn" && (
                  <button
                    type="button"
                    onClick={() => onPrintReceipt?.(initialData)}
                    className="btn bg-blue-600 hover:bg-blue-700 border-none text-white h-10 min-h-[40px] px-4 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>📜 In biên nhận</span>
                  </button>
                )}
              </div>
            )}
            <button
              type="submit"
              className="btn bg-[#1abc9c] hover:bg-[#16a085] border-none text-white h-10 min-h-[40px] px-6 text-sm font-bold rounded-lg transition-colors"
            >
              {initialData ? "Cập nhật" : "+ Thêm mới"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn bg-slate-400 hover:bg-slate-500 border-none text-white h-10 min-h-[40px] px-6 text-sm font-bold rounded-lg transition-colors"
            >
              X Đóng
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
