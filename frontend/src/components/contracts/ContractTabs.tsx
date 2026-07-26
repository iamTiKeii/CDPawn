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
    <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
              isActive
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
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
