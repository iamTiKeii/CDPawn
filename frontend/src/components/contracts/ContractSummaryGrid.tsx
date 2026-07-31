import React from "react";

interface SummaryItem {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
  isRed?: boolean;
}

interface ContractSummaryGridProps {
  leftItems: SummaryItem[];
  rightItems: SummaryItem[];
}

export const ContractSummaryGrid: React.FC<ContractSummaryGridProps> = ({ leftItems, rightItems }) => {
  const renderItem = (item: SummaryItem, idx: number) => {
    return (
      <div
        key={idx}
        className="flex justify-between items-center border-b border-slate-200/60 pb-2.5 pt-1 last:border-none last:pb-0 text-xs hover:bg-slate-100/40 px-2.5 -mx-2.5 rounded-xl transition-colors"
      >
        <span className="text-slate-500 font-medium">{item.label}</span>
        <span className={`font-extrabold ${item.isRed ? "text-red-500" : "text-slate-800"} ${item.valueClass || ""}`}>
          {item.value}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-slate-50/70 border border-slate-200/80 p-5 md:p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 shadow-xs">
      <div className="space-y-1">
        {leftItems.map((item, idx) => renderItem(item, idx))}
      </div>
      <div className="space-y-1">
        {rightItems.map((item, idx) => renderItem(item, idx))}
      </div>
    </div>
  );
};
