import React from "react";

interface ActionButton {
  label: string;
  icon?: React.ComponentType<any>;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  colorClass?: string;
  disabled?: boolean;
}

interface ContractActionBarProps {
  actions: ActionButton[];
}

export const ContractActionBar: React.FC<ContractActionBarProps> = ({ actions }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-end items-center">
      {actions.map((act, idx) => {
        const Icon = act.icon;
        return (
          <button
            key={idx}
            type="button"
            onClick={act.onClick}
            disabled={act.disabled}
            className={`btn btn-xs rounded-lg px-3 py-1.5 h-7 font-bold flex items-center gap-1.5 border border-slate-200 transition-all text-[10px] ${
              act.disabled
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : act.colorClass || "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            <span>{act.label}</span>
          </button>
        );
      })}
    </div>
  );
};
