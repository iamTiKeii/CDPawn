import React from "react";

interface StatCard {
  label: string;
  value: string | number;
  valueClass?: string;
}

interface ContractStatisticCardsProps {
  cards: StatCard[];
}

export const ContractStatisticCards: React.FC<ContractStatisticCardsProps> = ({ cards }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex flex-col justify-between"
        >
          <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">
            {card.label}
          </span>
          <span className={`text-sm font-extrabold mt-1.5 ${card.valueClass || "text-slate-850"}`}>
            {card.value}
          </span>
        </div>
      ))}
    </div>
  );
};
