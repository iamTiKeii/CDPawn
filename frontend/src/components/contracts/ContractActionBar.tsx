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
    <div className="flex flex-wrap gap-2 justify-end items-center py-1">
      {actions.map((act, idx) => {
        const Icon = act.icon;
        return (
          <button
            key={idx}
            type="button"
            onClick={act.onClick}
            disabled={act.disabled}
            className={`btn btn-sm rounded-xl px-3.5 h-8 font-bold flex items-center gap-1.5 border transition-all duration-150 text-xs shadow-2xs ${
              act.disabled
                ? "bg-slate-100 text-slate-400 border-slate-200/80 cursor-not-allowed"
                : act.colorClass || "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
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
