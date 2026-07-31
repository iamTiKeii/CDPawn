import React from "react";

interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  color?: string;
}

interface ContractTabsProps {
  tabs: TabItem[];
  activeTab: string;
  setActiveTab: (id: string) => void;
}

export const ContractTabs: React.FC<ContractTabsProps> = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-wrap gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 shadow-inner">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-150 select-none ${
              isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 border-none font-extrabold scale-[1.02]"
                : "bg-transparent hover:bg-white/90 text-slate-600 hover:text-slate-900 border-none"
            }`}
            type="button"
          >
            {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : tab.color || "text-slate-500"}`} />}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
