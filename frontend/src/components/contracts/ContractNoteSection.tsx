import React from "react";

export interface NoteSectionProps {
  state: any;
  onChange: (updates: any) => void;
}

export const ContractNoteSection: React.FC<NoteSectionProps> = ({
  state,
  onChange,
}) => {
  const labelClass =
    "w-[150px] text-right pr-4 font-bold text-slate-700 shrink-0 text-sm select-none";

  return (
    <div className="space-y-4">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div className="col-span-1 md:col-span-2 flex items-start">
          <label className={`${labelClass} mt-1.5`}>Ghi chú</label>
          <div className="grow">
            <textarea
              placeholder="Nhập ghi chú chi tiết..."
              value={state.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              className="textarea textarea-bordered w-full bg-white border-slate-200 text-slate-800 rounded-lg h-20 focus:outline-none text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
