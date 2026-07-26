import React from "react";

export interface FinanceSectionProps {
  state: any;
  onChange: (updates: any) => void;
  staffs: any[];
  collaborators: any[];
}

export const ContractFinanceSection: React.FC<FinanceSectionProps> = ({
  state,
  onChange,
  staffs,
  collaborators,
}) => {
  const labelClass =
    "w-[120px] text-right pr-3 font-bold text-slate-700 shrink-0 text-sm select-none";

  return (
    <div className="space-y-4">

      <div className="space-y-3">
        {/* Staff collector selector */}
        <div className="flex items-center">
          <label className={labelClass}>Nhân viên thu</label>
          <div className="grow">
            <select
              value={state.staffId}
              onChange={(e) => onChange({ staffId: e.target.value })}
              className="select select-bordered w-full bg-white border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none h-10 text-sm"
              required
            >
              <option value="">-- Chọn nhân viên --</option>
              {staffs.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Collaborator selector */}
        <div className="flex items-center">
          <label className={labelClass}>Cộng tác viên</label>
          <div className="grow">
            <select
              value={state.collaboratorId}
              onChange={(e) => onChange({ collaboratorId: e.target.value })}
              className="select select-bordered w-full bg-white border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none h-10 text-sm"
            >
              <option value="">-- Chọn cộng tác viên --</option>
              {collaborators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
