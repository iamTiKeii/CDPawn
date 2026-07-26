import React from "react";

interface ContractSectionProps {
  title: string;
  icon?: React.ComponentType<any>;
  children: React.ReactNode;
  className?: string;
}

export const ContractSection: React.FC<ContractSectionProps> = ({
  title,
  icon: Icon,
  children,
  className = "",
}) => {
  return (
    <div className={`bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm ${className}`}>
      <h3 className="font-bold text-slate-850 text-sm flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
        {Icon && <Icon className="w-4 h-4 text-amber-500 shrink-0" />}
        <span>{title}</span>
      </h3>
      <div className="text-xs text-slate-700">{children}</div>
    </div>
  );
};
